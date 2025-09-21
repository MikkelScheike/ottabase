# @ottabase/auth

Authentication packages for Ottabase applications.

## @ottabase/auth/next

NextAuth v5 authentication package for Ottabase applications with Prisma adapter integration.

## Features

- 🔐 NextAuth v5 (beta.25) with latest features for Next.js 15+
- 🗄️ Prisma adapter integration with `@ottabase/db`
- ⚛️ React hooks for authentication state management
- 🎯 TypeScript support with proper type definitions
- 🔧 Pre-configured authentication pages and callbacks
- 📦 Monorepo-optimized with workspace dependencies

## Installation

This package is part of the Ottabase monorepo and uses workspace dependencies. The required dependencies are managed through the pnpm catalog system.

```bash
pnpm install
```

## Usage

### 1. API Route Setup

Create an API route handler in your Next.js app:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { createAuthConfig, createNextAuth } from "@ottabase/auth/next";
import { prisma } from "@ottabase/db";

// Create auth configuration with your Prisma client
const authConfig = createAuthConfig(prisma);
const { handlers } = createNextAuth(authConfig);

export const { GET, POST } = handlers;
```

### 2. Middleware Setup

Add authentication middleware to your app:

```typescript
// middleware.ts
import { createAuthConfig, createNextAuth } from "@ottabase/auth/next";
import { prisma } from "@ottabase/db";

const authConfig = createAuthConfig(prisma);
const { auth } = createNextAuth(authConfig);

export default auth((req) => {
  // Your middleware logic here
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 3. Provider Setup

Wrap your app with the AuthProvider:

```tsx
// app/providers.tsx
import { AuthProvider } from "@ottabase/auth/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### 4. Using Auth Hooks

Use the provided hooks in your components:

```tsx
import { useAuth, useAuthUser, useIsAuthenticated } from "@ottabase/auth/next";

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Configuration

The package comes with a pre-configured setup that includes:

- **Prisma Adapter**: Automatically configured with `@ottabase/db`
- **Session Strategy**: JWT-based sessions
- **Default Pages**: Pre-configured auth pages (`/auth/signin`, `/auth/signout`, etc.)
- **Callbacks**: Authorization, session, and JWT callbacks

### Customizing Providers

To add authentication providers, create a custom auth configuration:

```typescript
// lib/auth.ts
import { createAuthConfig, createNextAuth } from "@ottabase/auth/next";
import { prisma } from "@ottabase/db";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const authConfig = createAuthConfig(prisma);

// Customize the configuration
const customAuthConfig = {
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = createNextAuth(customAuthConfig);
```

## Environment Variables

Add the following environment variables to your `.env.local`:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database (handled by @ottabase/db)
DATABASE_URL=your-database-url

# Provider-specific variables (example)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Database Schema

The package uses the Prisma adapter which requires specific database tables. Make sure your Prisma schema includes the NextAuth tables. The `@ottabase/db` package should already include these in the core schema.

## API Reference

### Hooks

- **`useAuth()`**: Complete authentication state and actions
- **`useAuthUser()`**: Current user information
- **`useIsAuthenticated()`**: Authentication status with loading state
- **`useSession()`**: Direct NextAuth session hook

### Components

- **`AuthProvider`**: Session provider wrapper
- **`SessionProvider`**: Direct NextAuth session provider

### Configuration

- **`authConfig`**: Main NextAuth configuration
- **`handlers`**: API route handlers
- **`auth`**: Authentication function for middleware
- **`signIn`**: Server-side sign in function
- **`signOut`**: Server-side sign out function

## Dependencies

This package has peer dependencies on:

- `next-auth` (v5.0.0-beta.25)
- `@auth/prisma-adapter` (^2.10.0)
- `@ottabase/db` (workspace dependency)
- `react` and `react-dom` (catalog versions)
- `next` (catalog version)

## Contributing

This package follows the Ottabase monorepo conventions:

1. Use `pnpm` for package management
2. Follow the established TypeScript patterns
3. Update the catalog in `pnpm-workspace.yaml` for new dependencies
4. Maintain peer dependency strategy for framework dependencies

## License

MIT
