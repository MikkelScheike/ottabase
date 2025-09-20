import { createDefaultAppState } from "@ottabase/state";
import { appConfig } from "@/ottabase/config/app.config";

// Create app state using the shared state package
const appState = createDefaultAppState(appConfig.features.crudHub.urlBase);

// Export the main atom (matches your original structure)
export const appGlobalStateAtom = appState.appGlobalStateAtom;

// Export the helper function (matches your original structure)
export const createAppGlobalStateAtom = appState.createAppGlobalStateAtom;

// Export individual atoms (matches your original structure)
export const isMobileSidebarOpenAtom = appState.atoms.isMobileSidebarOpenAtom;
export const isDesktopSidebarOpenAtom = appState.atoms.isDesktopSidebarOpenAtom;
export const currentModuleAtom = appState.atoms.currentModuleAtom;
export const coreModuleAtom = appState.atoms.coreModuleAtom;
export const cursorThemeAtom = appState.atoms.cursorThemeAtom;
export const selectionColorAtom = appState.atoms.selectionColorAtom;
export const layoutProviderAtom = appState.atoms.layoutProviderAtom;
export const layoutPresetAtom = appState.atoms.layoutPresetAtom;
export const themeAtom = appState.atoms.themeAtom;
export const scaleAtom = appState.atoms.scaleAtom;
export const userAtom = appState.atoms.userAtom;
export const layoutAtom = appState.atoms.layoutAtom;
export const routeContextAtom = appState.atoms.routeContextAtom;

// Export the complete state object for modern usage
export default appState;

/*
    USAGE EXAMPLES (matches your original documentation)
    ----------------------------------------------------------------
    **** USAGE (SET - in the corresponding page component)
    ----------------------------------------------------------------
    const setScale = useSetAtom(createAppGlobalStateAtom('scale'));
    useEffect(() => {
        setScale(1.5); // Update scale to 1.5
        return () => setScale(1.0); // Reset to default on unmount
    }, [setScale]);

    // SET - entire object in a component
    ----------------------------------------------------------------
    import { useSetAtom } from 'jotai';
    import { appGlobalStateAtom } from '@/src/state/appGlobalState';
    //and inside the client component:
    const setAppState = useSetAtom(appGlobalStateAtom);
    useEffect(() => {
        setAppState((prev) => ({ 
            ...prev, 
            cursorTheme: 'retro', 
            selectionColor: { foreground: '#fa4529', background: '#fff'} 
        }));
    }, []);
*/
