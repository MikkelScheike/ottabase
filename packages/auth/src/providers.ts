// ============================================================
// @ottabase/auth - Provider Configuration Presets
// ============================================================
//
// Pre-configured provider helpers for common OAuth providers.
// These helpers ensure consistent configuration across all
// Ottabase applications.
//
// ============================================================

/**
 * Environment variables for provider credentials
 * These should be set in your .env file or Cloudflare Workers environment
 */
export interface ProviderEnv {
  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;

  // GitHub OAuth
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;

  // Discord OAuth
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;

  // Microsoft/Azure OAuth
  AZURE_AD_CLIENT_ID?: string;
  AZURE_AD_CLIENT_SECRET?: string;
  AZURE_AD_TENANT_ID?: string;

  // Auth0
  AUTH0_CLIENT_ID?: string;
  AUTH0_CLIENT_SECRET?: string;
  AUTH0_ISSUER?: string;
}

/**
 * Options for configuring OAuth providers
 */
export interface ProviderOptions {
  /**
   * Additional scopes to request
   */
  scopes?: string[];

  /**
   * Allow users with unverified emails to sign in
   * @default false
   */
  allowDangerousEmailAccountLinking?: boolean;
}

/**
 * Create a Google OAuth provider configuration
 *
 * Requires environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 *
 * @param env - Environment variables
 * @param options - Additional provider options
 * @returns Provider configuration for Auth.js
 *
 * @example
 * ```typescript
 * import { createGoogleProvider } from "@ottabase/auth/providers";
 *
 * const providers = [
 *   createGoogleProvider(env),
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // With additional scopes
 * createGoogleProvider(env, {
 *   scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
 * });
 * ```
 */
export function createGoogleProvider(
  env: ProviderEnv,
  options: ProviderOptions = {},
) {
  // Lazy load to avoid bundling providers that aren't used
  let Google: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Google = require("@auth/core/providers/google").default;
  } catch {
    throw new Error(
      "@auth/core is not installed. Install with: pnpm add @auth/core",
    );
  }

  const { scopes = [], allowDangerousEmailAccountLinking = false } = options;

  return Google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        scope: ["openid", "email", "profile", ...scopes].join(" "),
      },
    },
    allowDangerousEmailAccountLinking,
  });
}

/**
 * Create a GitHub OAuth provider configuration
 *
 * Requires environment variables:
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 *
 * @param env - Environment variables
 * @param options - Additional provider options
 * @returns Provider configuration for Auth.js
 *
 * @example
 * ```typescript
 * import { createGitHubProvider } from "@ottabase/auth/providers";
 *
 * const providers = [
 *   createGitHubProvider(env),
 * ];
 * ```
 *
 * @example
 * ```typescript
 * // With additional scopes
 * createGitHubProvider(env, {
 *   scopes: ["repo", "read:org"],
 * });
 * ```
 */
export function createGitHubProvider(
  env: ProviderEnv,
  options: ProviderOptions = {},
) {
  let GitHub: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    GitHub = require("@auth/core/providers/github").default;
  } catch {
    throw new Error(
      "@auth/core is not installed. Install with: pnpm add @auth/core",
    );
  }

  const { scopes = [], allowDangerousEmailAccountLinking = false } = options;

  return GitHub({
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    authorization: {
      params: {
        scope: ["read:user", "user:email", ...scopes].join(" "),
      },
    },
    allowDangerousEmailAccountLinking,
  });
}

/**
 * Create a Discord OAuth provider configuration
 *
 * Requires environment variables:
 * - DISCORD_CLIENT_ID
 * - DISCORD_CLIENT_SECRET
 *
 * @param env - Environment variables
 * @param options - Additional provider options
 * @returns Provider configuration for Auth.js
 *
 * @example
 * ```typescript
 * import { createDiscordProvider } from "@ottabase/auth/providers";
 *
 * const providers = [
 *   createDiscordProvider(env),
 * ];
 * ```
 */
export function createDiscordProvider(
  env: ProviderEnv,
  options: ProviderOptions = {},
) {
  let Discord: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Discord = require("@auth/core/providers/discord").default;
  } catch {
    throw new Error(
      "@auth/core is not installed. Install with: pnpm add @auth/core",
    );
  }

  const { scopes = [], allowDangerousEmailAccountLinking = false } = options;

  return Discord({
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    authorization: {
      params: {
        scope: ["identify", "email", ...scopes].join(" "),
      },
    },
    allowDangerousEmailAccountLinking,
  });
}

/**
 * Create a Microsoft Azure AD OAuth provider configuration
 *
 * Requires environment variables:
 * - AZURE_AD_CLIENT_ID
 * - AZURE_AD_CLIENT_SECRET
 * - AZURE_AD_TENANT_ID
 *
 * @param env - Environment variables
 * @param options - Additional provider options
 * @returns Provider configuration for Auth.js
 *
 * @example
 * ```typescript
 * import { createAzureAdProvider } from "@ottabase/auth/providers";
 *
 * const providers = [
 *   createAzureAdProvider(env),
 * ];
 * ```
 */
export function createAzureAdProvider(
  env: ProviderEnv,
  options: ProviderOptions = {},
) {
  let AzureAd: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    AzureAd = require("@auth/core/providers/azure-ad").default;
  } catch {
    throw new Error(
      "@auth/core is not installed. Install with: pnpm add @auth/core",
    );
  }

  const { scopes = [], allowDangerousEmailAccountLinking = false } = options;

  return AzureAd({
    clientId: env.AZURE_AD_CLIENT_ID,
    clientSecret: env.AZURE_AD_CLIENT_SECRET,
    tenantId: env.AZURE_AD_TENANT_ID,
    authorization: {
      params: {
        scope: ["openid", "profile", "email", ...scopes].join(" "),
      },
    },
    allowDangerousEmailAccountLinking,
  });
}

/**
 * Create an Auth0 provider configuration
 *
 * Requires environment variables:
 * - AUTH0_CLIENT_ID
 * - AUTH0_CLIENT_SECRET
 * - AUTH0_ISSUER (e.g., https://your-domain.auth0.com)
 *
 * @param env - Environment variables
 * @param options - Additional provider options
 * @returns Provider configuration for Auth.js
 *
 * @example
 * ```typescript
 * import { createAuth0Provider } from "@ottabase/auth/providers";
 *
 * const providers = [
 *   createAuth0Provider(env),
 * ];
 * ```
 */
export function createAuth0Provider(
  env: ProviderEnv,
  options: ProviderOptions = {},
) {
  let Auth0: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Auth0 = require("@auth/core/providers/auth0").default;
  } catch {
    throw new Error(
      "@auth/core is not installed. Install with: pnpm add @auth/core",
    );
  }

  const { allowDangerousEmailAccountLinking = false } = options;

  return Auth0({
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
    issuer: env.AUTH0_ISSUER,
    allowDangerousEmailAccountLinking,
  });
}

/**
 * Auto-configure providers based on available environment variables
 *
 * This helper automatically creates provider configurations for
 * all providers that have the required environment variables set.
 *
 * @param env - Environment variables
 * @returns Array of configured providers
 *
 * @example
 * ```typescript
 * import { autoConfigureProviders } from "@ottabase/auth/providers";
 *
 * // Automatically uses any providers that have credentials configured
 * const providers = autoConfigureProviders(env);
 * ```
 */
export function autoConfigureProviders(env: ProviderEnv) {
  const providers: any[] = [];

  // Google
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(createGoogleProvider(env));
  }

  // GitHub
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.push(createGitHubProvider(env));
  }

  // Discord
  if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
    providers.push(createDiscordProvider(env));
  }

  // Azure AD
  if (
    env.AZURE_AD_CLIENT_ID &&
    env.AZURE_AD_CLIENT_SECRET &&
    env.AZURE_AD_TENANT_ID
  ) {
    providers.push(createAzureAdProvider(env));
  }

  // Auth0
  if (env.AUTH0_CLIENT_ID && env.AUTH0_CLIENT_SECRET && env.AUTH0_ISSUER) {
    providers.push(createAuth0Provider(env));
  }

  return providers;
}
