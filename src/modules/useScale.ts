import { l } from '..'

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
	#clientWidth = 0
	get clientWidth() {
		if (this.#clientWidth == 0) {
			if (typeof window === 'undefined') return 1
			this.#clientWidth = document.documentElement.clientWidth
		}
		return this.#clientWidth
	}
	set clientWidth(val: number) {
		this.#clientWidth = val
	}
	#clientHeight = 0
	get clientHeight() {
		if (this.#clientHeight == 0) {
			if (typeof window === 'undefined') return 1
			this.#clientHeight = document.documentElement.clientHeight
		}
		return this.#clientHeight
	}
	set clientHeight(val: number) {
		this.#clientHeight = val
	}
	// originalContentHeight = 0
	#mainScale = 1
	set mainScale(val: number) {
		this.#mainScale = val || 1
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

export function useScaler(outerContainer: HTMLElement, initer?: ScaleIniter) {
	if (typeof window === 'undefined') return
	const innerContainer = outerContainer.children[0]
	if (!innerContainer || !(innerContainer instanceof HTMLElement))
		throw 'please make the right constructure'
	const scaler = new Scaler(innerContainer)
	initer?.(scaler)
	const outer = outerContainer.style
	outer.width = '0'
	outer.marginLeft = 'auto'
	outer.marginRight = 'auto'
	const inner = innerContainer.style
	inner.width = '320px'
	inner.height = 'fit-content'
	inner.transformOrigin = 'top center'
	const resizer = () => {
		scaler.clientWidth = document.documentElement.clientWidth
		scaler.clientHeight = document.documentElement.clientHeight
		if (scaler.scaleComputer) {
			scaler.mainScale = scaler.scaleComputer(scaler)
		}
	}
	window.addEventListener('resize', l.throttle(resizer))
	resizer()
	// const observer = new MutationObserver(() => {
	// 	const style = document.documentElement.style
	// 	scaler.mainScale = Number(style.getPropertyValue('--main-scale')) || 1
	// })
	// observer.observe(document.documentElement, {
	// 	attributes: true,
	// 	attributeFilter: ['style'],
	// })
	new ResizeObserver(([entry]) => {
		// outerContainer.style.width = `${entry.contentRect.width * scaler.mainScale}px`
		outerContainer.style.height = `${entry.contentRect.height * scaler.mainScale}px`
	}).observe(innerContainer)
	return scaler
}

export const standardIniter: (args: {
	maxScreenWidth?: number
	setFullScreenWidth?: (x: number) => void
	setFullContentHeight?: (x: number) => void
	setMainScale?: (x: number) => void
}) => ScaleIniter =
	({ maxScreenWidth = 460, setFullScreenWidth, setFullContentHeight, setMainScale }) =>
	(scaler) => {
		scaler.onMainScaleChange = setMainScale
		scaler.scaleComputer = (scaler) => {
			const fullScreenWidth = Math.min(scaler.clientWidth, maxScreenWidth)
			const fscl = fullScreenWidth / 320
			setFullScreenWidth?.(fullScreenWidth) // setFullScreenWidth 此引用不会过期
			setFullContentHeight?.(scaler.clientHeight / fscl)
			return fscl
		}
	}
