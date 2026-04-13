import { nanoid } from 'nanoid'
import imageCompression, { Options } from 'browser-image-compression'
import { $toDataUrlFromBase64 } from './Functions'

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
			await navigator.clipboard.writeText(content)
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

export const $compressImageDefaultOptions: Options = {
	/** 最大文件大小 (MB)，默认为无穷大 */
	maxSizeMB: 0.5,
	/** 是否使用 Web Worker (多线程) 进行压缩，避免卡顿 UI，默认为 true */
	useWebWorker: true,
	/** 最大宽度或高度，图片将缩放以适应此尺寸，默认为 undefined */
	maxWidthOrHeight: 1920,
	/** 初始压缩质量 (0-1)，默认为 1.0 */
	// initialQuality: 1.0,
	/** 最大迭代次数，默认为 10 */
	// maxIteration: 10,
	/** 是否保留 Exif 信息 (如拍摄时间、地点等)，默认为 false */
	// preserveExif: false,
	/** 输出文件的 MIME 类型，默认与原图相同 */
	// fileType: 'image/jpeg',
}

async function $fileToDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				resolve(reader.result)
			} else {
				reject(new Error('Failed to convert file to data URL.'))
			}
		}
		reader.onerror = () => reject(new Error('Error reading file.'))
		reader.readAsDataURL(file)
	})
}

export async function $compressImageBase64(base64: string, options?: Options) {
	const dataUrl = $toDataUrlFromBase64(base64)
	if (!dataUrl) return ''

	const mime = /^data:([^;]+);base64,/i.exec(dataUrl)?.[1] || 'image/jpeg'
	const response = await fetch(dataUrl)
	const blob = await response.blob()
	const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
	const file = new File([blob], `${nanoid()}.${ext}`, { type: blob.type || mime })
	const compressedFile = await $compressImage(file, options)
	return $fileToDataUrl(compressedFile)
}

export async function $compressImage(file: File, options?: Options): Promise<File>
export async function $compressImage(files: File[], options?: Options): Promise<File[]>
export async function $compressImage(
	input: File | File[],
	options?: Options,
): Promise<File | File[]> {
	const opts = { ...$compressImageDefaultOptions, ...options }

	const processFile = async (f: File) => {
		try {
			const compressedBlob = await imageCompression(f, opts)
			return new File([compressedBlob], f.name, { type: compressedBlob.type })
		} catch (error) {
			console.error('Image compression failed:', error)
			return f
		}
	}

	if (Array.isArray(input)) {
		return Promise.all(input.map(processFile))
	} else {
		return processFile(input)
	}
}
