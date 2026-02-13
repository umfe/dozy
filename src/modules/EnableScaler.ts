import { $sc, l } from '..'

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
	#base = 320
	set base(val: number) {
		if ($sc(val)) this.#base = val
	}
	get base() {
		return this.#base
	}
	#mainScale = 1
	set mainScale(val: number) {
		this.#mainScale = val ? val + 0.01 : 1
		this.onMainScaleChange?.(this.#mainScale)
		if (typeof window === 'undefined') return
		this.innerContainer.style.transform = 'translateX(-50%) scale(' + this.mainScale + ')'
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
	constructor(innerContainer: HTMLElement) {
		this.innerContainer = innerContainer
	}
}

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
		setBase
	}
}

/**
 * Hello
 * @param widthElement 容器
 * @param heightElement 容器
 * @param maxAspectRatio 请输入 Number(0.57) && 0.64
 * @returns 
 */
export const standardIniter: (args: {
	maxAspectRatio?: number
	setFullScreenWidth?: (x: number) => void
	setFullContentHeight?: (x: number) => void
	setMainScale?: (x: number) => void
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
		base
	}) =>
		(scaler) => {
			scaler.widthElement = widthElement || document.documentElement
			scaler.heightElement = heightElement || document.documentElement
			scaler.onMainScaleChange = setMainScale
			scaler.base = base as number
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
