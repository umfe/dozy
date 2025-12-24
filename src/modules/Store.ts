// --- JSON ---
export const $jsonParse = JSON.parse
export const $jsonStringify = JSON.stringify

// --- Object ---
export const $keys = Object.keys as <T extends object>(obj: T) => (keyof T & string)[]
export const $entries = Object.entries as <T extends object>(
	obj: T,
) => [keyof T & string, T[keyof T]][]
export const $values = Object.values
export const $assign = Object.assign
export const $defineProperty = Object.defineProperty
export const $freeze = Object.freeze
export const $is = Object.is

// --- Array ---
export const $arrayFrom = Array.from
export const $arrayIsArray = Array.isArray

// --- String ---
export const $stringFromCharCode = String.fromCharCode
export const $stringFromCodePoint = String.fromCodePoint

// --- Number ---
export const $numberIsNaN = Number.isNaN
export const $numberIsFinite = Number.isFinite

// --- Math ---
export const $math = Math

// --- Date ---
export const $now = Date.now
export const $date = Date

// --- Promise ---
export const $promise = Promise

// --- URL / URLSearchParams ---
export const $URL = URL
export const $URLSearchParams = URLSearchParams

// --- StructuredClone ---
export const $clone = globalThis.structuredClone

// --- DOM（仅在浏览器中存在）---
export const $window = typeof window === 'undefined' ? undefined : window
export const $document = typeof document === 'undefined' ? undefined : document
export const $location = typeof window === 'undefined' ? undefined : window.location
export const $open = typeof window === 'undefined' ? undefined : window.open
export const $setTimeout = typeof window === 'undefined' ? undefined : window.setTimeout
export const $clearTimeout = typeof window === 'undefined' ? undefined : window.clearTimeout
export const $setInterval = typeof window === 'undefined' ? undefined : window.setInterval
export const $clearInterval = typeof window === 'undefined' ? undefined : window.clearInterval

// --- Fetch / Headers / Request / Response ---
export const $fetch = typeof fetch === 'undefined' ? undefined : fetch
export const $Headers = typeof Headers === 'undefined' ? undefined : Headers
export const $Request = typeof Request === 'undefined' ? undefined : Request
export const $Response = typeof Response === 'undefined' ? undefined : Response

// --- Console ---

export const $log = <T>(a?: T, ...x: any[]) => {
	console.log(a, ...x) // Allow user to override console.log
	return a
}

// --- Crypto ---
export const $crypto = typeof crypto === 'undefined' ? undefined : crypto
