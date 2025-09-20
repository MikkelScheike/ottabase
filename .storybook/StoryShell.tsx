import type { ReactNode } from "react";
import { ProviderUI } from "@ottabase/ui-core";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";
import { ProviderState } from "@ottabase/state";
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
      <ProviderUI
        storagePrefix="storybook"
        preventFOUC={false} // Disable FOUC prevention in Storybook
        preventFOUCInsideIframe={false}
        themeColors={THEME_COLORS}
        primaryColor={appConfig.theme.colorDefault}
        enforceGoogleFonts={appConfig.ui.enforceGoogleFonts}
      >
        <ProviderCodeHighlight>{children}</ProviderCodeHighlight>
      </ProviderUI>
    </ProviderState>
  );
}
