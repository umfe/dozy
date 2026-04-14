export type Any = Items<any>
export type Null = undefined | null | void

/**
 * 判断一个值在本包语义下是否属于空值。
 *
 * 该函数会把以下值视为空值：
 * - `null`
 * - `undefined`
 * - `void 0`
 *
	 * @typeParam T 原始候选类型。
	 * @param v 要检测的值。
	 * @returns 当 `v` 是 `null` 或 `undefined` 时返回 `true`，否则返回 `false`。
 */
export function isNull<T>(v: T | Null): v is Null {
	return v === null || v === undefined || v === void 0
}
export type Nullable<T> = T | Null
export type Items<T> = { [x: string]: T }

export type Hel = HTMLElement
export type UNumber = number | [number, number]
export type Coord = [number, number]
export type Coord3 = [number, number, number]
export type IOpt = Object | undefined
export type Atoa<T> = (i: T) => T
