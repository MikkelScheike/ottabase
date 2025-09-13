// Export types
export type {
    CursorTheme,
    TextSelectionColor,
    SupportedLayout,
    LayoutProvider,
    LayoutPresetType,
    BaseUser,
    AppGlobalState,
    AppStateConfig,
} from './types';

// Export main functions
export {
    createAppState,
    createDefaultAppState,
} from './createAppState';

// Import for internal use
import type { CursorTheme, TextSelectionColor, LayoutProvider, LayoutPresetType } from './types';

// Export default values
export const DEFAULT_CURSOR_THEME: CursorTheme = 'default';

export const DEFAULT_SELECTION_COLOR: TextSelectionColor = {
    foreground: '#FFF',
    background: '#3A3A3A',
};

export const DEFAULT_LAYOUT_PROVIDER: LayoutProvider = 'mantine';
export const DEFAULT_LAYOUT_PRESET: LayoutPresetType = 'app';

// Export ProviderState
export { default as ProviderState } from './ProviderState';

// Common state utilities
export const STATE_DEFAULTS = {
    theme: 'light' as const,
    scale: 1.0,
    isMobileSidebarOpen: false,
    isDesktopSidebarOpen: true,
    cursorTheme: 'default' as CursorTheme,
    selectionColor: DEFAULT_SELECTION_COLOR,
    layoutProvider: 'mantine' as LayoutProvider,
    layoutPreset: 'app' as LayoutPresetType,
} as const;
