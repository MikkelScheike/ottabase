/** @type {import('next').NextConfig} */

const nextConfig = {
    // Enable transpilation of packages
    transpilePackages: [
        '@ottabase/ui-core',
        '@ottabase/config',
        '@ottabase/state',
        '@ottabase/ui-code-highlight',
        '@ottabase/ui-tailwind',
        '@ottabase/ui-components',
    ],

    // Enable React strict mode
    reactStrictMode: true,

    // Optimize images
    images: {
        remotePatterns: [],
    },

    // Experimental features for Next.js 15
    experimental: {
        // Add any Next.js 15 experimental features here
    },
}

module.exports = nextConfig