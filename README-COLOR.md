# dozy

## Color Module

A powerful and smart color parsing and manipulation module powered by `culori`. It supports all modern CSS color spaces (including OKLCH, Display P3), smart hex recognition, and custom aliases.

### Features

- **Universal Support**: Works with Hex, RGB, HSL, OKLCH, OKLAB, Display P3, and named colors.
- **Smart Parsing**: Automatically detects hex colors even without the `#` prefix (e.g., `ff5555`, `abc`, `aabbccdd`).
- **Custom Aliases**: Pre-configured short codes for common colors.
- **Fallback Support**: Gracefully handle invalid inputs with fallback values.
- **Utilities**: Built-in functions for brightness calculation and format conversion.

### Pre-defined Aliases

The following single-letter aliases are available out of the box:

| Alias | Color Value | Description  |
| :---- | :---------- | :----------- |
| `V`   | `#555555`   | Dark Grey    |
| `W`   | `#AAAAAA`   | Light Grey   |
| `v`   | `#000000`   | Black        |
| `w`   | `#FFFFFF`   | White        |
| `R`   | `#AA0000`   | Dark Red     |
| `Y`   | `#FFAA00`   | Orange/Gold  |
| `G`   | `#00AA00`   | Dark Green   |
| `A`   | `#00AAAA`   | Teal         |
| `B`   | `#0000AA`   | Dark Blue    |
| `P`   | `#AA00AA`   | Purple       |
| `r`   | `#FF5555`   | Light Red    |
| `y`   | `#FFFF55`   | Yellow       |
| `g`   | `#55FF55`   | Light Green  |
| `a`   | `#55FFFF`   | Cyan         |
| `b`   | `#5555FF`   | Light Blue   |
| `p`   | `#FF55FF`   | Pink/Magenta |
| `i`   | `#FfC0CB`   | Pink         |

### API Reference

#### Core Parsing

##### `smartString(input: string | any, fallback?: string): string | undefined`
Parses a color and returns its CSS string representation.
```typescript
import { smartString } from 'dozy';
smartString('oklch(60% 0.1 200)'); // -> "oklch(0.6 0.1 200)"
smartString('ff5555');             // -> "#ff5555" (Smart Hex)
```

##### `smartParse(input: string | any, fallback?: string): Color | undefined`
Parses a color into a `culori` Color object for advanced manipulation.

#### Color Information & Conversion

##### `getBrightness(input: string | any): number`
Calculates the brightness (luma) of a color.
*   **Returns**: A number between `0` (black) and `1` (white).
*   **Formula**: `(R * 299 + G * 587 + B * 114) / 1000` (Rec. 601)
```typescript
import { getBrightness } from 'dozy';
getBrightness('#ffffff'); // -> 1
getBrightness('#000000'); // -> 0
```

##### `toHexString(input: string | any): string | undefined`
Converts to a Hex string (e.g., `#ff0000`).

##### `toRgbString(input: string | any): string | undefined`
Converts to an RGB/RGBA string (e.g., `rgb(255, 0, 0)`).

##### `toHslString(input: string | any): string | undefined`
Converts to an HSL/HSLA string (e.g., `hsl(0, 100%, 50%)`).

##### `toRgbaArray(input: string | any): [r, g, b, a] | undefined`
Returns the color as an array of RGBA values.
*   `r, g, b`: 0-255
*   `a`: 0-1
```typescript
import { toRgbaArray } from 'dozy';
toRgbaArray('red'); // -> [255, 0, 0, 1]
```

#### Configuration

##### `registerCustomColor(name: string, color: string): void`
Registers a new global alias.
```typescript
registerCustomColor('brand', '#007bff');
smartString('brand'); // -> "#007bff"
```

##### `isValidColor(input: string): boolean`
Checks if a string is a valid recognized color.
