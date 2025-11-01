import { atom, type WritableAtom } from "jotai";
import type { AppGlobalState, AppStateConfig, BaseUser } from "./types";

/**
 * Creates app global state atom with default values, and environment variable support.
 * NOTE: The theme value is NOT persisted here. Persistence is handled by `next-themes`,
 * and the `useThemeManager` hook hydrates the Jotai atom from `next-themes`.
 *
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

  // The theme atom is a simple, non-persisted atom.
  // It gets its value from the useThemeManager hook, which syncs it with `next-themes`.
  const themeStorageAtom = atom<"light" | "dark">(
    (initialState.theme as "light" | "dark") ?? "light",
  );

  // Base state atom (stores all properties; theme value is overridden by persisted atom on read)
  const baseStateAtom = atom<AppGlobalState<TUser>>({
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

  // Create the main app global state atom (reads theme from localStorage-backed atom)
  const appGlobalStateAtom = atom(
    (get) => {
      const base = get(baseStateAtom);
      const persistedTheme = get(themeStorageAtom);
      return { ...base, theme: persistedTheme };
    },
    (
      get,
      set,
      update:
        | AppGlobalState<TUser>
        | ((prev: AppGlobalState<TUser>) => AppGlobalState<TUser>),
    ) => {
      const prev = get(
        appGlobalStateAtom as unknown as WritableAtom<
          AppGlobalState<TUser>,
          [
            | AppGlobalState<TUser>
            | ((prev: AppGlobalState<TUser>) => AppGlobalState<TUser>),
          ],
          void
        >,
      );
      const next =
        typeof update === "function"
          ? (update as (p: AppGlobalState<TUser>) => AppGlobalState<TUser>)(
              prev,
            )
          : update;

      // Keep persisted theme in sync when the main atom is updated directly
      if (next.theme && next.theme !== get(themeStorageAtom)) {
        set(themeStorageAtom, next.theme as "light" | "dark");
      }

      set(baseStateAtom, next);
    },
  ) as unknown as WritableAtom<
    AppGlobalState<TUser>,
    [
      | AppGlobalState<TUser>
      | ((prev: AppGlobalState<TUser>) => AppGlobalState<TUser>),
    ],
    void
  >;

  // Helper function to create individual atoms for each property
  function createAppGlobalStateAtom<K extends keyof AppGlobalState<TUser>>(
    key: K,
  ) {
    // Special handling for theme to use localStorage-backed atom
    if (key === "theme") {
      return atom(
        (get) => get(themeStorageAtom),
        (_get, set, update: AppGlobalState<TUser>[K]) => {
          set(themeStorageAtom, update as "light" | "dark");
          set(appGlobalStateAtom, (prev: AppGlobalState<TUser>) => ({
            ...prev,
            [key]: update,
          }));
        },
      ) as any;
    }

    return atom(
      (get) => get(appGlobalStateAtom)[key],
      (_get, set, update: AppGlobalState<TUser>[K]) =>
        set(appGlobalStateAtom, (prev: AppGlobalState<TUser>) => ({
          ...prev,
          [key]: update,
        })),
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
