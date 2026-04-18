import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMediaLightboxUrlSync } from '../viewer/useMediaLightboxUrlSync';

function setLocation(search: string) {
    window.history.replaceState({}, '', `/test${search}`);
}

describe('useMediaLightboxUrlSync', () => {
    beforeEach(() => {
        setLocation('');
    });

    afterEach(() => {
        setLocation('');
    });

    it('is a no-op when disabled', () => {
        const onUrlKeyChange = vi.fn();
        renderHook(() => useMediaLightboxUrlSync({ enabled: false, activeRegistryKey: 'abc', onUrlKeyChange }));
        expect(window.location.search).toBe('');
        expect(onUrlKeyChange).not.toHaveBeenCalled();
    });

    it('reads initial key from URL and invokes onUrlKeyChange', () => {
        setLocation('?mgi=item-42');
        const onUrlKeyChange = vi.fn();
        renderHook(() => useMediaLightboxUrlSync({ enabled: true, activeRegistryKey: null, onUrlKeyChange }));
        expect(onUrlKeyChange).toHaveBeenCalledWith('item-42');
    });

    it('pushes the active key into the URL', () => {
        const onUrlKeyChange = vi.fn();
        const { rerender } = renderHook(
            ({ key }: { key: string | null }) =>
                useMediaLightboxUrlSync({ enabled: true, activeRegistryKey: key, onUrlKeyChange }),
            { initialProps: { key: null as string | null } },
        );
        expect(window.location.search).toBe('');

        rerender({ key: 'hero-img' });
        expect(window.location.search).toBe('?mgi=hero-img');
    });

    it('removes the param when key becomes null', () => {
        const onUrlKeyChange = vi.fn();
        const { rerender } = renderHook(
            ({ key }: { key: string | null }) =>
                useMediaLightboxUrlSync({ enabled: true, activeRegistryKey: key, onUrlKeyChange }),
            { initialProps: { key: 'hero-img' as string | null } },
        );
        expect(window.location.search).toBe('?mgi=hero-img');

        rerender({ key: null });
        expect(window.location.search).toBe('');
    });

    it('invokes onUrlKeyChange on popstate with new key', () => {
        const onUrlKeyChange = vi.fn();
        renderHook(() => useMediaLightboxUrlSync({ enabled: true, activeRegistryKey: null, onUrlKeyChange }));

        act(() => {
            setLocation('?mgi=item-7');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
        expect(onUrlKeyChange).toHaveBeenCalledWith('item-7');
    });

    it('honors custom param name', () => {
        const onUrlKeyChange = vi.fn();
        const { rerender } = renderHook(
            ({ key }: { key: string | null }) =>
                useMediaLightboxUrlSync({
                    enabled: true,
                    paramName: 'photo',
                    activeRegistryKey: key,
                    onUrlKeyChange,
                }),
            { initialProps: { key: null as string | null } },
        );
        rerender({ key: 'sunset' });
        expect(window.location.search).toBe('?photo=sunset');
    });
});
