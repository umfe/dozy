const webSide = typeof window !== 'undefined'
import { $genSSF, $lplus, $s, xtrim } from '../../x/Functions'
import { __GensDirectives } from './GensDirectives.js'
import { __GensStyleIds } from './GensStyleIds.js'

const _escapeBase: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
}
const _escapeRegex = /[&<>"']/g

/** HTML 转义（' → &#39;，兼容 HTML4/5） */
export function $escapeHTML(str?: string) {
	if (!str) return ''
	return str.replace(_escapeRegex, (ch) => _escapeBase[ch] || '&#39;')
}

/** XML 转义（' → &apos;，符合 XML 1.0 规范） */
export function $escapeXML(str?: string) {
	if (!str) return ''
	return str.replace(_escapeRegex, (ch) => _escapeBase[ch] || '&apos;')
}

export class RainbowGen {
	i = -1
	ten = 10

	static staticRainbowHTMLRaw(text: string, dark: boolean = false, offset: number = 0) {
		const map = getColorMap(dark)
		let r = ''
		text = text.trim()
		// let rainbow = new RainbowGen(offset);
		for (let i = 0; i < text.length; i++) {
			const val = (i + offset) % map.length

			let char = text[i]
			if (char === ' ') char = '&nbsp;'
			r += char + `^&color: ${map[val]}&^`
		}
		return r
	}

	static rainbowHTMLRaw(text: string, version: number = 0, offset: number = 0) {
		let r = ''
		text = text.trim()
		let rainbow = new RainbowGen(offset)
		for (let i = 0; i < text.length; i++) {
			let char = text[i]
			if (char === ' ') char = '&nbsp;'
			r += char + `^${rainbow.getStyleId(version)}^`
		}
		return r
	}

	backAStep() {
		this.i = $lplus(this.i, this.ten, -1)
		return this
	}

	getColorValue() {
		this.i = $lplus(this.i, this.ten)
		return 'var(--rb' + this.i + ')'
	}

	versions = [0, this.ten, 2 * this.ten]
	// staticStyleIdMap = 'r y g a p ';

	// getStaticStyleId(dark: boolean = false) {
	// 	this.i = $lplus(this.i, this.ten);
	// 	let a = this.staticStyleIdMap[this.i] || ``;
	// 	if (!a) {
	// 	}
	// 	return dark ? a.toUpperCase() : a;
	// }

	getStyleId(version: number) {
		this.i = $lplus(this.i, this.ten)
		let a = '' + (this.i + this.versions[version])
		return a.length > 1 ? `&${a}&` : a
	}

	constructor(useTimes: number = 0) {
		this.i = $lplus(this.i, this.ten, useTimes)
	}
}

export function boxShadow(color: string = '#000') {
	return `box-shadow: 0 0 1px 1px ${color};`
}

export function textShadow(color: string = '#000', focus?: boolean, removeName: boolean = false) {
	color = color.trim()
	const pre = removeName ? '' : 'text-shadow: '
	const suf = removeName ? '' : ';'
	return focus
		? `${pre}-1px -1px 1px ${color}, 1px 1px 1px ${color}${suf}`
		: `${pre}0 0 8px ${color}${suf}`
}

// function s() {}
type StringNode = string | StringNode[]
/*
superx方法功能最全
i方法 里面没有{}的解析
*/
export function s(literature: string, ...args: any[]) {
	return Gens(literature, ...args)
}
const __GensSSF = $genSSF((s1, s2) => __GensBeTag(s1, s2))
const _GensStyleIds = __GensStyleIds()
const _GensDirectives = __GensDirectives()

export function getColorMap(dark: boolean = false) {
	const map = [
		'#f55', // 0
		'#f85', // 1
		'#fa0', // 2
		'#8f5', // 3
		'#5f5', // 4
		'#5f8', // 5
		'#5ff', // 6
		'#88f', // 7
		'#f5f', // 8
		'#f58', // 9
	]
	return dark
		? map.map((color) =>
				color.replace(/a/g, '5').replace(/f/g, 'a').replace(/5/g, '0').replace(/8/g, '5'),
			)
		: map
}

export function Gens(literature: string, ...args: any[]) {
	let variantChar = '§'
	let r = xtrim(literature)
	r = __GensStringNodeToHTML(r)
	if (r.includes(variantChar)) {
		for (const el of args) {
			r = r.replace(variantChar, el)
		}
	}

	const map = getColorMap()
	return webSide ? r : r.replace(/var\(--rb(\d)\)/g, (_, n) => map[n])
}
function __GensBeTag(value: string, args?: string): string {
	if (value.startsWith('%')) {
		let directiveName = value.substring(1)
		let directive = _GensDirectives[directiveName]
		if (!directive) return ''
		if (typeof directive !== 'function') {
			console.log('Gens directive not a function: ', directiveName)
			return ''
		}
		if (!args) args = ''
		return directive(...args.split('&').map((v) => v.trim()))
	}
	value = value.replace(/\n/g, '<br>')
	if (!args) return value
	let trail = ''
	if (args.length > 1) {
		let a = args[0]
		let b = args.substring(1)
		if (a !== '&') {
			args = a
			trail = b
		} else {
			let last = b.indexOf('&')
			if (last < 0) last = b.length
			args = b.substring(0, last)
			trail = b.substring(last + 1)
		}
	}
	let x = _GensStyleIds[args] || args.trim()
	x = "<span style='" + x + '' + "'" + '>'
	let r = x + value + '</span>'
	return trail ? __GensBeTag(r, trail) : r
}
function __GensStringToArray(input: string): StringNode {
	try {
		const stack: (string | any[])[] = [[]] // 栈初始化为一个空数组
		let currentChunk = '' // 用于累积当前的非嵌套字符

		for (let i = 0; i < input.length; i++) {
			const char = input[i]

			if (char === '{') {
				// 将当前累积的字符作为字符串推入栈顶的数组
				if (currentChunk) {
					;(<any>stack[stack.length - 1]).push(currentChunk)
					currentChunk = ''
				}
				// 创建一个新的数组，推入栈顶，并作为新的栈顶
				const newArray: any[] = []
				;(<any>stack[stack.length - 1]).push(newArray)
				stack.push(newArray)
			} else if (char === '}') {
				// 将当前累积的字符作为字符串推入栈顶的数组
				if (currentChunk) {
					;(<any>stack[stack.length - 1]).push(currentChunk)
					currentChunk = ''
				}
				// 弹出栈顶，回到上一层级
				stack.pop()
			} else {
				// 累积非嵌套字符
				currentChunk += char
			}
		}

		// 处理最后可能剩余的字符
		if (currentChunk) {
			;(<any>stack[stack.length - 1]).push(currentChunk)
		}

		return <any>stack[0]
	} catch (error) {
		return input
	}
}

function __GensStringNodeToHTML(sn: StringNode, noIndent: boolean = false): string {
	if (!sn) return ''
	if ($s(sn)) {
		let str = <string>sn
		return noIndent
			? __GensSSF(str)
			: __GensStringNodeToHTML(__GensStringToArray(<string>sn), true)
	}
	let r = ''
	let w = <any[]>sn
	w.forEach((v) => {
		r += v instanceof Array ? __GensStringNodeToHTML(v, true) : v
	})
	return __GensStringNodeToHTML(r, true)
}
// function __SuperxIsLiterature(str: string) {
// 	let bv = str.contain('{', '}', '&', '^', '%');
// 	return bv || bv === false;
// }
