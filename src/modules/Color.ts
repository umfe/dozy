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
 * 注册一个自定义颜色别名。
 * @param name 别名名称，例如 `abc`、`myColor`。
 * @param color 别名实际映射到的合法颜色字符串，例如 `#ff0000`、`red`。
 */
export function registerCustomColor(name: string, color: string) {
    customColorMap[name] = color;
}

/**
 * 智能解析颜色字符串。
 * 支持：
 * - 通过 culori 解析所有标准 CSS 颜色（名称、hex、rgb、hsl、oklch 等）。
 * - 不带 `#` 的十六进制字符串（如 `ff5555`、`abc`、`aabbccdd`）。
 * - 通过 `registerCustomColor` 注册的自定义别名。
 * - 已经是 `Color` 对象的输入（直接透传）。
 * 
 * @param input 要解析的颜色字符串或 `Color` 对象。
 * @param fallback 解析失败时可选的兜底颜色字符串。
 * @returns 解析成功时返回 `Color` 对象，失败时返回 `undefined`。
 */
export function smartParse(input: string | Color | any, fallback?: string): Color | undefined {
    // If input is already a Color object (has 'mode'), return it directly
    if (typeof input === 'object' && input !== null && 'mode' in input) {
        return input as Color;
    }

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
 * 智能解析颜色并返回对应的 CSS 字符串。
 * 对 sRGB 颜色通常会输出 Hex，其它颜色空间可能输出 CSS 函数形式（如 oklch）。
 * @param input 颜色字符串或颜色对象。
 */
export function smartString(input: string | Color | any, fallback?: string): string | undefined {
    const parsed = smartParse(input, fallback);
    if (!parsed) return undefined;
    return formatCss(parsed);
}

/**
 * 智能判断一个颜色输入是否有效。
 * @param input 颜色字符串或颜色对象。
 */
export function isValidColor(input: string | Color | any): boolean {
    return !!smartParse(input);
}

/**
 * 计算颜色的亮度。
 * 使用 Rec. 601 亮度公式：`(R * 299 + G * 587 + B * 114) / 1000`。
 * 返回值范围通常在 0（黑）到 1（白）之间。
 * 
 * @param input 要检测的颜色字符串或对象。
 * @returns 返回亮度值（0-1）；如果颜色无效则返回 `0`。
 */
export function getBrightness(input: string | Color | any): number {
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
 * 将颜色转换为 RGBA 数组 `[r, g, b, a]`。
 * 其中 RGB 范围是 0-255，Alpha 范围是 0-1。
 * 
 * @param input 要转换的颜色字符串或对象。
 * @returns 转换成功时返回 `[r, g, b, a]`，无效时返回 `undefined`。
 */
export function toRgbaArray(input: string | Color | any): [number, number, number, number] | undefined {
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
 * 将颜色转换为 Hex 字符串。
 * @param input 颜色字符串或颜色对象。
 * @returns 成功时返回如 `#ff0000` 这样的字符串，失败时返回 `undefined`。
 */
export function toHexString(input: string | Color | any): string | undefined {
    const color = smartParse(input);
    if (!color) return undefined;
    return formatHex(color);
}

/**
 * 将颜色转换为 RGB/RGBA 字符串。
 * 为兼容性考虑，这里强制输出旧式逗号分隔语法：`rgb(r, g, b)` 或 `rgba(r, g, b, a)`。
 * 
 * @param input 颜色字符串或颜色对象。
 * @returns 成功时返回 RGB/RGBA 字符串，失败时返回 `undefined`。
 */
export function toRgbString(input: string | Color | any): string | undefined {
    const arr = toRgbaArray(input);
    if (!arr) return undefined;

    const [r, g, b, a] = arr;
    if (a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 将颜色转换为 HSL/HSLA 字符串。
 * 这里强制输出旧式逗号分隔语法：`hsl(h, s%, l%)` 或 `hsla(h, s%, l%, a)`。
 * 
 * @param input 颜色字符串或颜色对象。
 * @returns 成功时返回 HSL/HSLA 字符串，失败时返回 `undefined`。
 */
export function toHslString(input: string | Color | any): string | undefined {
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
