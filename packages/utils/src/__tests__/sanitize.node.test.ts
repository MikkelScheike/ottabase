// @vitest-environment node
// Tests that sanitize helpers work correctly in a plain Node.js environment
// (no jsdom env). This exercises the lazy-jsdom factory path in sanitize.ts.
import { describe, expect, it } from 'vitest';
import {
    sanitizeBlockHtml,
    sanitizeCssForStyleTag,
    sanitizeInlineHtml,
    sanitizeJsonForScript,
    sanitizeSvgHtml,
} from '../sanitize';

describe('sanitize helpers in Node environment (jsdom factory path)', () => {
    describe('sanitizeInlineHtml', () => {
        it('strips <script> tags', () => {
            const input = 'hello <script>alert(1)</script> world';
            const result = sanitizeInlineHtml(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('hello');
        });

        it('strips javascript: href from inline links', () => {
            const input = '<a href="javascript:alert(1)">click</a>';
            const result = sanitizeInlineHtml(input);
            expect(result).not.toContain('javascript:');
        });

        it('preserves safe inline tags', () => {
            const result = sanitizeInlineHtml('<strong>bold</strong> and <em>italic</em>');
            expect(result).toContain('<strong>bold</strong>');
            expect(result).toContain('<em>italic</em>');
        });

        it('does not throw and returns a string', () => {
            expect(() => sanitizeInlineHtml('')).not.toThrow();
            expect(typeof sanitizeInlineHtml('test')).toBe('string');
        });
    });

    describe('sanitizeBlockHtml', () => {
        it('strips <script> tags', () => {
            const input = '<div><script>evil()</script><p>safe</p></div>';
            const result = sanitizeBlockHtml(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>safe</p>');
        });

        it('strips event handlers', () => {
            const input = '<p onclick="evil()">text</p>';
            const result = sanitizeBlockHtml(input);
            expect(result).not.toContain('onclick');
        });

        it('does not throw and returns a string', () => {
            expect(() => sanitizeBlockHtml('')).not.toThrow();
            expect(typeof sanitizeBlockHtml('<p>hello</p>')).toBe('string');
        });
    });

    describe('sanitizeSvgHtml', () => {
        it('strips <script> inside SVG', () => {
            const input = '<svg><script>alert(1)</script><circle r="5"/></svg>';
            const result = sanitizeSvgHtml(input);
            expect(result).not.toContain('<script>');
        });

        it('does not throw and returns a string', () => {
            expect(() => sanitizeSvgHtml('')).not.toThrow();
            expect(typeof sanitizeSvgHtml('<svg><circle r="5"/></svg>')).toBe('string');
        });
    });

    describe('sanitizeJsonForScript', () => {
        it('escapes script-breaking sequences', () => {
            const result = sanitizeJsonForScript({ text: '</script><script>x</script>' });
            expect(result).not.toContain('</script>');
            expect(result).toContain('\\u003c/script\\u003e');
        });

        it('returns null literal for undefined input', () => {
            expect(sanitizeJsonForScript(undefined)).toBe('null');
        });

        it('returns null literal for circular input', () => {
            const circular: Record<string, unknown> = {};
            circular.self = circular;

            expect(sanitizeJsonForScript(circular)).toBe('null');
        });
    });

    describe('sanitizeCssForStyleTag', () => {
        it('sanitizes style break-out payloads', () => {
            const input = '</style><script>alert(1)</script>body{background:url(javascript:alert(1))}';
            const result = sanitizeCssForStyleTag(input);
            expect(result).not.toContain('</style>');
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('javascript:');
        });
    });
});
