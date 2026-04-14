import { $decodeBase64ToUnicode, $encodeUnicodeToBase64 } from '../x/Functions'

export class StringObfuscator {
	key: string
	length: number

	/**
	 * 创建一个基于 XOR + Base64 的字符串混淆器。
	 *
	 * @param key 用于逐字符 XOR 的密钥。
	 * @param length 可选的固定输出长度；传 `-1` 表示关闭固定长度模式。
	 */
	constructor(key: string, length: number = -1) {
		this.key = key
		this.length = length
	}

	/**
	 * 用给定密钥对字符串的每个字符执行 XOR，必要时循环使用密钥。
	 *
	 * @param str 需要转换的源文本。
	 * @param key 循环参与 XOR 的密钥。
	 * @returns 返回 XOR 处理后的字符串；结果更像二进制文本，不保证可直接阅读。
	 */
	xors(str: string, key: string): string {
		let result = ''
		for (let i = 0; i < str.length; i++) {
			result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length))
		}
		return result
	}

	/**
	 * 将明文混淆成一个适合放在 URL 中的 Base64 风格字符串。
	 *
	 * 行为说明：
	 * - 固定长度模式下，输入会先用空格补齐再进行 XOR。
	 * - 结果会移除 `=` 补位，并把 `/` 替换为 `-`、`+` 替换为 `_`。
	 * - 固定长度模式下，Base64 输出还会被截断到配置长度。
	 *
	 * @param input 要混淆的明文。
	 * @returns 返回适合常见 URL/路径场景使用的混淆字符串。
	 */
	en(input: string): string {
		let length = this.length
		let free = length === -1
		const paddedInput = free ? input : input.padEnd(length, ' ')
		const obfuscated = this.xors(paddedInput, this.key)
		let a = $encodeUnicodeToBase64(obfuscated)
		if (!free) a = a.slice(0, length)
		return a.replace(/=/g, '').replace(/\//g, '-').replace(/\+/g, '_')
	}

	/**
	 * 从混淆字符串中恢复原始明文。
	 *
	 * 说明：
	 * - 会先把 URL 安全替换恢复后再做 Base64 解码。
	 * - 反混淆后会去掉尾部空格，这对固定长度模式很重要。
	 * - 如果输入格式不正确，底层解码步骤可能会抛错。
	 *
	 * @param obfuscated 由 `en` 生成的混淆字符串。
	 * @returns 返回解码后的原文，尾部补位空格会被移除。
	 * @throws 输入无效时会继续向外抛出底层解码错误。
	 */
	de(obfuscated: string): string {
		try {
			const base64Decoded = $decodeBase64ToUnicode(
				obfuscated.replace(/-/g, '/').replace(/_/g, '+'),
			)
			return this.xors(base64Decoded, this.key).trim()
		} catch (error) {
			throw error
		}
	}
}

// const free = new StringObfuscator(SECRET, -1)

// export function $enx(text: string) {
// return cp.AES.encrypt(text, SECRET).toString();
// return free.en(text)
// }

// export function $dex(ciphertext: string) {
// 	// const bytes = cp.AES.decrypt(ciphertext, SECRET);
// 	// return bytes.toString(cp.enc.Utf8);
// 	return free.de(ciphertext)
// }
