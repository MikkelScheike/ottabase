"use client";

import { ProviderUI } from "@ottabase/ui-core";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { ProviderState } from "@ottabase/state";
import { ShadcnProviders } from "@ottabase/ui-shadcn/providers";
import {
  ProviderFont,
  ProviderNextThemes,
  primaryFontFamily,
  headingFontFamily,
  monospaceFontFamily,
} from "@/ottabase/providers";
import { appConfig, THEME_COLORS } from "@/ottabase/config/app.config";

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
