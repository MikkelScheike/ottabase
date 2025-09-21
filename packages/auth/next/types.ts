/**
 * Type definitions for the auth package
 * Module augmentation should be done in the consuming application
 */

// Export types for use in consuming applications
export type AuthSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// Re-export NextAuth types for convenience
export type { NextAuthConfig } from "next-auth";
