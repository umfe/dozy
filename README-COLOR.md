# dozy

## Color Module

A powerful and smart color parsing and manipulation module powered by `culori`. It supports all modern CSS color spaces (including OKLCH, Display P3), smart hex recognition, and custom aliases.

### Features

- **Universal Support**: Works with Hex, RGB, HSL, OKLCH, OKLAB, Display P3, and named colors.
- **Smart Parsing**: Automatically detects hex colors even without the `#` prefix (e.g., `ff5555`, `abc`, `aabbccdd`).
- **Custom Aliases**: Pre-configured short codes for common colors.
- **Fallback Support**: Gracefully handle invalid inputs with fallback values.

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

#### `smartString(input: string | any, fallback?: string): string | undefined`

Parses a color and returns its CSS string representation.

- **Parameters**:
    - `input` (`string | any`): The color string to parse. Can be a CSS color, a hex code (with or without `#`), or a registered alias.
    - `fallback` (`string?`): An optional color string to return if parsing fails.
- **Returns**:
    - `string`: The valid CSS color string (e.g., `#ff0000`, `oklch(0.6 0.1 200)`).
    - `undefined`: If parsing fails and no fallback is provided.
- **Examples**:

    ```typescript
    import { smartString } from 'dozy'

    smartString('oklch(60% 0.1 200)') // -> "oklch(0.6 0.1 200)"
    smartString('ff5555') // -> "#ff5555" (Smart Hex)
    smartString('i') // -> "#ffc0cb" (Alias)
    smartString('invalid', 'red') // -> "#ff0000" (Fallback)
    ```

#### `smartParse(input: string | any, fallback?: string): Color | undefined`

Parses a color into a `culori` Color object for advanced manipulation (conversions, adjustments, etc.).

- **Parameters**:
    - `input` (`string | any`): The input color.
    - `fallback` (`string?`): Optional fallback.
- **Returns**:
    - `Color` object (from `culori`) or `undefined`.

#### `registerCustomColor(name: string, color: string): void`

Registers a new global alias.

- **Parameters**:
    - `name` (`string`): The key/name for the alias.
    - `color` (`string`): The valid color value it maps to.
- **Example**:

    ```typescript
    import { registerCustomColor, smartString } from 'dozy'

    registerCustomColor('brand', '#007bff')
    smartString('brand') // -> "#007bff"
    ```

#### `isValidColor(input: string): boolean`

Checks if a string is a valid recognized color.

- **Returns**: `boolean` - `true` if the color can be parsed, `false` otherwise.
