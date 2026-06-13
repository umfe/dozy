import { $s, $sc, l } from '..'

/*
<div ref={outerContainer current}>
	<div>
		{children}
	</div>
</div>
*/
export type ScaleComputer = undefined | ((scaler: Scaler) => number)
export type ScaleIniter = (scaler: Scaler) => void
export type ScaleResponsiveOptions = {
	/**
	 * xls 横屏模式下的 base 乘数。
	 *
	 * 默认写成 `640 / 320`，方便直观看出是从 320 基准扩展到 640 基准。
	 */
	baseMultiplier?: number
	/**
	 * xls 横屏模式下的最大宽高比。
	 *
	 * 默认写成 `1.2`。
	 */
	xlsMaxAspectRatio?: number
	/** xls 状态变化时触发，方便业务侧保存状态。 */
	setXls?: (b: boolean) => void
}
class Scaler {
	heightElement!: HTMLElement
	widthElement!: HTMLElement
	offsetHorizontal = 8
	/** 未进入 xls 响应式扩展前的基础内容宽度，setBase 会更新这个值。 */
	sourceBase = 320
	#base = 320
	set base(val: number) {
		if ($sc(val)) this.#base = val
	}
	get base() {
		return this.#base
	}
	#mainScale = 1
	set mainScale(val: number) {
		this.#mainScale = val || 1
		this.onMainScaleChange?.(this.#mainScale)
		if (typeof window === 'undefined') return
		this.innerContainer.style.transform =
			'translateX(-50%) scale(' +
			(this.mainScale + this.offsetHorizontal / this.base) +
			', ' +
			this.mainScale +
			')'
	}
	get mainScale() {
		return this.#mainScale
	}
	#scaleComputer: ScaleComputer
	get scaleComputer() {
		return this.#scaleComputer
	}
	set scaleComputer(val: ScaleComputer) {
		if (val) {
			this.mainScale = val(this)
		}
		this.#scaleComputer = val
	}

	onMainScaleChange?: (scale: number) => void

	innerContainer
	/**
	 * 创建内部缩放器状态对象。
	 *
	 * @param innerContainer 需要接收宽度与 transform 更新的内部元素。
	 */
	constructor(innerContainer: HTMLElement) {
		this.innerContainer = innerContainer
	}
}

/**
 * 为固定宽度的内部容器启用响应式缩放行为。
 *
 * 典型结构：
 * - `outerContainer` 作为高度占位容器。
 * - 第一个子元素或显式传入的 `innerContainer` 会通过 CSS transform 进行视觉缩放。
 *
 * 运行时行为：
 * - 在非浏览器环境下会直接返回 `undefined`。
 * - 如果无法解析出有效的内部容器，会直接抛错。
 * - 会挂载 `resize` 和 `ResizeObserver` 监听。
 *
 * @param outerContainer 外层包裹元素。
 * @param initer 可选初始化器，用于配置内部 `Scaler` 实例。
 * @param innerContainer 可选的内部缩放元素，默认取 `outerContainer.children[0]`。
 * @returns 在浏览器环境下返回包含 `resizer`、`clean`、`setBase` 方法的对象；否则返回 `undefined`。
 */
export function enableScaler(
	outerContainer: HTMLElement,
	initer?: ScaleIniter,
	innerContainer?: HTMLElement,
) {
	if (typeof window === 'undefined') return
	innerContainer ||= outerContainer.children[0] as any
	if (!innerContainer || !(innerContainer instanceof HTMLElement))
		throw 'please make the right constructure'
	const scaler = new Scaler(innerContainer)
	initer?.(scaler)
	const outer = outerContainer.style
	outer.width = '0'
	outer.marginLeft = 'auto'
	outer.marginRight = 'auto'
	const inner = innerContainer.style
	inner.width = scaler.base + 'px'
	inner.height = 'fit-content'
	inner.transformOrigin = 'top center'
	inner.marginLeft = 'auto'
	inner.marginRight = 'auto'
	const resizer = () => {
		if (scaler.scaleComputer) {
			scaler.mainScale = scaler.scaleComputer(scaler)
		}
	}
	const thr = l.throttle(resizer)
	const setBase = (val: number) => {
		scaler.sourceBase = val
		scaler.base = val
		inner.width = scaler.base + 'px'
		thr()
	}
	window.addEventListener('resize', thr)
	resizer()
	// Fix: DevTools open on refresh or late mount may report stale clientWidth.
	// Use rAF + setTimeout fallback to guarantee re-measure after layout settles.
	requestAnimationFrame(() => requestAnimationFrame(resizer))
	const initTimer = setTimeout(resizer, 150)
	const ro = new ResizeObserver((entries) => {
		for (const entry of entries) {
			if (entry.target === innerContainer) {
				outerContainer.style.height = `${entry.contentRect.height * scaler.mainScale}px`
			}
			if (entry.target === scaler.heightElement || entry.target === scaler.widthElement) {
				resizer()
			}
		}
	})
	ro.observe(innerContainer)
	ro.observe(scaler.widthElement)
	ro.observe(scaler.heightElement)
	return {
		resizer,
		clean: () => {
			clearTimeout(initTimer)
			window.removeEventListener('resize', thr)
			ro.disconnect()
		},
		setBase,
	}
}

/**
 * 构建一个适用于常见视口布局的标准缩放初始化器。
 *
 * 返回的初始化器会配置宽高测量元素，并根据可用宽度与可选的最大宽高比计算缩放比例。
 *
 * @param args 初始化配置项。
 * @param args.maxAspectRatio 计算可用宽度时允许的最大 `width / height` 比例，默认 `Infinity`。
 * @param args.setFullScreenWidth 可选回调，用于接收计算后的可用宽度。
 * @param args.setFullContentHeight 可选回调，用于接收缩放后的虚拟内容高度。
 * @param args.setMainScale 可选回调，在主缩放值变化时触发。
 * @param args.offsetHorizontal 可选的水平像素补偿值，默认额外溢出 `8px`（左右各 `4px`）。
 * @param args.heightElement 可选高度测量元素，默认使用 `document.documentElement`。
 * @param args.widthElement 可选宽度测量元素，默认使用 `document.documentElement`。
 * @param args.base 可选基础内容宽度。
 * @param args.responsive 传入后启用 xls 横屏响应式：宽大于高时切换 base 与 maxAspectRatio，并同步 `html[data-xad-xls]`。
 * @returns 返回一个可供 `enableScaler` 使用的 `ScaleIniter` 函数。
 */
export const standardIniter: (args: {
	maxAspectRatio?: number
	setFullScreenWidth?: (x: number) => void
	setFullContentHeight?: (x: number) => void
	setMainScale?: (x: number) => void
	offsetHorizontal?: number
	heightElement?: HTMLElement
	widthElement?: HTMLElement
	base?: number
	responsive?: ScaleResponsiveOptions
}) => ScaleIniter =
	({
		maxAspectRatio = Infinity,
		setFullScreenWidth,
		setFullContentHeight,
		setMainScale,
		widthElement,
		heightElement,
		base,
		offsetHorizontal,
		responsive,
	}) =>
	(scaler) => {
		scaler.widthElement = widthElement || document.documentElement
		scaler.heightElement = heightElement || document.documentElement
		scaler.onMainScaleChange = setMainScale
		const originBase = ($sc(base) ? base : scaler.base) as number
		scaler.sourceBase = originBase
		scaler.base = originBase
		if ($sc(offsetHorizontal)) scaler.offsetHorizontal = offsetHorizontal
		scaler.scaleComputer = (scaler) => {
			if (typeof window === 'undefined') return 1
			const welement = scaler.widthElement
			const helement = scaler.heightElement
			const w = welement.clientWidth
			const h = helement.clientHeight
			const xls = !!responsive && w > h
			const finalBase = xls
				? scaler.sourceBase * (responsive.baseMultiplier ?? 640 / 320)
				: scaler.sourceBase
			const finalMaxAspectRatio = xls ? (responsive.xlsMaxAspectRatio ?? 1.2) : maxAspectRatio
			// xls 状态交给 html 属性驱动 Tailwind 自定义变体，比如 xls:grid-cols-5。
			document.documentElement.dataset.xadXls = xls ? '1' : '0'
			responsive?.setXls?.(xls)
			scaler.base = finalBase
			scaler.innerContainer.style.width = scaler.base + 'px'
			const fullScreenWidth = Math.min(w, h * finalMaxAspectRatio)
			const fscl = fullScreenWidth / scaler.base
			setFullScreenWidth?.(fullScreenWidth) // setFullScreenWidth 此引用不会过期
			setFullContentHeight?.(h / fscl)
			return fscl
		}
	}
