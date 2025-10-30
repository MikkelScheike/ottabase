"use client";

import { ProviderUIBase } from "@ottabase/ui-base";
import { ProviderUIMantine } from "@ottabase/ui-mantine";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import {
  ProviderFont,
  ProviderNextThemes,
  primaryFontFamily,
  headingFontFamily,
  monospaceFontFamily,
} from "@/ottabase/providers";
import { appConfig, THEME_COLORS } from "@/ottabase/config/app.config";
import { useTheme } from "../lib/themeContext";

export function DemoProviders({ children }: { children: React.ReactNode }) {
  const { currentMantineTheme } = useTheme();
  const fontFamilies = {
    primary: primaryFontFamily.style.fontFamily,
    heading: headingFontFamily.style.fontFamily,
    monospace: monospaceFontFamily.style.fontFamily,
  };

  return (
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
          themeOverride={currentMantineTheme}
        >
          <ProviderNextThemes storagePrefix={appConfig.storage.prefix}>
            <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
          </ProviderNextThemes>
        </ProviderUIMantine>
      </ProviderFont>
    </ProviderUIBase>
  );
}
