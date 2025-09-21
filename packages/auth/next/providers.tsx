"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
  session?: Session | null;
}

/**
 * NextAuth SessionProvider wrapper for client-side authentication
 *
 * @param children - React children components
 * @param session - Optional session object from server-side
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

/**
 * Re-export SessionProvider for direct usage if needed
 */
export { SessionProvider };
