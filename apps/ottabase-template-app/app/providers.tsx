"use client";

import { appConfig, THEME_COLORS } from "@/ottabase/config/app.config";
import {
  headingFontFamily,
  monospaceFontFamily,
  primaryFontFamily,
  ProviderFont,
  ProviderNextThemes,
} from "@/ottabase/providers";
import { ProviderState } from "@ottabase/state";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { ProviderUI } from "@ottabase/ui-core";
import { ShadcnProviders } from "@ottabase/ui-shadcn/providers";

export function Providers({ children }: { children: React.ReactNode }) {
  const fontFamilies = {
    primary: primaryFontFamily.style.fontFamily,
    heading: headingFontFamily.style.fontFamily,
    monospace: monospaceFontFamily.style.fontFamily,
  };

  return (
    <ProviderState>
      <ProviderFont enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}>
        <ProviderUI
          storagePrefix={appConfig.storage.prefix}
          preventFOUC={appConfig.ui.preventFOUC}
          preventFOUCInsideIframe={appConfig.ui.preventFOUCInsideIframe}
          themeColors={THEME_COLORS}
          primaryColor={appConfig.theme.colorDefault}
          fontFamilies={fontFamilies}
        >
          <ProviderNextThemes storagePrefix={appConfig.storage.prefix}>
            <ShadcnProviders enableThemeProvider={false} enableToaster>
              <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
            </ShadcnProviders>
          </ProviderNextThemes>
        </ProviderUI>
      </ProviderFont>
    </ProviderState>
  );
}
