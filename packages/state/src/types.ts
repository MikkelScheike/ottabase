// Base types that can be extended by apps
export type CursorTheme = 'default' | 'retro' | 'modern' | 'minimal';

export interface TextSelectionColor {
    foreground: string;
    background: string;
}

export type SupportedLayout = 'app' | 'dashboard' | 'landing' | 'auth' | 'minimal';
export type LayoutProvider = 'mantine' | 'shadcn' | 'chakra' | 'mui';
export type LayoutPresetType = 'app' | 'dashboard' | 'admin' | 'blog' | 'ecommerce';

// Base user interface - apps can extend this
export interface BaseUser {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    role?: string;
}

// Core app global state interface
export interface AppGlobalState<TUser extends BaseUser = BaseUser> {
    theme: 'light' | 'dark';
    scale: number;
    isMobileSidebarOpen: boolean;
    isDesktopSidebarOpen: boolean;
    user: null | TUser;
    layout?: SupportedLayout;
    routeContext?: any; // Current route for global context
    coreModule?: string;
    currentModule?: string;
    cursorTheme: CursorTheme;
    selectionColor: TextSelectionColor;
    layoutProvider: LayoutProvider;
    layoutPreset: LayoutPresetType;
}

// Configuration options for creating app state
export interface AppStateConfig<TUser extends BaseUser = BaseUser> {
    initialState?: Partial<AppGlobalState<TUser>>;
    coreModule?: string;
}