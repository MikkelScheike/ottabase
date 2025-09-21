import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";

/**
 * Create NextAuth configuration with Prisma adapter
 * @param prismaClient - Prisma client instance
 */
export function createAuthConfig(prismaClient?: any): NextAuthConfig {
  return {
    adapter: prismaClient ? PrismaAdapter(prismaClient) : undefined,
    providers: [
      // Add your providers here
      // Example: Google, GitHub, etc.
    ],
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/auth/error",
      verifyRequest: "/auth/verify-request",
      newUser: "/auth/new-user",
    },
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

        if (isOnDashboard) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
        } else if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      },
      session({ session, token }) {
        if (token.sub && session.user) {
          session.user.id = token.sub;
        }
        return session;
      },
      jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
        }
        return token;
      },
    },
    session: {
      strategy: "jwt",
    },
    trustHost: true,
  };
}

/**
 * Default auth configuration without prisma client
 * Apps should use createAuthConfig with their prisma client
 */
export const authConfig: NextAuthConfig = createAuthConfig();

/**
 * Create NextAuth instance with custom configuration
 * @param config - NextAuth configuration
 */
export function createNextAuth(config: NextAuthConfig) {
  return NextAuth(config);
}

/**
 * Default NextAuth handlers for API routes
 * Apps should create their own using createNextAuth with their config
 */
const nextAuthResult = NextAuth(authConfig);
export const handlers: any = nextAuthResult.handlers;
export const auth: any = nextAuthResult.auth;
export const signIn: any = nextAuthResult.signIn;
export const signOut: any = nextAuthResult.signOut;

// Type definitions are exported separately to avoid module augmentation issues during build
