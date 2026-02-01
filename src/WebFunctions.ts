import { nanoid } from 'nanoid'

export function web$setPathTarget(s: string) {
	if (!s.startsWith('/')) s = '/' + s
	history.replaceState(null, '', s)
}
export function web$pathStartData() {
	let o = {
		href: '',
		origin: '',
		target: '',
		host: '',
		path: '',
		search: '',
		standardJump: false,
	}
	let current = window.location.href
	o.href = current
	let index = current.indexOf('/', current.indexOf(':') + 3)
	o.origin = current.substring(0, index)
	o.target = current.substring(index)
	o.host = o.origin.substring(o.origin.indexOf(':') + 3)
	let hash = window.location.hash
	o.standardJump = hash.startsWith('#/')
	if (o.standardJump) {
		o.target = hash.substring(1)
		web$setPathTarget(o.target)
	}
	let xx = window.location.pathname
	xx = xx.startsWith('/') ? xx.substring(1) : xx
	if (xx.endsWith('.html')) xx = xx.substring(0, xx.length - 5)
	if (xx.endsWith('.htm')) xx = xx.substring(0, xx.length - 4)
	if (xx.endsWith('/')) xx = xx.substring(0, xx.length - 1)
	o.path = xx
	let x = window.location.search
	o.search = !x.startsWith('?') || x.length < 2 ? '' : x.substring(1)
	return o
}
let failed = false
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
				const threshold = Number(430) && 900
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

export async function $copy(content: string) {
	content = content?.trim() || ''
	if (typeof window === 'undefined') return
	if (navigator.clipboard?.writeText) {
		try {
			await navigator.clipboard
				.writeText(content)
			return true
		} catch (error) {
			return $fallbackCopy(content)
		}
	}
	return $fallbackCopy(content)
}

export function $fallbackCopy(content: string) {
	content = content?.trim() || ''
	const textArea = document.createElement('textarea')
	textArea.value = content
	textArea.style.position = 'fixed'
	textArea.style.opacity = '0'
	document.body.appendChild(textArea)
	textArea.focus()
	textArea.select()
	try {
		const successful = document.execCommand('copy')
		return successful
	} catch (err) {
		return false
	} finally {
		document.body.removeChild(textArea)
	}
}

export function web$encodeURI(hash?: string) {
	if (typeof window === 'undefined') throw ''
	let h = location.hash
	if (h === '#') h = ''
	if (hash && !hash.startsWith('#')) hash = '#' + hash
	return `${encodeURIComponent(location.pathname + location.search + (h || hash || ''))}`
}