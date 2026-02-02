# Color Module

A powerful color manipulation module built on top of [culori](https://github.com/Evercoder/culori). It supports all CSS color spaces (RGB, HSL, OKLCH, etc.), smart parsing, and custom aliases.

## Features

- **Universal Support**: Works with Hex, RGB, HSL, OKLCH, P3, and named colors.
- **Smart Parsing**:
    - Auto-detects Hex codes without `#` (e.g., `ff0000` -> `#ff0000`).
    - Supports 3, 4, 6, and 8-digit Hex codes.
    - Accepts `Color` objects directly (passthrough).
- **Custom Aliases**: Pre-defined short codes for common colors.
- **Flexible Inputs**: All functions accept `string | Color | any`.

## Usage

```typescript
import {
	smartParse,
	smartString,
	toHexString,
	toRgbaArray,
	getBrightness,
	registerCustomColor,
} from 'dozy'

// Smart Parsing
smartParse('ff0000') // -> Color object for red
smartParse('abc') // -> Color object for #aabbcc (via auto-hex or custom alias)
smartParse('oklch(60% 0.15 50)') // -> Color object

// Smart String (returns CSS string)
smartString('ff0000') // -> "#ff0000"
smartString('red') // -> "red"

// Conversions
toHexString('rgb(255, 0, 0)') // -> "#ff0000"
toRgbString('#f00') // -> "rgb(255, 0, 0)"
toHslString('blue') // -> "hsl(240, 100%, 50%)"

// Brightness (0-1)
getBrightness('#000') // -> 0
getBrightness('#fff') // -> 1
```

## Pre-defined Aliases

| Alias | Color        | Hex       |
| ----- | ------------ | --------- |
| `v`   | Black        | `#000000` |
| `w`   | White        | `#FFFFFF` |
| `V`   | Dark Grey    | `#555555` |
| `W`   | Light Grey   | `#AAAAAA` |
| `R`   | Dark Red     | `#AA0000` |
| `r`   | Light Red    | `#FF5555` |
| `G`   | Dark Green   | `#00AA00` |
| `g`   | Light Green  | `#55FF55` |
| `B`   | Dark Blue    | `#0000AA` |
| `b`   | Light Blue   | `#5555FF` |
| `Y`   | Dark Yellow  | `#FFAA00` |
| `y`   | Light Yellow | `#FFFF55` |
| `A`   | Dark Cyan    | `#00AAAA` |
| `a`   | Light Cyan   | `#55FFFF` |
| `P`   | Dark Purple  | `#AA00AA` |
| `p`   | Light Purple | `#FF55FF` |
| `i`   | Pink         | `#FfC0CB` |

## API Reference

### `smartParse(input: string | Color | any, fallback?: string): Color | undefined`

Smartly parses a color string or object.

- **input**: The color string (e.g., `'#fff'`, `'ff0000'`, `'red'`) or a `Color` object.
- **fallback**: Optional color to return if parsing fails.

### `smartString(input: string | Color | any, fallback?: string): string | undefined`

Parses a color and returns a valid CSS string (Hex for sRGB, functional notation for others).

### `isValidColor(input: string | Color | any): boolean`

Checks if the input is a valid color.

### `getBrightness(input: string | Color | any): number`

Calculates brightness using Rec. 601 luma formula: `(R*299 + G*587 + B*114) / 1000`.

- Returns: `0` (black) to `1` (white).

### `toHexString(input: string | Color | any): string | undefined`

Converts input to a Hex string (e.g., `#ff0000`).

### `toRgbString(input: string | Color | any): string | undefined`

Converts input to `rgb()` or `rgba()` string.

### `toHslString(input: string | Color | any): string | undefined`

Converts input to `hsl()` or `hsla()` string.

### `toRgbaArray(input: string | Color | any): [number, number, number, number] | undefined`

Returns an array `[r, g, b, a]`.

- `r, g, b`: 0-255
- `a`: 0-1

### `registerCustomColor(name: string, color: string): void`

Registers a new global alias.

```typescript
registerCustomColor('myBrand', '#123456')
smartParse('myBrand') // -> Color object for #123456
```
