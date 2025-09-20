"use client";

import { ProviderUI } from "@ottabase/ui-core";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { appConfig, THEME_COLORS } from "@/ottabase/config/app.config";
import { useTheme } from "../lib/themeContext";

export function DemoProviders({ children }: { children: React.ReactNode }) {
  const { currentMantineTheme } = useTheme();

  return (
    <ProviderUI
      storagePrefix={appConfig.storage.prefix}
      preventFOUC={appConfig.ui.preventFOUC}
      preventFOUCInsideIframe={appConfig.ui.preventFOUCInsideIframe}
      themeColors={THEME_COLORS}
      primaryColor={appConfig.theme.colorDefault}
      enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}
      themeOverride={currentMantineTheme}
    >
      <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
    </ProviderUI>
  );
}
