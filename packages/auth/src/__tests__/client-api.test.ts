import { afterEach, describe, expect, it, vi } from 'vitest';
import { changePassword } from '../client-api';

describe('client-api changePassword', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns success when API responds 200', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: true,
            })) as unknown as typeof fetch,
        );

        const result = await changePassword({
            currentPassword: 'Current@123',
            newPassword: 'NewPassword@123',
        });

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith('/api/auth/password/change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: 'Current@123',
                newPassword: 'NewPassword@123',
            }),
        });
    });

    it('returns API error message when request fails', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => ({
                ok: false,
                json: async () => ({ error: 'Current password is incorrect' }),
            })) as unknown as typeof fetch,
        );

        const result = await changePassword({
            currentPassword: 'Wrong@123',
            newPassword: 'NewPassword@123',
        });

        expect(result).toEqual({
            success: false,
            error: 'Current password is incorrect',
        });
    });

    it('returns generic error when fetch throws', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new Error('Network down');
            }) as unknown as typeof fetch,
        );

        const result = await changePassword({
            currentPassword: 'Current@123',
            newPassword: 'NewPassword@123',
        });

        expect(result).toEqual({
            success: false,
            error: 'Network down',
        });
    });
});
