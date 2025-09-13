import type { Metadata } from 'next';
import { ProviderUI } from '@ottabase/ui';
import { ProviderState } from '@ottabase/state';
import { appConfig, APP_META, THEME_COLORS } from '@/config/app.config';
import './globals.css';

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
        <html lang="en">
            <body>
                <ProviderUI
                    storagePrefix={appConfig.storage.prefix}
                    preventFOUC={appConfig.ui.preventFOUC}
                    preventFOUCInsideIframe={appConfig.ui.preventFOUCInsideIframe}
                    themeColors={THEME_COLORS}
                    primaryColor={appConfig.theme.colorDefault}
                    enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}
                >
                    <ProviderState>
                        {children}
                    </ProviderState>
                </ProviderUI>
            </body>
        </html>
    );
}