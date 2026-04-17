import { AxiosError } from 'axios'
import { $keys, $jsonParse, $jsonStringify } from '../modules/Store'
import { Any, Null } from '../modules/InterTypes/InterType'

/**
 * 判断一个值是否为非 `null` 的对象。
 *
 * @param value 要检测的值。
 * @returns 当值是对象且不为 `null` 时返回 `true`，否则返回 `false`。
 */
export function $isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object'
}

/**
 * 使用当前运行环境中可用的最佳方式深拷贝一个值。
 *
 * 行为说明：
 * - 优先使用 `structuredClone`。
 * - 不可用时回退到 `JSON.stringify` / `JSON.parse`。
 * - JSON 方案会丢失函数、`undefined`、循环引用以及部分类实例信息。
 *
 * @typeParam T 输入与返回值的类型。
 * @param value 源值。
 * @returns 返回深拷贝后的结果，但具体保真度取决于底层拷贝方案。
 */
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

/**
 * 将字符串首字母转为大写。
 *
 * @param s 输入字符串。
 * @returns 如果输入为空则原样返回；否则返回首字符大写后的字符串。
 */
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

/**
 * 将数字限制在闭区间 `[min, max]` 内。
 *
 * @param n 输入数字。
 * @param min 最小值。
 * @param max 最大值。
 * @returns 小于最小值时返回 `min`，大于最大值时返回 `max`，否则返回原值。
 */
export function $clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n))
}

/**
 * 将一个对象中的配置项合并到目标对象中。
 *
 * 行为说明：
 * - 如果 `obj` 不存在，则直接返回 `thiz`。
 * - 当源字段和目标字段都是对象时，会尝试调用目标上的 `$loadOpt` 继续递归合并。
 * - 否则直接覆盖赋值。
 *
 * @param thiz 目标对象，会被原地修改。
 * @param obj 可选的源对象。
 * @returns 返回被修改后的目标对象 `thiz`。
 */
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

/**
 * 抛出一个带指定消息的 `Error`。
 *
 * @param msg 错误消息。
 * @returns 不会返回。
 * @throws 始终抛出 `Error`。
 */
export function errMsg(msg: string) {
	throw new Error(msg)
}

/**
 * 去掉 HTML 标记并返回纯文本内容。
 *
 * @param fragment HTML 片段字符串。
 * @returns 返回去除换行并裁剪首尾空白后的纯文本。
 */
export function $pureText(fragment: string) {
	return (new DOMParser().parseFromString(fragment, 'text/html').body.textContent || '')
		.replace(/\n/g, '')
		.trim()
}

/**
 * 判断一个值是否为普通对象记录。
 *
 * @param o 要检测的值。
 * @returns 非 `null` 对象时返回 `true`，否则返回 `false`。
 */
export function $oc(o: any): o is Record<string, any> {
	return typeof o === 'object' && o !== null
}

/**
 * 判断一个值是否为字符串，并可选要求其非空。
 *
 * @param s 要检测的值。
 * @param val 为真时，除了要求是字符串外，还要求 `!!s` 为真。
 * @returns 是否满足对应的字符串条件。
 */
export function $s(s: any, val?: boolean): s is string {
	if (typeof s !== 'string') return false
	return val ? !!s : true
}

/**
 * 判断一个值是否为有限数字。
 *
 * @param n 要检测的值。
 * @returns 只有在值是数字且不是 `NaN`、`Infinity`、`-Infinity` 时才返回 `true`。
 */
export function $sc(n: any): n is number {
	if (typeof n !== 'number') return false
	return isFinite(n)
}

/**
 * 对循环索引执行加减步进，并保证结果始终落在循环范围内。
 *
 * @param v 当前值。
 * @param t 循环长度，也可理解为上边界（不包含）。
 * @param plus 步进值，默认为 `1`。
 * @returns 返回落在 `[0, t)` 区间内的循环结果。
 */
export function $lplus(v: number, t: number, plus: number = 1) {
	v += plus
	while (v >= t) v -= t
	while (v < 0) v += t
	return v
}

/**
 * 使用循环索引方式读取数组项。
 *
 * @param arr 源数组。
 * @param i 目标索引，可以是负数，也可以超过数组长度。
 * @returns 返回折算后的数组项；如果数组为空则返回 `undefined`。
 */
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

/**
 * 校验一个简单标识符是否合法。
 *
 * 允许字符：字母、数字、连字符 `-`、下划线 `_`。
 *
 * @param id 待校验的标识符。
 * @returns 当 `id` 非空且符合规则时返回 `true`，否则返回 `false`。
 */
export function $validName(id?: string): id is string {
	return !!id && /^[a-zA-Z0-9-_]+$/.test(id)
}

export type FileType = 'text' | 'image' | 'audio' | 'video' | 'font' | 'unknown'

/**
 * 根据文件扩展名推断文件的大致类型。
 *
 * @param fileName 文件名或路径。
 * @returns 可能返回 `text`、`image`、`audio`、`video`、`font` 或 `unknown`。
 */
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

/**
 * 判断一个字符串是否看起来像 URL，允许省略协议头。
 *
 * @param url 待检测的 URL 字符串。
 * @returns 输入为空时返回 `false`；否则返回是否匹配内部 URL 规则。
 */
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

/**
 * 将 tick 时间格式化为可读字符串。
 *
 * @param stampTicks 时间值，默认规则下 40 tick = 1 秒。
 * @param short 为 `true` 时返回 `MM:SS`，否则返回 `HH:MM:SS`。
 * @param unitS 为 `true` 时表示传入值单位是秒，函数内部会自动换算成 tick。
 * @param exact 为 `true` 时会在末尾追加 `%xx`，表示更细的余数信息。
 * @returns 返回格式化后的时间字符串；若输入不是有效数字，则按 `short` 返回 `00:00` 或 `00:00:00`。
 */
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

/**
 * 在指定范围内生成随机整数。
 *
 * 参数语义：
 * - 只传 `start` 时，返回 `[0, start)` 范围内的整数。
 * - 同时传 `start`、`end` 时，返回 `[start, end)` 范围内的整数。
 *
 * @param start 当 `end` 省略时表示上限；否则表示下限。
 * @param end 可选的上限（不包含）。
 * @returns 返回目标范围内的随机整数；当范围无效时返回 `0`。
 */
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
/**
 * 生成指定长度的伪随机字母数字字符串。
 *
 * @param len 目标长度，小于 `1` 时会被强制改为 `1`。
 * @returns 返回长度恰好为 `len` 的随机字符串。
 */
export function $randomByte(len: number = 32) {
	if (len < 1) len = 1
	let s = ''
	while (s.length < len) s += Math.random().toString(36).substring(2)
	return s.substring(0, len)
}

/**
 * 解析 JSON 字符串，并读取其中某个点路径对应的值。
 *
 * @param s JSON 字符串。
 * @param path 可选的点分隔路径，如 `a.b.c`。
 * @param def 当输入为空或路径读取失败时使用的默认值。
 * @returns 返回读取到的值；如果失败则返回 `def`。
 */
export function $rsValue(s: string = '', path?: string, def?: any) {
	if (!s) return def
	return $rvalue($jsonParse(s), path, def)
}

/**
 * 按点路径给对象设置嵌套值。
 *
 * @param obj 目标对象。
 * @param path 点分隔属性路径。
 * @param value 要设置的值。
 * @returns 返回最终写入的值。
 */
export function $rsetValue(obj: Object, path: string, value: any) {
	return $rvalue(obj, path, value, true, true)
}

/**
 * 使用点路径读取或设置对象中的嵌套属性。
 *
 * @param obj 目标对象。
 * @param path 可选的点分隔路径；如果不传，则直接返回 `obj` 本身。
 * @param def 默认值；在设置模式下也会作为要写入的值。
 * @param sdef 为 `true` 时，缺失的中间对象或最终值可以按需用 `def` 创建。
 * @param set 为 `true` 时强制进入设置模式，并把 `def` 写入最终路径。
 * @returns 可能返回读取到的值、写入的值、默认值 `def`，或者原对象 `obj`，具体取决于路径情况与参数组合。
 */
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

/**
 * 判断对象是否直接拥有某个属性。
 *
 * @param obj 要检查的对象。
 * @param key 属性名。
 * @returns 只有当属性是对象自身属性时才返回 `true`。
 */
export function $hasKey(obj: Object, key: string) {
	return Object.hasOwnProperty.call(obj, key)
}

/**
 * 安全地把未知值转换成适合日志或调试展示的短字符串。
 *
 * @param a 要序列化的值。
 * @param maxLength 最大输出长度；小于等于 `0` 时表示不截断。
 * @param deep 内部递归深度，用于处理序列化失败时的错误对象。
 * @returns 返回字符串结果；必要时会附带截断标记或失败提示。
 */
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

/**
 * `_maybeString` 的对外包装函数。
 *
 * @param a 要转成字符串的值。
 * @param maxLength 最大输出长度，默认为 `600`。
 * @returns 返回相对安全的字符串表示。
 */
export function maybeString(a: any, maxLength: number = 600) {
	return _maybeString(a, maxLength)
}

/**
 * 将未知错误尽量转换为可读的错误消息。
 *
 * @param e 未知的错误值。
 * @returns 返回尽可能提取出的错误消息；若是 Axios 错误且响应中存在 `data.msg`，会优先使用它。
 */
export function errToString(e: unknown): string {
	if (e instanceof AxiosError) {
		const o = e.response?.data?.msg
		if ($s(o, true)) return o
	}
	return (e instanceof Error ? e.message : String(e)) || 'ERROR'
}

/**
 * 以一个固定的小概率返回 `true`。
 *
 * @returns 当 `Math.random() > 0.8` 时返回 `true`，否则返回 `false`。
 */
export function smallChance() {
	return Math.random() > 0.8
}

/**
 * 判断一个值是否是指定构造函数的普通实例。
 *
 * @param obj 要检测的值。
 * @param clas 期望的构造函数，默认为 `Object`。
 * @returns 当 `obj` 非空且其 `constructor === clas` 时返回 `true`。
 */
export function $isPlainClass(obj: any, clas: Function = Object): boolean {
	return typeof obj === 'object' && obj !== null && obj.constructor === clas
}

/**
 * 将 Unicode 字符串编码为 Base64。
 *
 * @param str 源字符串。
 * @returns 返回 Base64 字符串。
 */
export function $encodeUnicodeToBase64(str: string) {
	return btoa(unescape(encodeURIComponent(str)))
}

/**
 * 将 Base64 字符串解码回 Unicode 文本。
 *
 * @param base64 Base64 编码字符串。
 * @returns 返回解码后的 Unicode 字符串。
 */
export function $decodeBase64ToUnicode(base64: string) {
	return decodeURIComponent(escape(atob(base64)))
}

/**
 * 读取浏览器 `File`，并返回不带 data URL 前缀的纯 Base64 内容。
 *
 * @param file 要读取的文件对象。
 * @returns 返回一个 Promise，成功时得到纯 Base64 字符串。
 * @throws 当文件读取失败或结果不是字符串时，Promise 会被拒绝。
 */
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

/**
 * 将 Base64 字符串解码为原始字节数组。
 *
 * @param base64 纯 Base64 字符串。
 * @returns 返回解码后的 `Uint8Array`。
 */
export function $decodeBase64ToBinary(base64: string) {
	const binaryStr = atob(base64)
	const bytes = new Uint8Array(binaryStr.length)
	for (let i = 0; i < binaryStr.length; i++) {
		bytes[i] = binaryStr.charCodeAt(i)
	}
	return bytes
}

/**
 * 仅在边界值有效时，将数字限制到对应范围内。
 *
 * @param v 输入值。
 * @param min 可选最小值。
 * @param max 可选最大值。
 * @returns 返回处理后的结果值。
 */
export function $setRange(v: number, min?: number, max?: number) {
	if ($sc(min) && <number>min > v) v = <number>min
	if ($sc(max) && <number>max < v) v = <number>max
	return v
}

/**
 * 判断一个值是否位于某个中心点的对称范围内。
 *
 * @param v 要检测的值。
 * @param mid 中心值。
 * @param range 左右两侧允许的偏移范围。
 * @returns 当 `v` 位于 `[mid - range, mid + range]` 区间内时返回 `true`。
 */
export function $inRange2(v: number, mid: number, range: number) {
	return $inRange(v, mid - range, mid + range)
}

/**
 * 判断一个数是否位于可选的最小值和最大值之间。
 *
 * @param v 要检测的值。
 * @param min 可选最小值。
 * @param max 可选最大值。
 * @returns 如果违反任一已提供边界则返回 `false`，否则返回 `true`。
 */
export function $inRange(v: number, min?: number, max?: number) {
	if ($sc(min) && <number>min > v) return false
	if ($sc(max) && <number>max < v) return false
	return true
}

/**
 * 按指定分隔符拆分字符串。
 *
 * @param str 原始字符串。
 * @param cut 分隔符，默认为 `^`。
 * @returns 返回 `str.split(cut)` 的结果数组。
 */
export function $strings(str: string, cut: string = '^') {
	return str.split(cut)
}

/**
 * 生成一个按成对字符串参数进行处理的辅助函数。
 *
 * 规则说明：
 * - 如果只传了一个参数且其中包含 `^`，会先按 `^` 拆分。
 * - 然后按 `(s1, s2)` 两两配对执行处理。
 * - 如果某组缺少第二项，运行时该参数会是 `undefined`。
 *
 * @param f 成对处理函数。
 * @param gap 每组结果之间插入的分隔字符串。
 * @returns 返回一个新函数，用于把字符串列表合成为最终字符串。
 */
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

/**
 * 规范化多行字符串中的空白字符。
 *
 * @param s 输入字符串。
 * @returns 返回压缩多余空行、规范行内空白并去除首尾空白后的字符串。
 */
export function xtrim(s: string) {
	return s
		.replace(/(\r?\n)+/g, '\n')
		.replace(/[^\S\n]+/g, ' ')
		.replace(/(^\s*|\s*$)/g, '')
}

/**
 * 根据键值选择映射项，并在映射值为函数时执行它。
 *
 * @typeParam T 键类型。
 * @typeParam V 非函数映射值类型。
 * @param val 当前要选择的键。
 * @param fs 键到函数或普通值的映射表。
 * @returns 如果命中项是函数则返回函数执行结果，否则返回映射值本身。
 */
export function $if<T extends string | number | symbol, V>(val: T, fs: Record<T, Function | V>) {
	const f = fs[val]
	if (typeof f === 'function') return f()
	return f as V
}

/**
 * 获取数组或长度值对应的最后一个有效索引。
 *
 * @param items 数组本身或数字长度。
 * @returns 返回 `max(length - 1, 0)` 的结果。
 */
export function $lastIndex(items: Array<any> | number) {
	let i = $sc(items) ? <number>items : (<Array<any>>items).length
	i -= 1
	return i >= 0 ? i : 0
}

/**
 * 将稀疏数组中的空洞补成显式的 `undefined`。
 *
 * 注意：该函数会修改原数组，同时返回一个浅拷贝。
 *
 * @typeParam T 元素类型。
 * @param arr 可能包含空洞的数组。
 * @returns 返回浅拷贝后的数组。
 */
export function $replaceHolesWithUndefined<T>(arr: Array<T | undefined>): Array<T | undefined> {
	const newArr = arr.slice()
	for (let i = 0; i < newArr.length; i++) {
		if (!(i in newArr)) {
			arr[i] = undefined
		}
	}
	return newArr
}

/**
 * 将字符串稳定映射到 `[0, max)` 范围内的整数。
 *
 * @param str 源字符串。
 * @param max 上界（不包含）。
 * @returns 返回确定性的整数结果；即使字符串为空，也会得到合法范围内的值。
 */
export function $stringToRange(str: string, max: number): number {
	str ||= ''
	let hash = 5381
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i)
	}
	hash = Math.abs(hash)
	const goldenRatioConjugate = 0.61803398875
	let value = (hash * goldenRatioConjugate) % 1
	return Math.floor(value * max)
}

/**
 * 去掉路径开头的 `/`。
 *
 * @param path 输入路径。
 * @returns 如果路径有前导斜杠则返回去掉后的结果，否则原样返回。
 */
export function $rmvSlash(path: string) {
	return path.startsWith('/') ? path.slice(1) : path
}

/**
 * 解析紧凑编码的路径参数字符串。
 *
 * 规则：
 * - 单个 `-` 表示参数分隔。
 * - 双 `--` 表示字面量 `-`。
 * - `_` 与 `%20` 会被还原为空格。
 * - 双下划线 `__` 用于保留字面量下划线。
 *
 * @param path 编码后的路径字符串。
 * @returns 返回解码后的参数数组。
 */
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

/**
 * 给数字或数字字符串添加千分位分隔符。
 *
 * @param num 数字或可转为字符串的数字值。
 * @returns 返回带千分位逗号的字符串。
 */
export function $formatWithCommas(num: number | string): string {
	const [integerPart, decimalPart] = num.toString().split('.')
	const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return decimalPart ? `${formattedInt}.${decimalPart}` : formattedInt
}

/**
 * 校验邮箱地址是否符合支持 Unicode 字母的规则。
 *
 * @param email 待校验邮箱。
 * @returns 符合规则时返回 `true`，否则返回 `false`。
 */
export function $isValidEmailWithUnicode(email?: string) {
	email = email || ''
	const regex = /^[\p{L}\p{N}._%+-]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,}$/u
	return regex.test(email)
}

/**
 * 校验邮箱格式，不合法时直接抛错。
 *
 * @param email 待校验邮箱。
 * @returns 合法时无返回值。
 * @throws 当邮箱不合法时抛出错误。
 */
export function $checkValidEmailWithUnicode(email?: string) {
	if (!$isValidEmailWithUnicode(email)) errMsg('Invalid email address')
}

export const shanghaiDateFormatter = new Intl.DateTimeFormat('zh-CN', {
	timeZone: 'Asia/Shanghai',
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
})
/**
 * 将日期输入格式化为 `YYYY年M月D日 HH:mm`。
 *
 * @param dateInput 任何可被 `Date` 构造函数接受的输入。
 * @returns 返回格式化后的日期字符串。
 */
export function $formatDate(dateInput: string | number | Date): string {
	const date = new Date(dateInput)
	const parts = shanghaiDateFormatter.formatToParts(date)
	const getPart = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((part) => part.type === type)?.value ?? ''

	const year = getPart('year')
	const month = getPart('month')
	const day = getPart('day')
	const hour = getPart('hour')
	const minute = getPart('minute')

	return `${year}年${month}月${day}日 ${hour}:${minute}`
}

/**
 * 格式化数值为字符串，先放大再保留指定小数位数，并添加千分位分隔符。
 *
 * 行为说明：
 * - 先将数值乘以 10^bits 进行放大。
 * - 然后使用 `toFixed(bits)` 保留指定位数的小数。
 * - 最后通过 `$formatWithCommas` 添加千分位逗号分隔符。
 * - 当输入不是有效数字时返回 `'-'`。
 *
 * @param points 要格式化的数值。
 * @param bits 放大倍数的指数，同时也是小数位数，默认为 `2`。
 * @returns 返回格式化后的字符串（含千分位）；输入无效时返回 `'-'`。
 *
 * @example
 * $formatPoints(1.23, 2)   // 返回 "123.00"
 * $formatPoints(12.34, 2)  // 返回 "1,234.00"
 * $formatPoints(0.5, 3)    // 返回 "500.000"
 */
export function $formatPoints(points: number, bits = 2) {
	if (!$sc(points)) return '-'
	return $formatWithCommas((points * Math.pow(10, bits)).toFixed(bits))
}

/**
 * 格式化数值为带符号和颜色的显示元组，并添加千分位分隔符。
 *
 * 行为说明：
 * - 先将数值乘以 10^bits 进行放大，然后使用 `toFixed(bits)` 格式化。
 * - 通过 `$formatWithCommas` 添加千分位逗号分隔符。
 * - 根据数值正负自动添加符号前缀并分配对应颜色。
 * - 正数：前缀 `'+'`，颜色 `'#0a0'`（绿色）。
 * - 负数：前缀 `'-'`，颜色 `'#a00'`（红色）。
 * - 零或其他：无前缀，颜色 `'#333'`（深灰色）。
 * - 当输入不是有效数字时返回 `['+?', '#333']`。
 *
 * @param points 要格式化的数值。
 * @param bits 放大倍数的指数，同时也是小数位数，默认为 `2`。
 * @returns 返回包含显示文本（含千分位）和颜色的元组 `[display, color]`。
 *
 * @example
 * $formatPointsWithChange(1.23, 2)   // 返回 ["+123.00", "#0a0"]
 * $formatPointsWithChange(12.34, 2)  // 返回 ["+1,234.00", "#0a0"]
 * $formatPointsWithChange(-0.5, 2)   // 返回 ["-50.00", "#a00"]
 * $formatPointsWithChange(0, 2)      // 返回 ["0.00", "#333"]
 */
export function $formatPointsWithChange(
	points: number,
	bits = 2,
): [display: string, color: string] {
	let color = '#333'
	if (!$sc(points)) return ['+?', color]
	let prefix = ''
	if (points > 0) {
		prefix = '+'
		color = '#0a0'
	} else if (points < 0) {
		prefix = '-'
		color = '#a00'
	}
	return [prefix + $formatWithCommas((points * Math.pow(10, bits)).toFixed(bits)), color]
}

/**
 * 将错误转换成一个始终包含 `msg` 字段的对象。
 *
 * @typeParam T 附加字段对象类型。
 * @param error 错误来源。
 * @param defVal 可选的附加字段对象。
 * @returns 返回 `{ msg }` 或 `{ msg, ...defVal }`。
 */
export function errCode<T extends Any>(error: any, defVal?: T) {
	const msg = errToString(error)
	return defVal ? { msg, ...defVal } : { msg }
}

/**
 * 抛出统一的“内容不正确”错误。
 *
 * @returns 不会返回。
 * @throws 始终抛出错误。
 */
export function errContent() {
	errMsg('内容不正确')
}

/**
 * 抛出统一的“参数不正确”错误。
 *
 * @returns 不会返回。
 * @throws 始终抛出错误。
 */
export function errArg() {
	errMsg('参数不正确')
}

/**
 * 抛出统一的“未登录”错误。
 *
 * @returns 不会返回。
 * @throws 始终抛出错误。
 */
export function errNotLoggedIn() {
	errMsg('你还没有登录')
}

/**
 * 抛出统一的“没有权限”错误。
 *
 * @returns 不会返回。
 * @throws 始终抛出错误。
 */
export function err403() {
	errMsg('你没有这个权限')
}

/**
 * 判断当前 UTC 时间是否接近指定的 UTC 整点。
 *
 * 当前实现允许前后约 3 分钟误差，并处理跨天情况。
 *
 * @param targetHour 目标 UTC 小时，通常应在 `0-23` 范围内。
 * @returns 如果当前 UTC 时间与目标小时足够接近，则返回 `true`。
 */
export function isNowAroundUtcHour(targetHour: number) {
	const now = new Date()

	// 获取当前 UTC 小时和分钟
	const utcHour = now.getUTCHours()
	const utcMinute = now.getUTCMinutes()

	// 计算目标时间（UTC）的时间戳（以分钟为单位）
	const targetTimeInMinutes = targetHour * 60

	// 当前时间的总 UTC 分钟
	const nowTimeInMinutes = utcHour * 60 + utcMinute

	// 差值（正负都接受）
	const diff = Math.abs(nowTimeInMinutes - targetTimeInMinutes)

	// 处理跨天情况，例如 targetHour 是 0，而当前时间是 23:58 UTC
	const diffAlt = 1440 - diff // 24 * 60 = 1440

	return diff <= 3 || diffAlt <= 3
}

/**
 * 将纯 base64 字符串解码为字节数组，兼容 Node 与浏览器环境。
 *
 * 说明：
 * - 优先使用浏览器 `atob`，失败后回退到 Node `Buffer`。
 * - 若输入为空或无法解码，返回空数组（长度为 0）。
 *
 * 返回值约定：
 * - 一定返回 `Uint8Array`（不会返回 null/undefined）。
 */
function $decodeBase64ToBytes(base64: string) {
	const pure = base64.trim()

	if (!pure) {
		return new Uint8Array(0)
	}

	try {
		if (typeof atob === 'function') {
			const binary = atob(pure)
			const bytes = new Uint8Array(binary.length)
			for (let i = 0; i < binary.length; i++) {
				bytes[i] = binary.charCodeAt(i)
			}
			return bytes
		}
	} catch {
		// noop
	}

	try {
		if (typeof Buffer !== 'undefined') {
			return Uint8Array.from(Buffer.from(pure, 'base64'))
		}
	} catch {
		// noop
	}

	return new Uint8Array(0)
}

/**
 * 将字节数组指定区间转成 ASCII 字符串。
 *
 * 说明：
 * - 仅做逐字节 ASCII 转换，不做编码探测。
 * - 当区间越界时会自动截断到可读范围。
 *
 * 返回值约定：
 * - 一定返回 `string`（不会返回 null/undefined）。
 */
function $bytesToAscii(bytes: Uint8Array, start: number, end: number) {
	let out = ''
	for (let i = start; i < end && i < bytes.length; i++) {
		out += String.fromCharCode(bytes[i])
	}
	return out
}

/**
 * 清洗 base64 输入，统一得到“纯 base64”（不含 data URL 前缀）。
 *
 * 说明：
 * - 会移除 `data:*;base64,` 前缀。
 * - 会移除所有空白字符并 trim。
 * - 会校验 base64 格式；不合法时返回 null。
 * - 非字符串输入会返回 null。
 *
 * 返回值约定：
 * - 返回合法的纯 base64；不合法时返回 `null`。
 */
export function $purifyBase64(input: string | Null): string | null {
	if (typeof input !== 'string') {
		return null
	}

	const cleaned = input
		.replace(/^data:[^;]+;base64,/i, '')
		.replace(/\s+/g, '')
		.trim()

	if (!cleaned) {
		return null
	}

	if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
		return null
	}

	if (cleaned.length % 4 !== 0) {
		return null
	}

	return cleaned
}

/**
 * 基于“纯 base64”推断图片 mime 类型。
 *
 * 说明：
 * - 自动支持：jpeg/png/gif/webp/bmp/tiff/avif/heic/x-icon。
 * - 输入可为纯 base64 或 data URL，内部会先清洗。
 * - 无法识别时回退为 `image/png`。
 *
 * 返回值约定：
 * - 一定返回非空 mime 字符串（不会返回 null/undefined/空串）。
 */
export function $inferMimeTypeFormPureBase64(pureBase64: string | Null) {
	const normalized = $purifyBase64(pureBase64)
	if (!normalized) {
		return 'image/png'
	}
	const bytes = $decodeBase64ToBytes(normalized)

	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return 'image/jpeg'
	}
	if (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47 &&
		bytes[4] === 0x0d &&
		bytes[5] === 0x0a &&
		bytes[6] === 0x1a &&
		bytes[7] === 0x0a
	) {
		return 'image/png'
	}
	if (
		bytes.length >= 6 &&
		($bytesToAscii(bytes, 0, 6) === 'GIF87a' || $bytesToAscii(bytes, 0, 6) === 'GIF89a')
	) {
		return 'image/gif'
	}
	if (
		bytes.length >= 12 &&
		$bytesToAscii(bytes, 0, 4) === 'RIFF' &&
		$bytesToAscii(bytes, 8, 12) === 'WEBP'
	) {
		return 'image/webp'
	}
	if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
		return 'image/bmp'
	}
	if (
		bytes.length >= 4 &&
		((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
			(bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))
	) {
		return 'image/tiff'
	}
	if (
		bytes.length >= 12 &&
		$bytesToAscii(bytes, 4, 8) === 'ftyp' &&
		$bytesToAscii(bytes, 8, 12) === 'avif'
	) {
		return 'image/avif'
	}
	if (
		bytes.length >= 12 &&
		$bytesToAscii(bytes, 4, 8) === 'ftyp' &&
		($bytesToAscii(bytes, 8, 12) === 'heic' ||
			$bytesToAscii(bytes, 8, 12) === 'heix' ||
			$bytesToAscii(bytes, 8, 12) === 'hevc' ||
			$bytesToAscii(bytes, 8, 12) === 'hevx')
	) {
		return 'image/heic'
	}
	if (
		bytes.length >= 8 &&
		bytes[0] === 0x00 &&
		bytes[1] === 0x00 &&
		bytes[2] === 0x01 &&
		bytes[3] === 0x00
	) {
		return 'image/x-icon'
	}

	return 'image/png'
}

/**
 * 将“纯 base64 或 data URL”统一转成标准 data URL。
 *
 * 说明：
 * - 如果输入本来是 data URL，会清洗并标准化后返回。
 * - 如果输入是纯 base64，会自动推断 mime 并补齐 `data:*;base64,` 前缀。
 * - 非字符串、空字符串或不合法内容返回 null。
 *
 * 返回值约定：
 * - 返回标准 data URL；若输入不合法则返回 `null`。
 */
export function $toDataUrlFromBase64(base64WithDataOrPure: string | Null): string | null {
	if (typeof base64WithDataOrPure !== 'string') {
		return null
	}
	const pure = $purifyBase64(base64WithDataOrPure)
	if (!pure) {
		return null
	}
	try {
		const mime =
			/^data:([^;]+);base64,/i.exec(base64WithDataOrPure.trim())?.[1] ||
			$inferMimeTypeFormPureBase64(pure)
		return `data:${mime};base64,${pure}`
	} catch {
		return null
	}
}

export const $getHue = (json: Object) => {
	let f = ''
	try {
		f = $jsonStringify(json)
	} catch (e) {
		f = String(json)
	}
	return $stringToRange(f, 360)
}

export const $borderColor = (json: any) => `hsl(${$getHue(json)}, 100%, 33%)`
export const $backgroundColor = (json: any) => `hsl(${$getHue(json)}, 100%, 40%)`
