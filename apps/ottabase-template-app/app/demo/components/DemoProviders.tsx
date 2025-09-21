"use client";

import { ProviderUI } from "@ottabase/ui-core";
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
    <ProviderFont enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}>
      <ProviderUI
        storagePrefix={appConfig.storage.prefix}
        preventFOUC={appConfig.ui.preventFOUC}
        preventFOUCInsideIframe={appConfig.ui.preventFOUCInsideIframe}
        themeColors={THEME_COLORS}
        primaryColor={appConfig.theme.colorDefault}
        themeOverride={currentMantineTheme}
        fontFamilies={fontFamilies}
      >
        <ProviderNextThemes storagePrefix={appConfig.storage.prefix}>
          <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
        </ProviderNextThemes>
      </ProviderUI>
    </ProviderFont>
  );
}
