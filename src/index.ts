export * from './Dozy.js'
export * from './Fs.js'

// // Common utility functions to publish in the `dozy` package

// export function isObject(value: unknown): value is Record<string, unknown> {
// 	return value !== null && typeof value === 'object'
// }

// export function deepClone<T>(value: T): T {
// 	if (typeof structuredClone === 'function') {
// 		// @ts-ignore -- structuredClone exists in modern runtimes
// 		return structuredClone(value)
// 	}
// 	return JSON.parse(JSON.stringify(value))
// }

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

// export function capitalize(s: string) {
// 	if (!s) return s
// 	return s.charAt(0).toUpperCase() + s.slice(1)
// }

// export function clamp(n: number, min: number, max: number) {
// 	return Math.min(max, Math.max(min, n))
// }

// export default {
// 	isObject,
// 	deepClone,
// 	debounce,
// 	throttle,
// 	capitalize,
// 	clamp,
// }
