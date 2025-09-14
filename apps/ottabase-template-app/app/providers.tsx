"use client";

import { ProviderUI } from "@ottabase/ui-core";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { ProviderState } from "@ottabase/state";
import { appConfig, THEME_COLORS } from "@/config/app.config";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ProviderState>
            <ProviderUI
                storagePrefix={appConfig.storage.prefix}
                preventFOUC={appConfig.ui.preventFOUC}
                preventFOUCInsideIframe={appConfig.ui.preventFOUCInsideIframe}
                themeColors={THEME_COLORS}
                primaryColor={appConfig.theme.colorDefault}
                enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}
            >
                <ProviderCodeHighlight>
                    {children}
                </ProviderCodeHighlight>
            </ProviderUI>
        </ProviderState>
    );
}