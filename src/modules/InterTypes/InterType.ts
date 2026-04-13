export type Any = Items<any>
export type Null = undefined | null
export type Nullable<T> = T | Null
export type Items<T> = { [x: string]: T }

export type Hel = HTMLElement
export type UNumber = number | [number, number]
export type Coord = [number, number]
export type Coord3 = [number, number, number]
export type IOpt = Object | undefined
export type Atoa<T> = (i: T) => T
