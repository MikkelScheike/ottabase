// ============================================================
// @ottabase/auth - Authentication Package
// ============================================================
//
// Complete Auth.js (NextAuth.js) integration for Ottabase applications
// with Cloudflare D1 support, provider presets, and Next.js helpers.
//
// Quick Start:
//   1. Add "auth" to features in db.config.ts
//   2. Run pnpm db:generate
//   3. Create auth configuration with createOttabaseAuthConfig
//   4. Use in Next.js App Router
//
// @see README.md for detailed documentation
//
// ============================================================

// ============================================================
// FEATURE REGISTRATION
// ============================================================
export { authFeature, registerAuthFeature } from "./db.feature";

// ============================================================
// D1 ADAPTER
// ============================================================
export {
  createD1AuthAdapter,
  createD1AuthAdapterCached,
  type D1AuthAdapterOptions,
} from "./adapter";

// ============================================================
// CONFIGURATION HELPERS
// ============================================================
export {
  createOttabaseAuthConfig,
  createOttabaseAuthConfigDev,
  type OttabaseAuthConfigOptions,
} from "./config";

// ============================================================
// PROVIDER PRESETS
// ============================================================
export {
  createGoogleProvider,
  createGitHubProvider,
  createDiscordProvider,
  createAzureAdProvider,
  createAuth0Provider,
  autoConfigureProviders,
  type ProviderEnv,
  type ProviderOptions,
} from "./providers";

// ============================================================
// SESSION UTILITIES
// ============================================================
export {
  isAuthenticated,
  requireAuth,
  getUserId,
  getUserEmail,
  hasVerifiedEmail,
  serializeSession,
  type OttabaseSession,
  type SessionData,
} from "./session";

// ============================================================
// TYPE DEFINITIONS
// ============================================================
export type { AuthConfig } from "./types";
