// Main auth configuration and handlers
export {
  auth,
  authConfig,
  createAuthConfig,
  createNextAuth,
  handlers,
  signIn,
  signOut,
} from "./config";

// Auth provider component
export { AuthProvider, SessionProvider } from "./providers";

// Auth hooks and utilities
export {
  signIn as clientSignIn,
  signOut as clientSignOut,
  useAuth,
  useAuthUser,
  useIsAuthenticated,
  useSession,
} from "./hooks";

// Type exports
export type { AuthUser, Session } from "./hooks";
export type { AuthSession, NextAuthConfig } from "./types";
