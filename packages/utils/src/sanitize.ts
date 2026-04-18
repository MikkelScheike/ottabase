import createDOMPurify from 'dompurify';

type SanitizeConfig = Record<string, unknown>;

interface PurifyLike {
    sanitize: (dirty: string, cfg?: SanitizeConfig) => string;
}

type PurifyFactory = ((windowLike: Window) => PurifyLike) & Partial<PurifyLike>;

// DOMPurify export shape differs by runtime/bundler:
// - Browser builds often expose a ready instance with `.sanitize`.
// - Node builds expose a factory that needs a Window.
// We normalize both shapes here.
const rawDomPurifyExport = createDOMPurify as unknown as PurifyFactory | { default?: PurifyFactory };
const domPurifyExport =
    typeof rawDomPurifyExport === 'object' && rawDomPurifyExport && 'default' in rawDomPurifyExport
        ? ((rawDomPurifyExport.default ?? rawDomPurifyExport) as PurifyFactory)
        : (rawDomPurifyExport as PurifyFactory);
let cachedPurify: PurifyLike | null | undefined;

function isPurifyLike(value: unknown): value is PurifyLike {
    return Boolean(value && typeof value === 'object' && typeof (value as PurifyLike).sanitize === 'function');
}

function resolvePurify(): PurifyLike | null {
    if (cachedPurify !== undefined) {
        return cachedPurify;
    }

    // Browser / jsdom test env where the default export may already be an instance.
    if (isPurifyLike(domPurifyExport)) {
        cachedPurify = domPurifyExport;
        return cachedPurify;
    }

    // Browser-like env where we can initialize the factory with global window.
    if (typeof window !== 'undefined' && typeof domPurifyExport === 'function') {
        try {
            const browserPurify = domPurifyExport(window);
            if (isPurifyLike(browserPurify)) {
                cachedPurify = browserPurify;
                return cachedPurify;
            }
        } catch {
            // fall through to Node/fallback path
        }
    }

    // Node.js path: lazily require jsdom only when actually running in Node.
    // This avoids pulling jsdom into browser/Workers bundles.
    if (typeof process !== 'undefined' && process.versions?.node && typeof domPurifyExport === 'function') {
        try {
            // eslint-disable-next-line no-eval
            const dynamicRequire = (0, eval)('require') as (id: string) => unknown;
            const { JSDOM } = dynamicRequire('jsdom') as { JSDOM: new (html?: string) => { window: Window } };
            const { window: nodeWindow } = new JSDOM('');
            const nodePurify = domPurifyExport(nodeWindow);
            if (isPurifyLike(nodePurify)) {
                cachedPurify = nodePurify;
                return cachedPurify;
            }
        } catch {
            // Continue to fallback sanitizer below.
        }
    }

    cachedPurify = null;
    return cachedPurify;
}

function toStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function basicFallbackSanitize(input: string, cfg: SanitizeConfig): string {
    const withoutScripts = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    const withoutStyles = withoutScripts.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    const withoutHandlers = withoutStyles.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Rewrite link-like attributes through sanitizeUrl to neutralize unsafe schemes.
    const normalizedLinks = withoutHandlers.replace(
        /\s(href|src|xlink:href|formaction)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
        (_match, attr, _valueWithQuotes, dQuoted, sQuoted, bare) => {
            const rawValue = (dQuoted ?? sQuoted ?? bare ?? '').trim();
            return ` ${String(attr)}="${sanitizeUrl(rawValue)}"`;
        },
    );

    const allowedTags = toStringArray(cfg.ALLOWED_TAGS).map((tag) => tag.toLowerCase());
    if (allowedTags.length === 0) {
        return normalizedLinks;
    }

    const allowedTagSet = new Set(allowedTags);
    return normalizedLinks.replace(/<\/?([a-z][a-z0-9:-]*)(\s[^>]*)?>/gi, (fullTag, tagName: string) => {
        return allowedTagSet.has(tagName.toLowerCase()) ? fullTag : '';
    });
}

function sanitizeWithFallback(input: string, cfg: SanitizeConfig): string {
    const purify = resolvePurify();
    if (purify) {
        return purify.sanitize(input, cfg);
    }

    // Last resort for runtimes without a DOM implementation (e.g. Workers startup).
    return basicFallbackSanitize(input, cfg);
}

/**
 * Allowed URL schemes for anchor href and similar link attributes.
 * `javascript:`, `data:`, `vbscript:` and any unknown scheme are blocked.
 */
const SAFE_URL_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'];

/**
 * Sanitize a URL for use in an anchor href or similar attribute.
 * Returns '#' for any URL whose scheme is not in the safe allowlist.
 * Relative URLs (starting with /, ./, ../, ?, #) are allowed as-is.
 *
 * @example
 * <a href={sanitizeUrl(url)}>link</a>
 */
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return '#';

    const trimmed = url.trim();
    if (!trimmed) return '#';

    // Allow relative URLs
    if (
        trimmed.startsWith('/') ||
        trimmed.startsWith('./') ||
        trimmed.startsWith('../') ||
        trimmed.startsWith('?') ||
        trimmed.startsWith('#')
    ) {
        return trimmed;
    }

    // Parse protocol — must be in the allowlist
    try {
        const parsed = new URL(trimmed);
        if (!SAFE_URL_SCHEMES.includes(parsed.protocol.toLowerCase())) {
            return '#';
        }
    } catch {
        // Unparseable URL (e.g. bare hostname) — block it
        return '#';
    }

    return trimmed;
}

/**
 * Allowed inline tags for EditorJS block content (list items, paragraph spans, step text, etc.).
 * Covers the subset EditorJS tools actually emit: bold, italic, underline, inline code, links, marks.
 */
const INLINE_ALLOWED_TAGS = ['strong', 'em', 'u', 'b', 'i', 's', 'code', 'a', 'span', 'mark', 'br'];

/** Allowed attributes for inline HTML. href/target/rel for links; class for inline-code spans. */
const INLINE_ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Sanitize untrusted inline HTML produced by EditorJS tools.
 * Strips any tag or attribute not in the inline allowlist.
 * Safe for use with React's `dangerouslySetInnerHTML`.
 *
 * @example
 * <span dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(item.content) }} />
 */
export function sanitizeInlineHtml(html: string): string {
    return sanitizeWithFallback(html, {
        ALLOWED_TAGS: INLINE_ALLOWED_TAGS,
        ALLOWED_ATTR: INLINE_ALLOWED_ATTR,
    });
}

/**
 * Sanitize block-level HTML (e.g. HtmlRenderer, raw article HTML).
 * Allows a broader set of tags while still stripping scripts and event handlers.
 * Safe for use with React's `dangerouslySetInnerHTML`.
 *
 * @example
 * <div dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(content) }} />
 */
export function sanitizeBlockHtml(html: string): string {
    return sanitizeWithFallback(html, {
        USE_PROFILES: { html: true },
    });
}

/**
 * Sanitize an SVG string (e.g. an inline icon from editor config).
 * Allows SVG and SVG filter elements, strips scripts and foreign objects.
 * Safe for use with React's `dangerouslySetInnerHTML`.
 *
 * @example
 * <span dangerouslySetInnerHTML={{ __html: sanitizeSvgHtml(icon) }} />
 */
export function sanitizeSvgHtml(svg: string): string {
    return sanitizeWithFallback(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
    });
}
