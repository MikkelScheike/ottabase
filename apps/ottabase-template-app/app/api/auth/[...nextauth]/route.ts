import { createAuthConfig, createNextAuth } from "@ottabase/auth/next";
import { prisma } from "@ottabase/db";

// Create auth configuration with Prisma client
const authConfig = createAuthConfig(prisma);
const { handlers } = createNextAuth(authConfig);

export const { GET, POST } = handlers;
