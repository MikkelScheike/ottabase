
/**
 * Convert a string into a URL-friendly slug.
 */
export function makeSlug(str: string, replaceSpaceWith: string = '-'): string {
    if (!str) return '';
    // Normalize Unicode characters (e.g., é → e, ñ → n)
    const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Clean up the string
    const cleaned = normalized
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove any special characters that aren't letters, numbers, spaces, or hyphens
        .replace(/[^\p{ASCII}\w-]/gu, '') // remove any non-ASCII characters
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/[\s/]+/g, replaceSpaceWith); // replace any spaces or forward slashes with replacement character
    return cleaned.replace(/^-+|-+$/g, '').substring(0, 256);
}

/**
 * Get a specific segment from a slug or path.
 */
export function getSegment(slug: string | null, separator: string = "/", segmentNumber: number = 1): string | null {
    if (!slug) return null;
    const segments = slug.split(separator);
    return (segments.length > 0) ? (segments[segmentNumber - 1] ?? null) : null;
}

/**
 * Extract domain name from a URL.
 */
export function getDomainName(url: string, removeWww: boolean = true): string | null {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        let hostname = urlObj.hostname;
        if (removeWww && hostname.startsWith('www.')) {
            hostname = hostname.substring(4);
        }
        return hostname;
    } catch (error) {
        console.error(`Invalid URL: ${url}`, error);
        return null;
    }
}

/**
 * Join multiple path segments into a single path.
 */
export function joinPaths(...paths: string[]): string {
    const segments = paths.filter(path => !!path); // ignore invalid
    if (segments.length === 0) return '';

    let finalPath = segments.join('/')
        .replace(/(?<!:)\/+/g, '/'); // replace multiple slashes with a single slash, except after colon
    if (finalPath !== '/') {
        finalPath = finalPath.replace(/\/+$/g, ''); // remove trailing slash if it's not just a single slash
    }
    return finalPath;
}

/**
 * Get the base URL from the current window location.
 */
export function getBaseUrl(): string {
    if (typeof window === 'undefined') return '';
    return window?.location?.origin ?? '';
}

/**
 * Prepend base URL to relative paths.
 */
export function prependBaseUrlForRelativePath(url: string, baseUrl: string = String(process.env.BASE_URL ?? '')): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return joinPaths(baseUrl, url);
}

/**
 * Check if a string is a valid URL.
 */
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Replace multiple consecutive slashes with single slash, except after colon.
 */
export function replaceDoubleSlashes(url: string): string {
    if (!url) return url;
    return url.replace(/(?<!:)\/+/g, '/'); // replace multiple slashes with single slash, except after colon
}
