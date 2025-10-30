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
import { ProviderUIBase } from "@ottabase/ui-base";
import { ProviderUIMantine } from "@ottabase/ui-mantine";
import { ShadcnProviders } from "@ottabase/ui-shadcn/providers";

export function Providers({ children }: { children: React.ReactNode }) {
  const fontFamilies = {
    primary: primaryFontFamily.style.fontFamily,
    heading: headingFontFamily.style.fontFamily,
    monospace: monospaceFontFamily.style.fontFamily,
  };

  return (
    <ProviderState>
      <ProviderUIBase
        preventFOUC={appConfig.ui.preventFOUC}
        preventFOUCInsideIframe={appConfig.ui.preventFOUCInsideIframe}
        fontFamilies={fontFamilies}
      >
        <ProviderFont enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}>
          <ProviderUIMantine
            storagePrefix={appConfig.storage.prefix}
            themeColors={THEME_COLORS}
            primaryColor={appConfig.theme.colorDefault}
          >
            <ProviderNextThemes storagePrefix={appConfig.storage.prefix}>
              <ShadcnProviders enableThemeProvider={false} enableToaster>
                <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
              </ShadcnProviders>
            </ProviderNextThemes>
          </ProviderUIMantine>
        </ProviderFont>
      </ProviderUIBase>
    </ProviderState>
  );
}
