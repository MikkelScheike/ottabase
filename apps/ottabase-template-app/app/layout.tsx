import type { Metadata } from 'next';
import '@ottabase/ui-tailwind/styles/tailwind.base.css';
import { APP_META } from '@/ottabase/config/app.config';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: APP_META.title,
    description: APP_META.description,
    keywords: APP_META.keywords,
    robots: APP_META.robots,
    authors: [{ name: APP_META.author }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}