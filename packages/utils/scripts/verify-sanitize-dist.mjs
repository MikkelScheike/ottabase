import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const cjsPath = path.join(packageRoot, 'dist', 'sanitize.js');
const esmPath = path.join(packageRoot, 'dist', 'sanitize.mjs');

const require = createRequire(import.meta.url);

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runSanitizationChecks(mod, label) {
    assert(typeof mod.sanitizeInlineHtml === 'function', `${label}: sanitizeInlineHtml export missing`);
    assert(typeof mod.sanitizeBlockHtml === 'function', `${label}: sanitizeBlockHtml export missing`);
    assert(typeof mod.sanitizeSvgHtml === 'function', `${label}: sanitizeSvgHtml export missing`);
    assert(typeof mod.sanitizeUrl === 'function', `${label}: sanitizeUrl export missing`);

    const inlineResult = mod.sanitizeInlineHtml('x<script>alert(1)</script>y');
    assert(typeof inlineResult === 'string', `${label}: sanitizeInlineHtml should return string`);
    assert(!inlineResult.includes('<script>'), `${label}: sanitizeInlineHtml failed to strip <script>`);

    const blockResult = mod.sanitizeBlockHtml('<div onclick="evil()">ok</div>');
    assert(typeof blockResult === 'string', `${label}: sanitizeBlockHtml should return string`);
    assert(!blockResult.includes('onclick='), `${label}: sanitizeBlockHtml failed to strip event handler`);

    const svgResult = mod.sanitizeSvgHtml('<svg><script>evil()</script><circle r="5"/></svg>');
    assert(typeof svgResult === 'string', `${label}: sanitizeSvgHtml should return string`);
    assert(!svgResult.includes('<script>'), `${label}: sanitizeSvgHtml failed to strip <script>`);

    assert(mod.sanitizeUrl('javascript:alert(1)') === '#', `${label}: sanitizeUrl must block javascript:`);
    assert(mod.sanitizeUrl('https://example.com') === 'https://example.com', `${label}: sanitizeUrl must allow https`);
}

(async () => {
    try {
        const cjsMod = require(cjsPath);
        runSanitizationChecks(cjsMod, 'CJS dist/sanitize.js');

        const esmMod = await import(pathToFileURL(esmPath).href);
        runSanitizationChecks(esmMod, 'ESM dist/sanitize.mjs');

        console.log('verify-sanitize-dist: OK (CJS + ESM runtime checks passed)');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`verify-sanitize-dist: FAILED - ${message}`);
        process.exit(1);
    }
})();
