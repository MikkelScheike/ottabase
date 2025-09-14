/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable transpilation of packages
    transpilePackages: ['@ottabase/ui-core', '@ottabase/config', '@ottabase/state'],

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