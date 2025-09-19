import type { StorybookConfig } from '@storybook/react-webpack5';
import { dirname, join } from 'path';

// Resolve root Storybook folder for shared mocks and aliases
const projectRoot = join(__dirname, '../../..');
const rootStorybook = join(projectRoot, '.storybook');

const config: StorybookConfig = {
    stories: [
        '../**/*.stories.@(js|jsx|ts|tsx|mdx)',
    ],
    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-docs"),
    ],
    framework: {
        name: getAbsolutePath("@storybook/react-webpack5"),
        options: {},
    },
    docs: {
        defaultName: 'Documentation',
    },
    typescript: {
        check: false,
    },
    core: {
        disableTelemetry: true,
    },

    async webpackFinal(config) {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...(config.resolve.alias ?? {}),
            '@': join(__dirname, '..'), // App root
            // Mock Next.js font loaders to match root Storybook behavior
            'next/font/google': join(rootStorybook, 'next-font-mock.js'),
            'next/font/local': join(rootStorybook, 'next-font-mock.js'),
            // Add workspace packages
            '@ottabase/ui-core': join(projectRoot, 'packages/ui-core/src'),
            '@ottabase/ui-components': join(projectRoot, 'packages/ui-components/src'),
            '@ottabase/config': join(projectRoot, 'packages/config/src'),
            '@ottabase/state': join(projectRoot, 'packages/state/src'),
            '@ottabase/ui-code-highlight': join(projectRoot, 'packages/ui-code-highlight/src'),
            '@ottabase/core-auth': join(projectRoot, 'packages/core-auth/src'),
            '@ottabase/core-prisma': join(projectRoot, 'packages/core-prisma/src'),
        };

        // Ensure TypeScript/TSX are transpiled (minimal Babel setup)
        config.module = config.module || {};
        config.module.rules = config.module.rules || [];

        config.module.rules.push({
            test: /\.[jt]sx?$/,
            include: [
                join(__dirname, '..'), // App directory
                join(projectRoot, 'packages'), // Packages directory
            ],
            exclude: /node_modules/,
            use: [{
                loader: require.resolve('babel-loader'),
                options: {
                    presets: [
                        require.resolve('@babel/preset-env'),
                        [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
                        require.resolve('@babel/preset-typescript'),
                    ],
                },
            }],
        });

        return config;
    },
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
