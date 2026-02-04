// ============================================================
// Auth API Client - Re-export from Package
// ============================================================
//
// All auth API functionality is provided by @ottabase/auth/client
// This file exists for backward compatibility and convenience.
//
// ============================================================

export {
    getCsrfToken,
    getSession,
    isAuthenticated,
    registerWithCredentials,
    sendMagicLink,
    signInWithCredentials,
    signInWithProvider,
    signOut,
    type AuthClientOptions,
    type AuthResponse,
    type AuthSession,
    type RegisterCredentials,
    type RegisterResponse,
    type SignInCredentials,
} from '@ottabase/auth/client';
