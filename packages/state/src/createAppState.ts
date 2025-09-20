import { atom } from "jotai";
import type { AppGlobalState, AppStateConfig, BaseUser } from "./types";

/**
 * Creates app global state atom with default values and environment variable support
 * @param config Configuration options for the app state
 * @returns App global state atom and individual property atoms
 */
export function createAppState<TUser extends BaseUser = BaseUser>(
  config: AppStateConfig<TUser> = {},
) {
  const { initialState = {}, coreModule } = config;

  // Helper function to get environment variable
  const getEnv = (key: string, fallback?: string): string | undefined => {
    if (typeof process !== "undefined" && process.env) {
      return process.env[`NEXT_PUBLIC_${key}`] ?? fallback;
    }
    return fallback;
  };

  // Create the main app global state atom
  const appGlobalStateAtom = atom<AppGlobalState<TUser>>({
    theme: "light",
    scale: 1.0,
    user: null,
    isMobileSidebarOpen: false,
    isDesktopSidebarOpen: true,
    coreModule: coreModule ?? getEnv("CORE_MODULE"),
    currentModule: undefined,
    cursorTheme: "default",
    selectionColor: {
      foreground: "#FFF",
      background: "#3A3A3A",
    },
    layoutProvider: "mantine",
    layoutPreset: "app",
    ...initialState,
  });

  // Helper function to create individual atoms for each property
  function createAppGlobalStateAtom<K extends keyof AppGlobalState<TUser>>(
    key: K,
  ) {
    return atom(
      (get) => get(appGlobalStateAtom)[key],
      (_get, set, update: AppGlobalState<TUser>[K]) =>
        set(appGlobalStateAtom, (prev) => ({ ...prev, [key]: update })),
    );
  }

  // Create individual atoms for common properties
  const isMobileSidebarOpenAtom = createAppGlobalStateAtom(
    "isMobileSidebarOpen",
  );
  const isDesktopSidebarOpenAtom = createAppGlobalStateAtom(
    "isDesktopSidebarOpen",
  );
  const currentModuleAtom = createAppGlobalStateAtom("currentModule");
  const coreModuleAtom = createAppGlobalStateAtom("coreModule");
  const cursorThemeAtom = createAppGlobalStateAtom("cursorTheme");
  const selectionColorAtom = createAppGlobalStateAtom("selectionColor");
  const layoutProviderAtom = createAppGlobalStateAtom("layoutProvider");
  const layoutPresetAtom = createAppGlobalStateAtom("layoutPreset");
  const themeAtom = createAppGlobalStateAtom("theme");
  const scaleAtom = createAppGlobalStateAtom("scale");
  const userAtom = createAppGlobalStateAtom("user");
  const layoutAtom = createAppGlobalStateAtom("layout");
  const routeContextAtom = createAppGlobalStateAtom("routeContext");

  return {
    // Main atom
    appGlobalStateAtom,

    // Helper function to create custom atoms
    createAppGlobalStateAtom,

    // Pre-created individual atoms
    atoms: {
      isMobileSidebarOpenAtom,
      isDesktopSidebarOpenAtom,
      currentModuleAtom,
      coreModuleAtom,
      cursorThemeAtom,
      selectionColorAtom,
      layoutProviderAtom,
      layoutPresetAtom,
      themeAtom,
      scaleAtom,
      userAtom,
      layoutAtom,
      routeContextAtom,
    },
  };
}

/**
 * Default app state factory - creates a basic app state setup
 * @param coreModule Optional core module name
 * @returns App state atoms and utilities
 */
export function createDefaultAppState(coreModule?: string) {
  return createAppState({
    coreModule,
    initialState: {
      theme: "light",
      scale: 1.0,
      isDesktopSidebarOpen: true,
      isMobileSidebarOpen: false,
      layoutProvider: "mantine",
      layoutPreset: "app",
    },
  });
}
