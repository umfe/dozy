import { parse, formatHex, formatCss, type Color } from 'culori';
import * as ColorLib from 'culori';

// Re-export everything from culori
export { ColorLib };

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
        return parse(input) || (fallback ? parse(fallback) : undefined);
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
        return parse(fallback);
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
