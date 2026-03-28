'use client';

import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

const GITHUB_URL = 'https://github.com/thinkdj/ottabase';

const FOOTER_LINKS = [
    { href: '/about', label: 'About' },
    { href: '/theme-demo', label: 'Themes' },
    { href: GITHUB_URL, label: 'GitHub', external: true },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar title="Ottabase" githubUrl={GITHUB_URL} />
            <main className="flex-1">{children}</main>
            <Footer siteName="Ottabase" tagline="Built with Next.js & Cloudflare Workers" links={FOOTER_LINKS} />
        </>
    );
}
