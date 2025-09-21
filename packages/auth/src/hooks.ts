"use client";

import type { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";

/**
 * Custom hook for authentication state and actions
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    signIn,
    signOut,
  };
}

/**
 * Custom hook to get the current user
 */
export function useAuthUser() {
  const { data: session } = useSession();
  return session?.user;
}

/**
 * Custom hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { data: session, status } = useSession();
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
  };
}

/**
 * Re-export NextAuth hooks for direct usage
 */
export { signIn, signOut, useSession } from "next-auth/react";

/**
 * Type definitions
 */
export type { Session } from "next-auth";
export type AuthUser = Session["user"];
