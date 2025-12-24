import { $decodeBase64ToUnicode, $encodeUnicodeToBase64 } from '../Functions'

export class StringObfuscator {
	key: string
	length: number

	constructor(key: string, length: number = -1) {
		this.key = key
		this.length = length
	}

	xors(str: string, key: string): string {
		let result = ''
		for (let i = 0; i < str.length; i++) {
			result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length))
		}
		return result
	}

	en(input: string): string {
		let length = this.length
		let free = length === -1
		const paddedInput = free ? input : input.padEnd(length, ' ')
		const obfuscated = this.xors(paddedInput, this.key)
		let a = $encodeUnicodeToBase64(obfuscated)
		if (!free) a = a.slice(0, length)
		return a.replace(/=/g, '').replace(/\//g, '-').replace(/\+/g, '_')
	}

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
