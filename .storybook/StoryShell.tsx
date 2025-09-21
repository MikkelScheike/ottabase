import type { ReactNode } from "react";
import { ProviderUI } from "@ottabase/ui-core";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { ProviderState } from "@ottabase/state";
import {
  ProviderFont,
  ProviderNextThemes,
  primaryFontFamily,
  headingFontFamily,
  monospaceFontFamily,
} from "@apps/ottabase-template-app/ottabase/providers";
import {
  appConfig,
  THEME_COLORS,
} from "@apps/ottabase-template-app/ottabase/config/app.config";

interface StoryShellProps {
  children: ReactNode;
}

export function StoryShell({ children }: StoryShellProps) {
  return (
    <ProviderState>
      <ProviderFont enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}>
        <ProviderUI
          storagePrefix="storybook"
          preventFOUC={false} // Disable FOUC prevention in Storybook
          preventFOUCInsideIframe={false}
          themeColors={THEME_COLORS}
          primaryColor={appConfig.theme.colorDefault}
          fontFamilies={{
            primary: primaryFontFamily.style.fontFamily,
            heading: headingFontFamily.style.fontFamily,
            monospace: monospaceFontFamily.style.fontFamily,
          }}
        >
          <ProviderNextThemes storagePrefix="storybook">
            <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
          </ProviderNextThemes>
        </ProviderUI>
      </ProviderFont>
    </ProviderState>
  );
}
