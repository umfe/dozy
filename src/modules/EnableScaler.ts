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
class Scaler {
	heightElement!: HTMLElement
	widthElement!: HTMLElement
	offsetHorizontal = 0.01
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
			(this.mainScale + this.offsetHorizontal) +
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
		scaler.base = val
		inner.width = scaler.base + 'px'
		thr()
	}
	window.addEventListener('resize', thr)
	resizer()
	// const observer = new MutationObserver(() => {
	// 	const style = document.documentElement.style
	// 	scaler.mainScale = Number(style.getPropertyValue('--main-scale')) || 1
	// })
	// observer.observe(document.documentElement, {
	// 	attributes: true,
	// 	attributeFilter: ['style'],
	// })
	const ro = new ResizeObserver((entries) => {
		for (const entry of entries) {
			if (entry.target === innerContainer) {
				outerContainer.style.height = `${entry.contentRect.height * scaler.mainScale}px`
			}
			if (entry.target === scaler.heightElement || entry.target === scaler.widthElement) {
				thr()
			}
		}
	})
	ro.observe(innerContainer)
	ro.observe(scaler.widthElement)
	ro.observe(scaler.heightElement)
	return {
		resizer,
		clean: () => {
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
 * @param args.offsetHorizontal 可选的水平补偿值。
 * @param args.heightElement 可选高度测量元素，默认使用 `document.documentElement`。
 * @param args.widthElement 可选宽度测量元素，默认使用 `document.documentElement`。
 * @param args.base 可选基础内容宽度。
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
	}) =>
	(scaler) => {
		scaler.widthElement = widthElement || document.documentElement
		scaler.heightElement = heightElement || document.documentElement
		scaler.onMainScaleChange = setMainScale
		scaler.base = base as number
		if ($sc(offsetHorizontal)) scaler.offsetHorizontal = offsetHorizontal
		scaler.scaleComputer = (scaler) => {
			if (typeof window === 'undefined') return 1
			const welement = scaler.widthElement
			const helement = scaler.heightElement
			const w = welement.clientWidth
			const h = helement.clientHeight
			const fullScreenWidth = Math.min(w, h * maxAspectRatio)
			const fscl = fullScreenWidth / scaler.base
			setFullScreenWidth?.(fullScreenWidth) // setFullScreenWidth 此引用不会过期
			setFullContentHeight?.(h / fscl)
			return fscl
		}
	}
