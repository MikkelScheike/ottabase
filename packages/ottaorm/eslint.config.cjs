const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

// Flat config (ESLint v9). The repo root still uses legacy .eslintrc.js, which ESLint v9
// does not auto-detect — so without this file `pnpm lint` errored out instead of linting.
module.exports = [
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.turbo/**'],
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
];
