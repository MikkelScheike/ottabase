"use client";

import { ProviderUI } from "@ottabase/ui-core";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { ProviderState } from "@ottabase/state";
import { appConfig, THEME_COLORS } from "@/ottabase/config/app.config";
import { ShadcnProviders } from "@ottabase/ui-shadcn/providers";

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
        <ShadcnProviders enableThemeProvider={false} enableToaster>
          <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
        </ShadcnProviders>
      </ProviderUI>
    </ProviderState>
  );
}
