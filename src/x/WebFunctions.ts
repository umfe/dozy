import { nanoid } from 'nanoid'
import imageCompression, { Options } from 'browser-image-compression'
import { $toDataUrlFromBase64 } from './Functions'

/**
 * 将当前历史记录替换为规范化后的路径。
 *
 * @param s 目标路径；如果没有以 `/` 开头会自动补上。
 * @returns 无返回值。
 */
export function web$setPathTarget(s: string) {
	if (!s.startsWith('/')) s = '/' + s
	history.replaceState(null, '', s)
}

/**
 * 读取并规范化当前浏览器地址信息。
 *
 * 行为说明：
 * - 会识别 `#/...` 这种 hash 路由跳转，并把地址改写成规范路径。
 * - 会去掉 `path` 前导 `/` 以及结尾的 `.html` / `.htm`。
 * - 会去掉 `search` 前面的 `?`。
 *
 * @returns 返回一个描述当前地址状态的对象，包含 `href`、`origin`、`target`、`host`、`path`、`search`、`standardJump` 等字段。
 */
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

/**
 * 在浏览器中开启轻量级的生产环境防调试保护。
 *
 * 副作用包括：
 * - 禁用右键菜单。
 * - 阻止 `F12` 和 `Ctrl+Shift+I`。
 * - 周期性检测开发者工具是否可能被打开，若触发则跳转离开当前页。
 *
 * @returns 无返回值；在服务端环境下不会执行任何逻辑。
 */
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

/**
 * 在浏览器环境下把 `http:` 页面自动重定向到 `https:`。
 *
 * 例外情况：
 * - `localhost`
 * - `127.0.0.1`
 *
 * @returns 无返回值。
 */
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

/**
 * 将当前页面重定向到另一个域名，同时保留路径、查询参数和哈希。
 *
 * @param newDomain 目标域名，可以带或不带结尾斜杠。
 * @returns 无返回值；在服务端环境下直接返回。
 */
export function web$redirectToDomain(newDomain: string) {
	if (typeof window === 'undefined') return
	const { pathname, search, hash } = window.location
	window.location.href = `${newDomain.replace(/\/$/, '')}${pathname}${search}${hash}`
}

/**
 * 将文本复制到系统剪贴板。
 *
 * 行为说明：
 * - 会先对传入内容执行 `trim()`。
 * - 优先使用 `navigator.clipboard.writeText`。
 * - 现代剪贴板接口失败时会回退到 `$fallbackCopy`。
 * - 非浏览器环境下返回 `undefined`。
 *
 * @param content 要复制的文本内容。
 * @returns 成功时返回 `true`，回退复制失败时返回 `false`，非浏览器环境下返回 `undefined`。
 */
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

/**
 * 使用隐藏的 `<textarea>` 作为兼容方案执行复制。
 *
 * @param content 要复制的文本，会先被 `trim()` 处理。
 * @returns 当 `document.execCommand('copy')` 返回成功时为 `true`，否则为 `false`。
 */
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

/**
 * 替换当前地址栏的 hash 部分，保留 pathname 和 search 不变。
 *
 * @param hash 目标 hash 值；传入时不需要带 `#` 前缀（会自动补上）。传空字符串则清除 hash。
 */
export function web$replaceHash(hash: string) {
	if (typeof window === 'undefined') return
	const h = hash ? (hash.startsWith('#') ? hash : '#' + hash) : ''
	window.history.replaceState(null, '', window.location.pathname + window.location.search + h)
}

/**
 * 将当前页面的路径、查询参数和哈希编码成一个 URI 片段字符串。
 *
 * @param hash 可选的替代 hash；如果传入时没有 `#` 前缀会自动补上。
 * @returns 编码后的 URI 组件字符串。
 * @throws 在非浏览器环境中会抛出空字符串。
 */
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

/**
 * 将浏览器中的 `File` 对象转换为 data URL 字符串。
 *
 * @param file 浏览器文件对象。
 * @returns 返回一个 Promise，成功时得到完整的 data URL 字符串。
 */
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

/**
 * 压缩 Base64 图片并以 data URL 形式返回。
 *
 * 说明：
 * - 同时支持纯 Base64 和已有 data URL 两种输入。
 * - 如果输入无法被规范化为合法 data URL，则返回空字符串。
 *
 * @param base64 输入的图片数据。
 * @param options 可选压缩配置，会覆盖默认配置。
 * @returns 返回压缩后的 data URL；如果输入无效则返回空字符串。
 */
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

/**
 * 在浏览器中压缩一个或多个图片文件。
 *
 * 行为说明：
 * - 会将用户传入配置与 `$compressImageDefaultOptions` 合并。
 * - 会保留原始文件名。
 * - 某个文件压缩失败时，会直接返回该原始文件，不会抛出中断整个批次。
 *
 * @param input 单个 `File` 或 `File[]`。
 * @param options 可选压缩配置。
 * @returns 返回 Promise；输入是单文件时得到单个 `File`，输入是数组时得到 `File[]`。
 */
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
