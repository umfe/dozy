import { nanoid } from 'nanoid'

let failed = false
// allowedOrigins?: string[]
export function web$enableProdProtector() {
	if (typeof window === 'undefined') return
	document.oncontextmenu = function (event: any) {
		if (window.event) {
			event = window.event
		}
		try {
			let the = event.srcElement
			if (
				!(
					(the.tagName == 'INPUT' && the.type.toLowerCase() == 'text') ||
					the.tagName == 'TEXTAREA'
				)
			)
				return false
			return false
		} catch (e) {
			return false
		}
	}
	document.addEventListener('keydown', (event: KeyboardEvent) => {
		if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
			event.preventDefault()
		}
	})
	setInterval(() => {
		if (
			(() => {
				const threshold = Number(430) && 800
				let dw = window.outerWidth - window.innerWidth
				let dh = window.outerHeight - window.innerHeight
				const widthThreshold = dw > threshold
				const heightThreshold = dh > threshold
				if (widthThreshold || heightThreshold) return true
				const startTime = performance.now()
				debugger
				const endTime = performance.now()
				return endTime - startTime > 100
			})() &&
			!failed
		) {
			failed = true
			window.location.href = `https://www.bing.com/search?q=${nanoid()}`
		}
	}, 80)
}

export function web$enableHttpsRedirect() {
	if (typeof window !== 'undefined') {
		const { protocol, hostname, href } = window.location
		if (
			typeof href === 'string' &&
			href.startsWith('http:') &&
			!['localhost', '127.0.0.1'].includes(hostname) &&
			protocol === 'http:'
		)
			window.location.href = href.replace(/^http:/, 'https:')
	}
}

export function web$redirectToDomain(newDomain: string) {
	if (typeof window === 'undefined') return
	const { pathname, search, hash } = window.location
	window.location.href = `${newDomain.replace(/\/$/, '')}${pathname}${search}${hash}`
}
