import { useCallback, useEffect, useRef } from 'react';

export interface MediaLightboxUrlSyncOptions {
    /** Whether URL sync is active */
    enabled: boolean;
    /** Query-string param name used to encode the active item's registryKey. Default: `mgi`. */
    paramName?: string;
    /** Registry key of the currently open item, or null when the lightbox is closed */
    activeRegistryKey: string | null;
    /** Called with the registryKey found in the URL on mount / popstate. Invoked with null to close. */
    onUrlKeyChange: (registryKey: string | null) => void;
}

/**
 * Two-way sync between the lightbox state and `window.location.search`:
 *   - When `activeRegistryKey` changes, the URL is updated via `pushState` / `replaceState`.
 *   - When the user hits Back / Forward, `onUrlKeyChange` is called with the decoded key (or null).
 *
 * Router-agnostic: only uses `window.history` + `popstate`. Safe in SSR (no-ops).
 * History strategy:
 *   - Opening pushes a new history entry with the `mgi` param present. That way pressing Back closes.
 *   - Closing (or switching items) replaces the entry to avoid polluting history with every swipe.
 */
export function useMediaLightboxUrlSync({
    enabled,
    paramName = 'mgi',
    activeRegistryKey,
    onUrlKeyChange,
}: MediaLightboxUrlSyncOptions): void {
    const isBrowser = typeof window !== 'undefined';
    const lastAppliedRef = useRef<string | null>(null);
    // Track whether we've pushed a history entry for the currently-open item.
    // If yes, subsequent index changes should `replaceState`, not `pushState`.
    const hasPushedRef = useRef(false);

    const readKeyFromUrl = useCallback((): string | null => {
        if (!isBrowser) return null;
        const params = new URLSearchParams(window.location.search);
        const raw = params.get(paramName);
        return raw ? decodeURIComponent(raw) : null;
    }, [isBrowser, paramName]);

    // Initial read: if URL already contains the param, open that item.
    useEffect(() => {
        if (!enabled || !isBrowser) return;
        const initial = readKeyFromUrl();
        if (initial) {
            lastAppliedRef.current = initial;
            onUrlKeyChange(initial);
        }
        // Intentionally run once per enabled toggle; activeRegistryKey updates flow through the other effect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, isBrowser]);

    // Listen for Back / Forward
    useEffect(() => {
        if (!enabled || !isBrowser) return;
        const handlePopState = () => {
            const key = readKeyFromUrl();
            if (key !== lastAppliedRef.current) {
                lastAppliedRef.current = key;
                onUrlKeyChange(key);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [enabled, isBrowser, onUrlKeyChange, readKeyFromUrl]);

    // Push / replace state when the active key changes
    useEffect(() => {
        if (!enabled || !isBrowser) return;
        if (activeRegistryKey === lastAppliedRef.current) return;

        const params = new URLSearchParams(window.location.search);
        if (activeRegistryKey) {
            params.set(paramName, encodeURIComponent(activeRegistryKey));
        } else {
            params.delete(paramName);
        }
        const qs = params.toString();
        const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;

        if (activeRegistryKey && !hasPushedRef.current) {
            window.history.pushState({ mediaLightbox: true }, '', nextUrl);
            hasPushedRef.current = true;
        } else {
            window.history.replaceState(window.history.state, '', nextUrl);
            if (!activeRegistryKey) {
                hasPushedRef.current = false;
            }
        }
        lastAppliedRef.current = activeRegistryKey;
    }, [activeRegistryKey, enabled, isBrowser, paramName]);
}
