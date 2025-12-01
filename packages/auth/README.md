# @ottabase/auth

Framework-agnostic Auth.js integration for Ottabase applications with Cloudflare D1 support and provider presets.

## Features

- 🔐 **Auth.js Integration** - Full Auth.js v5 support with D1 adapter
- ☁️ **Cloudflare D1** - Native D1 database support via `@ottabase/cf`
- 🎯 **Provider Presets** - Pre-configured Google, GitHub, Discord, Azure AD, Auth0
- 🌐 **Framework-Agnostic** - Works with any framework (Next.js, Remix, SvelteKit, etc.)
- 📦 **Reusable** - Works across all apps in your Ottabase monorepo
- 🛡️ **Type-Safe** - Full TypeScript support with type inference

## Installation

The auth package is already included in your Ottabase monorepo. Install the required peer dependencies:

```bash
pnpm add @auth/core @auth/prisma-adapter
```

## Quick Start

### 1. Enable Auth Feature

Add `"auth"` to your app's `db.config.ts`:

```typescript
// apps/your-app/db.config.ts
import { defineAppDbConfig } from "@ottabase/db";

export default defineAppDbConfig({
  appId: "your-app",
  features: ["auth"], // Enable auth feature
});
```

### 2. Generate Database Schema

```bash
pnpm db:generate
pnpm db:migrate --name=add_auth
```

### 3. Create Auth Configuration

```typescript
// app/auth.ts (or wherever you configure auth)
import { Auth } from "@auth/core";
import { createOttabaseAuthConfig, createGoogleProvider } from "@ottabase/auth";

// Get your D1 database binding (framework-specific)
// For Cloudflare Workers: env.DB
// For Next.js: process.env.DB or request env

export const authConfig = createOttabaseAuthConfig({
  d1: env.DB, // D1 database binding
  providers: [
    createGoogleProvider(env),
    // Add more providers...
  ],
});
```

## Configuration

### D1 Adapter

The auth package uses `@ottabase/cf` for consistent D1 client creation across all Ottabase apps.

```typescript
import { createD1AuthAdapter } from "@ottabase/auth";

// Basic usage
const adapter = createD1AuthAdapter(env.DB);

// With logging
const adapter = createD1AuthAdapter(env.DB, {
  log: ["query", "error"],
});

// Cached adapter (recommended for production)
import { createD1AuthAdapterCached } from "@ottabase/auth";
const adapter = createD1AuthAdapterCached(env.DB);
```

### Auth Configuration Options

```typescript
import { createOttabaseAuthConfig } from "@ottabase/auth";

createOttabaseAuthConfig({
  d1: env.DB,
  providers: [/* ... */],

  // Session strategy
  sessionStrategy: "jwt", // or "database"
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days

  // Use cached adapter
  useCachedAdapter: true,

  // Enable logging
  log: ["error", "warn"],

  // Additional Auth.js options
  authConfig: {
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.id = user.id;
        return token;
      },
    },
  },
});
```

## Provider Presets

Pre-configured providers with sensible defaults:

### Google

```typescript
import { createGoogleProvider } from "@ottabase/auth";

// Basic usage (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
createGoogleProvider(env);

// With additional scopes
createGoogleProvider(env, {
  scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
});
```

### GitHub

```typescript
import { createGitHubProvider } from "@ottabase/auth";

// Basic usage (requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET)
createGitHubProvider(env);

// With additional scopes
createGitHubProvider(env, {
  scopes: ["repo", "read:org"],
});
```

### Other Providers

```typescript
import {
  createDiscordProvider,
  createAzureAdProvider,
  createAuth0Provider,
} from "@ottabase/auth";

// Discord (requires DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET)
createDiscordProvider(env);

// Azure AD (requires AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID)
createAzureAdProvider(env);

// Auth0 (requires AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_ISSUER)
createAuth0Provider(env);
```

### Auto-Configure Providers

Automatically configure all providers based on available environment variables:

```typescript
import { autoConfigureProviders } from "@ottabase/auth";

const providers = autoConfigureProviders(env);
// Returns array of configured providers based on available credentials
```

## Session Utilities

Helper functions for working with sessions:

```typescript
import {
  isAuthenticated,
  requireAuth,
  getUserId,
  getUserEmail,
  hasVerifiedEmail,
  serializeSession,
} from "@ottabase/auth";

// Check authentication
const session = await getSession();
if (isAuthenticated(session)) {
  console.log(session.user.id);
}

// Require authentication (throws error if not authenticated)
const session = requireAuth(await getSession());

// Get user ID
const userId = getUserId(await getSession()); // Returns string | null

// Get user email
const email = getUserEmail(await getSession()); // Returns string | null

// Check verified email
if (hasVerifiedEmail(await getSession())) {
  // User has verified email
}

// Serialize for API responses
const sessionData = serializeSession(await getSession());
```

## Framework Integration

### Next.js

For Next.js-specific helpers (middleware, API handlers, etc.), see the `ottabase-template-app` package which includes Next.js integration examples.

### Cloudflare Workers

```typescript
// worker.ts
import { Auth } from "@auth/core";
import { createOttabaseAuthConfig } from "@ottabase/auth";

export default {
  async fetch(request: Request, env: Env) {
    const authConfig = createOttabaseAuthConfig({
      d1: env.DB,
      providers: [/* ... */],
    });

    const auth = Auth(request, authConfig);
    const session = await auth.getSession();

    // Use session...
  }
};
```

### SvelteKit

```typescript
// src/hooks.server.ts
import { SvelteKitAuth } from "@auth/sveltekit";
import { createOttabaseAuthConfig } from "@ottabase/auth";

export const handle = SvelteKitAuth(async ({ platform }) => {
  return createOttabaseAuthConfig({
    d1: platform.env.DB,
    providers: [/* ... */],
  });
});
```

### Remix

```typescript
// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { createOttabaseAuthConfig } from "@ottabase/auth";

export const authenticator = new Authenticator(sessionStorage);

// Configure with Ottabase auth
const authConfig = createOttabaseAuthConfig({
  d1: context.cloudflare.env.DB,
  providers: [/* ... */],
});
```

## Database Schema

The auth feature includes these models:

- **User** - User accounts with Auth.js relations
- **Account** - OAuth provider accounts linked to users
- **Session** - User sessions for database session strategy
- **VerificationToken** - Email verification and magic link tokens
- **Authenticator** - WebAuthn/Passkey credentials

See [prisma/auth.schema.prisma](./prisma/auth.schema.prisma) for the complete schema.

## Migrations

After enabling the auth feature:

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate --name=add_auth

# Apply to D1 (development)
wrangler d1 execute DB --local --file=prisma/migrations/<timestamp>_add_auth/migration.sql

# Apply to D1 (production)
wrangler d1 execute DB --file=prisma/migrations/<timestamp>_add_auth/migration.sql
```

## Environment Variables

Required environment variables for providers:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Azure AD
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id

# Auth0
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER=https://your-domain.auth0.com

# Auth.js
AUTH_SECRET=your_random_secret
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Architecture

The `@ottabase/auth` package integrates with:

- **@ottabase/cf** - For D1 Prisma client creation (Cloudflare-specific code)
- **@ottabase/db** - For feature registry and schema management (database layer)
- **@auth/core** - Core Auth.js functionality (framework-agnostic)
- **@auth/prisma-adapter** - Prisma adapter for Auth.js

This ensures:
- Clean separation of concerns (Cloudflare code in `cf`, database code in `db`)
- Framework-agnostic auth package (no Next.js dependencies)
- Consistent D1 usage across all Ottabase applications
- Reusable across any framework

## API Reference

See the [full API documentation](./src/index.ts) for detailed type information.

## License

MIT
