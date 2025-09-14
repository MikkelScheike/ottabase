module.exports = {
    plugins: {
        'tailwindcss': {},
        'postcss-preset-env': {},
        autoprefixer: {},
        'postcss-preset-mantine': {
            autoRem: true,
            // extend: https://mantine.dev/styles/postcss-preset/#custom-mixins
        },
        'postcss-simple-vars': {
            variables: {
                'mantine-breakpoint-xs': '36em',
                'mantine-breakpoint-sm': '48em',
                'mantine-breakpoint-md': '62em',
                'mantine-breakpoint-lg': '75em',
                'mantine-breakpoint-xl': '88em',
            },
        },
    },
}
