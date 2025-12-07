import type { ReactNode } from "react";
import { ProviderState } from "@ottabase/state";
import { ShadcnProviders } from "@ottabase/ui-shadcn/providers";
import { ProviderCodeHighlight } from "@ottabase/ui-code-highlight";

interface StoryShellProps {
  children: ReactNode;
}

/**
 * StoryShell wraps stories in the appropriate providers
 * to ensure they have the same context as in the real application
 */
export function StoryShell({ children }: StoryShellProps) {
  return (
    <ProviderState>
      <ShadcnProviders
        storagePrefix="storybook"
        defaultTheme="light"
        enableTooltipProvider={true}
        enableToaster={true}
      >
        <ProviderCodeHighlight>
          <div className="story-shell p-4">{children}</div>
        </ProviderCodeHighlight>
      </ShadcnProviders>
    </ProviderState>
  );
}
