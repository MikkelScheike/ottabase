"use client";

import { useAuth } from "@ottabase/auth/next";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ottabase/ui-shadcn";

export default function AuthDemoPage() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading authentication state...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Authentication Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating NextAuth v5 integration with @ottabase/auth/next
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Authentication Status
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current authentication state using NextAuth v5 with Prisma adapter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Welcome back!
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>User ID:</strong> {user?.id || "N/A"}
                  </p>
                  <p>
                    <strong>Name:</strong> {user?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email || "N/A"}
                  </p>
                  {user?.image && (
                    <div className="flex items-center gap-2">
                      <strong>Avatar:</strong>
                      <img
                        src={user.image}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Not signed in
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click the button below to sign in with your configured
                  authentication providers.
                </p>
              </div>
              <Button onClick={() => signIn()} className="w-full">
                Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Details</CardTitle>
          <CardDescription>
            How this authentication demo is implemented
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Package Used:</h4>
              <code className="bg-muted px-2 py-1 rounded">
                @ottabase/auth/next
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Hook Used:</h4>
              <code className="bg-muted px-2 py-1 rounded">useAuth()</code>
            </div>
            <div>
              <h4 className="font-semibold mb-1">API Route:</h4>
              <code className="bg-muted px-2 py-1 rounded">
                app/api/auth/[...nextauth]/route.ts
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Provider:</h4>
              <code className="bg-muted px-2 py-1 rounded">
                AuthProvider
              </code>{" "}
              in app/providers.tsx
            </div>
            <div>
              <h4 className="font-semibold mb-1">Database:</h4>
              <p>
                Uses Prisma adapter with{" "}
                <code className="bg-muted px-2 py-1 rounded">@ottabase/db</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Environment variables and setup required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">
                Required Environment Variables:
              </h4>
              <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                <div>NEXTAUTH_SECRET=your-secret-key</div>
                <div>NEXTAUTH_URL=http://localhost:3000</div>
                <div>DATABASE_URL=your-database-url</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">
                Optional Provider Variables:
              </h4>
              <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                <div>GOOGLE_CLIENT_ID=your-google-client-id</div>
                <div>GOOGLE_CLIENT_SECRET=your-google-client-secret</div>
                <div>GITHUB_CLIENT_ID=your-github-client-id</div>
                <div>GITHUB_CLIENT_SECRET=your-github-client-secret</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
