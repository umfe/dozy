import { AxiosError } from 'axios'
import { $keys, $jsonParse } from './modules/Store'

export function $isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object'
}
export function $deepClone<T>(value: T): T {
	if (typeof structuredClone === 'function') {
		// @ts-ignore -- structuredClone exists in modern runtimes
		return structuredClone(value)
	}
	return JSON.parse(JSON.stringify(value))
}
// export function debounce<T extends (...args: any[]) => any>(fn: T, wait = 200) {
// 	let timer: ReturnType<typeof setTimeout> | null = null
// 	return function (...args: Parameters<T>) {
// 		if (timer) clearTimeout(timer)
// 		timer = setTimeout(() => fn(...args), wait)
// 	} as (...args: Parameters<T>) => void
// }
// export function throttle<T extends (...args: any[]) => any>(fn: T, limit = 200) {
// 	let inThrottle = false
// 	return function (...args: Parameters<T>) {
// 		if (!inThrottle) {
// 			fn(...args)
// 			inThrottle = true
// 			setTimeout(() => (inThrottle = false), limit)
// 		}
// 	} as (...args: Parameters<T>) => void
// }
export function $capitalize(s: string) {
	if (!s) return s
	return s.charAt(0).toUpperCase() + s.slice(1)
}
export function $clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n))
}

export function $loadOpt(thiz: Object, obj?: Object): any {
	if (!obj) return thiz
	let ks = $keys(obj)
	for (const it of ks) {
		let x = (<any>obj)[it]
		let w = (<any>thiz)[it]
		if (x instanceof Object && w instanceof Object) w.$loadOpt(x)
		else {
			let zhis = <any>thiz
			zhis[it] = x
		}
	}
	return thiz
}

export function errMsg(msg: string) {
	throw new Error(msg)
}

export function $pureText(fragment: string) {
	return (new DOMParser().parseFromString(fragment, 'text/html').body.textContent || '')
		.replace(/\n/g, '')
		.trim()
}

export function $oc(o: any): o is Record<string, any> {
	return typeof o === 'object' && o !== null
}

export function $s(s: any, val?: boolean): s is string {
	if (typeof s !== 'string') return false
	return val ? !!s : true
}

export function $sc(n: any): n is number {
	if (typeof n !== 'number') return false
	return isFinite(n)
}

export function $lplus(v: number, t: number, plus: number = 1) {
	v += plus
	while (v >= t) v -= t
	while (v < 0) v += t
	return v
}

export function $lindex(arr: Array<any>, i: number) {
	let l = arr.length
	if (l === 0) return
	while (i >= l) {
		i -= l
	}
	while (i < 0) {
		i += l
	}
	return arr[i]
}

export function $validName(id?: string): id is string {
	return !!id && /^[a-zA-Z0-9-_]+$/.test(id)
}

export type FileType = 'text' | 'image' | 'audio' | 'video' | 'font' | 'unknown'

export function $getFileType(fileName: string): FileType {
	const extension = fileName.split('.').pop()?.toLowerCase()
	if (!extension) return 'unknown'

	const textExtensions = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js', 'ts', 'md', 'log']
	const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
	const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
	const videoExtensions = ['mp4', 'webm', 'ogv', 'mov', 'avi', 'mkv']
	const fontExtensions = ['woff', 'woff2', 'ttf', 'otf']

	if (textExtensions.includes(extension)) return 'text'
	if (imageExtensions.includes(extension)) return 'image'
	if (audioExtensions.includes(extension)) return 'audio'
	if (videoExtensions.includes(extension)) return 'video'
	if (fontExtensions.includes(extension)) return 'font'

	return 'unknown'
}

export function $isValidOrBriefURL(url?: string) {
	if (!url) return false
	let pattern = new RegExp(
		'^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$',
		'i',
	)
	return pattern.test(url)
}

export function $getTimeString(
	stampTicks: number,
	short: boolean,
	unitS: boolean = false,
	exact: boolean = false,
) {
	if (!$sc(stampTicks)) return short ? '00:00' : '00:00:00'
	short ? '00:00' : '00:00:00'
	if (unitS) stampTicks *= 40
	let h = stampTicks / (40 * 60 * 60)
	h = Math.floor(h)
	let m = stampTicks
	if (!short) m %= 40 * 60 * 60
	m /= 40 * 60
	m = Math.floor(m)
	let s = stampTicks % (40 * 60)
	s /= 40
	s = Math.floor(s)
	let sp = ((stampTicks % 40) / 40) * 100
	sp = Math.floor(sp)
	let H = String(h).padStart(2, '0')
	let M = String(m).padStart(2, '0')
	let S = String(s).padStart(2, '0')
	let result = short ? '' + M + ':' + S : '' + H + ':' + M + ':' + S
	return exact ? result + '%' + String(sp).padStart(2, '0') : result
}

export function $magic(start: number, end?: number): number {
	if (typeof end !== 'number') {
		if (start <= 1) return 0
		return Math.floor(Math.random() * start)
	} else {
		if (end <= start) return 0
		const range = end - start
		return start + Math.floor(Math.random() * range)
	}
}

// use nanoid
export function $randomByte(len: number = 32) {
	if (len < 1) len = 1
	let s = ''
	while (s.length < len) s += Math.random().toString(36).substring(2)
	return s.substring(0, len)
}

export function $rsValue(s: string = '', path?: string, def?: any) {
	if (!s) return def
	return $rvalue($jsonParse(s), path, def)
}

export function $rsetValue(obj: Object, path: string, value: any) {
	return $rvalue(obj, path, value, true, true)
}

export function $rvalue(
	obj: Object,
	path?: string,
	def?: any,
	sdef: boolean = false,
	set: boolean = false,
) {
	if (set) sdef = true
	if (!obj) return def
	let ps = path ? path.split('.') : []
	let target: { [x: string]: any } = obj
	let i = -1
	for (let sub of ps) {
		i++
		let end = i == ps.length - 1
		if (end) {
			if (set) {
				target[sub] = def
				return def
			}
			if ($hasKey(target, sub)) return target[sub]
			if (sdef) target[sub] = def
			return def
		} else {
			if ($hasKey(target, sub)) {
				target = target[sub]
				continue
			}
			if (sdef) {
				target[sub] = {}
				target = target[sub]
				continue
			}
			return def
		}
	}
	return target
}

export function $hasKey(obj: Object, key: string) {
	return Object.hasOwnProperty.call(obj, key)
}

function _maybeString(a: any, maxLength: number = 600, deep: number = 0) {
	let x = ''
	if (deep >= 6) x = '[Too deep]'
	else
		try {
			x = (JSON.stringify(a) ?? String(a)) || '[never]'
		} catch (err) {
			x = 'Failed to stringify: ' + _maybeString(err, undefined, deep + 1)
		}
	if (maxLength > 0 && x.length > maxLength) {
		x = x.slice(0, maxLength) + '...'
	}
	return x
}

export function maybeString(a: any, maxLength: number = 600) {
	return _maybeString(a, maxLength)
}

export function errToString(e: unknown): string {
	if (e instanceof AxiosError) {
		const o = e.response?.data?.msg
		if ($s(o, true)) return o
	}
	return (e instanceof Error ? e.message : String(e)) || 'ERROR'
}

export function smallChance() {
	return Math.random() > 0.8
}

export function $isPlainClass(obj: any, clas: Function = Object): boolean {
	return typeof obj === 'object' && obj !== null && obj.constructor === clas
}

export function $encodeUnicodeToBase64(str: string) {
	return btoa(unescape(encodeURIComponent(str)))
}

export function $decodeBase64ToUnicode(base64: string) {
	return decodeURIComponent(escape(atob(base64)))
}

export async function $fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const result = reader.result
			if (typeof result === 'string') {
				resolve(result.split(',')[1]) // Remove the "data:*/*;base64," prefix
			} else {
				reject(new Error('Failed to convert file to Base64.'))
			}
		}
		reader.onerror = () => {
			reject(new Error('Error reading file.'))
		}
		reader.readAsDataURL(file)
	})
}

export function $decodeBase64ToBinary(base64: string) {
	const binaryStr = atob(base64)
	const bytes = new Uint8Array(binaryStr.length)
	for (let i = 0; i < binaryStr.length; i++) {
		bytes[i] = binaryStr.charCodeAt(i)
	}
	return bytes
}

export function $setRange(v: number, min?: number, max?: number) {
	if ($sc(min) && <number>min > v) v = <number>min
	if ($sc(max) && <number>max < v) v = <number>max
	return v
}

export function $inRange2(v: number, mid: number, range: number) {
	return $inRange(v, mid - range, mid + range)
}

export function $inRange(v: number, min?: number, max?: number) {
	if ($sc(min) && <number>min > v) return false
	if ($sc(max) && <number>max < v) return false
	return true
}

export function $strings(str: string, cut: string = '^') {
	return str.split(cut)
}

export function $genSSF(
	f: (s1: string, s2: string) => string,
	gap: string = '',
): (...args: string[]) => string {
	return (...args: string[]) => {
		let ss = args.length === 1 && args[0].includes('^') ? $strings(args[0]) : args
		let v = ''
		let i = Math.ceil(ss.length / 2)
		for (let c = 0; c < i; c++) {
			if (v) v += gap
			let r = ss[c * 2]
			let t = ss[c * 2 + 1]
			v += f(r, t)
		}
		return v
	}
}

export function xtrim(s: string) {
	return s
		.replace(/(\r?\n)+/g, '\n')
		.replace(/[^\S\n]+/g, ' ')
		.replace(/(^\s*|\s*$)/g, '')
}

export function $if<T extends string | number | symbol, V>(val: T, fs: Record<T, Function | V>) {
	const f = fs[val]
	if (typeof f === 'function') return f()
	return f as V
}

export function $lastIndex(items: Array<any> | number) {
	let i = $sc(items) ? <number>items : (<Array<any>>items).length
	i -= 1
	return i >= 0 ? i : 0
}

export function $replaceHolesWithUndefined<T>(arr: Array<T | undefined>): Array<T | undefined> {
	const newArr = arr.slice()
	for (let i = 0; i < newArr.length; i++) {
		if (!(i in newArr)) {
			arr[i] = undefined
		}
	}
	return newArr
}

export function $stringToRange(str: string, max: number): number {
	let hash = 5381
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i)
	}
	hash = Math.abs(hash)
	const goldenRatioConjugate = 0.61803398875
	let value = (hash * goldenRatioConjugate) % 1
	return Math.floor(value * max)
}

export function $rmvSlash(path: string) {
	return path.startsWith('/') ? path.slice(1) : path
}

export function $parseParams(path: string): (string | undefined)[] {
	path = $rmvSlash(path)
	const parts: string[] = []
	let current = ''
	let i = 0
	const UNDERSCORE_PLACEHOLDER = 'PLACEHOLDER_' + Math.random().toString(36).slice(2, 10)
	while (i < path.length) {
		if (path[i] === '-') {
			if (path[i + 1] === '-') {
				current += '-'
				i += 2
			} else {
				parts.push(current)
				current = ''
				i++
			}
		} else {
			current += path[i]
			i++
		}
	}
	if (current) parts.push(current)
	const decoded = parts.map((p) =>
		p
			.replace(/__/g, UNDERSCORE_PLACEHOLDER)
			.replace(/_/g, ' ')
			.replace(/%20/g, ' ')
			.replace(new RegExp(UNDERSCORE_PLACEHOLDER, 'g'), '_'),
	)
	return decoded
}

export function $formatWithCommas(num: number | string): string {
	const [integerPart, decimalPart] = num.toString().split('.')
	const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt
}

export function $isValidEmailWithUnicode(email?: string) {
	email = email || ''
	const regex = /^[\p{L}\p{N}._%+-]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,}$/u
	return regex.test(email)
}

export function $checkValidEmailWithUnicode(email?: string) {
	if (!$isValidEmailWithUnicode(email)) errMsg('Invalid email address')
}

export function $formatDate(dateInput: string | number | Date): string {
	const date = new Date(dateInput)
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours().toString().padStart(2, '0')
	const minute = date.getMinutes().toString().padStart(2, '0')

	return `${year}年${month}月${day}日 ${hour}:${minute}`
}


