import { parse, formatHex, formatCss, converter, type Color } from 'culori';
import * as ColorLib from 'culori';

// Re-export everything from culori
export { ColorLib };

// Converters
const toRgb = converter('rgb');
const toHsl = converter('hsl');

// Custom colors map for fallback/alias
const customColorMap: Record<string, string> = {
    V: '#555555',
    W: '#AAAAAA',
    v: '#000000',
    w: '#FFFFFF',

    R: '#AA0000',
    Y: '#FFAA00',
    G: '#00AA00',
    A: '#00AAAA',
    B: '#0000AA',
    P: '#AA00AA',

    r: '#FF5555',
    y: '#FFFF55',
    g: '#55FF55',
    a: '#55FFFF',
    b: '#5555FF',
    p: '#FF55FF',

    i: '#FfC0CB',
};

/**
 * Register a custom color alias.
 * @param name The name of the alias (e.g., 'abc', 'myColor')
 * @param color The valid color string it maps to (e.g., '#ff0000', 'red')
 */
export function registerCustomColor(name: string, color: string) {
    customColorMap[name] = color;
}

/**
 * Smartly parses a color string.
 * Supports:
 * - All standard CSS colors (names, hex, rgb, hsl, oklch, etc.) via culori.
 * - Hex strings without '#' (e.g., 'ff5555', 'abc', 'aabbccdd').
 * - Custom aliases registered via registerCustomColor.
 * 
 * @param input The color string to parse.
 * @param fallback Optional fallback color string if parsing fails.
 * @returns The parsed Color object or undefined if invalid.
 */
export function smartParse(input: string | any, fallback?: string): Color | undefined {
    if (typeof input !== 'string') {
        return parse(input) || (fallback ? smartParse(fallback) : undefined);
    }

    // 1. Try parsing directly
    let parsed = parse(input);
    if (parsed) return parsed;

    // 2. Check custom map first (allow overriding standard logic if needed, or just aliases)
    // Actually, usually aliases handle "abc" which fails standard parse.
    if (customColorMap[input]) {
        parsed = parse(customColorMap[input]);
        if (parsed) return parsed;
    }

    // 3. Try hex without hash
    // Matches 3, 4, 6, or 8 hex characters
    if (/^([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(input)) {
        parsed = parse('#' + input);
        if (parsed) return parsed;
    }

    // 4. Fallback
    if (fallback) {
        return smartParse(fallback);
    }

    return undefined;
}

/**
 * Smartly parses a color and returns a CSS string.
 * Defaults to Hex for sRGB colors, or CSS function for others (like oklch).
 */
export function smartString(input: string | any, fallback?: string): string | undefined {
    const parsed = smartParse(input, fallback);
    if (!parsed) return undefined;
    return formatCss(parsed);
}

/**
 * Check if a color string is valid (smartly).
 */
export function isValidColor(input: string): boolean {
    return !!smartParse(input);
}

/**
 * Calculates the brightness of a color.
 * Uses the Rec. 601 luma formula: (R * 299 + G * 587 + B * 114) / 1000.
 * Returns a value between 0 (black) and 1 (white).
 * 
 * @param input The color to check.
 * @returns The brightness value (0-1), or 0 if invalid.
 */
export function getBrightness(input: string | any): number {
    const color = smartParse(input);
    if (!color) return 0;

    const rgb = toRgb(color);
    if (!rgb) return 0;

    // culori rgb channels are 0-1
    // Formula matches: (r*255 * 299 + ...) / 255000  =>  (r*299 + ...) / 1000
    const r = rgb.r ?? 0;
    const g = rgb.g ?? 0;
    const b = rgb.b ?? 0;

    return (r * 0.299) + (g * 0.587) + (b * 0.114);
}

/**
 * Converts a color to an RGBA array [r, g, b, a].
 * RGB values are 0-255, Alpha is 0-1.
 * 
 * @param input The color to convert.
 * @returns [r, g, b, a] or undefined if invalid.
 */
export function toRgbaArray(input: string | any): [number, number, number, number] | undefined {
    const color = smartParse(input);
    if (!color) return undefined;

    const rgb = toRgb(color);
    if (!rgb) return undefined;

    return [
        Math.round((rgb.r ?? 0) * 255),
        Math.round((rgb.g ?? 0) * 255),
        Math.round((rgb.b ?? 0) * 255),
        rgb.alpha ?? 1
    ];
}

/**
 * Converts a color to a Hex string.
 * @param input The color.
 * @returns Hex string (e.g. #ff0000) or undefined.
 */
export function toHexString(input: string | any): string | undefined {
    const color = smartParse(input);
    if (!color) return undefined;
    return formatHex(color);
}

/**
 * Converts a color to an RGB/RGBA string.
 * Uses modern comma-separated syntax for compatibility if preferred, or standard CSS.
 * Note: culori's formatRgb might use space-separated syntax (CSS Color 4).
 * This function forces comma-separated legacy syntax: rgb(r, g, b) or rgba(r, g, b, a).
 * 
 * @param input The color.
 * @returns RGB/RGBA string or undefined.
 */
export function toRgbString(input: string | any): string | undefined {
    const arr = toRgbaArray(input);
    if (!arr) return undefined;

    const [r, g, b, a] = arr;
    if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a color to an HSL/HSLA string.
 * Forces legacy comma-separated syntax: hsl(h, s%, l%) or hsla(h, s%, l%, a).
 * 
 * @param input The color.
 * @returns HSL/HSLA string or undefined.
 */
export function toHslString(input: string | any): string | undefined {
    const color = smartParse(input);
    if (!color) return undefined;

    const hsl = toHsl(color);
    if (!hsl) return undefined;

    const h = Math.round(hsl.h ?? 0);
    const s = Math.round((hsl.s ?? 0) * 100);
    const l = Math.round((hsl.l ?? 0) * 100);
    const a = hsl.alpha ?? 1;

    if (a < 1) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }
    return `hsl(${h}, ${s}%, ${l}%)`;
}
