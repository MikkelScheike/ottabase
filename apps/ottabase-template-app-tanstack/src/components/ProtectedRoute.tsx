import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '@/lib/auth';
import { Spinner } from '@ottabase/ui-shadcn';

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    fallback?: ReactNode;
}

export function ProtectedRoute({
    children,
    redirectTo = '/login',
    requiredPermissions,
    requiredRoles,
    fallback,
}: ProtectedRouteProps) {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, user } = useSession({ skipAutoSync: true });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate({ to: redirectTo });
        }
    }, [isAuthenticated, isLoading, navigate, redirectTo]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center space-y-4">
                    <Spinner className="h-8 w-8 mx-auto" />
                    <p className="text-sm text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    const hasRequiredRoles =
        !requiredRoles || requiredRoles.length === 0 || requiredRoles.some((role) => user?.roles?.includes(role));

    const hasRequiredPermissions =
        !requiredPermissions ||
        requiredPermissions.length === 0 ||
        requiredPermissions.every((perm) => user?.permissions?.includes('*:*') || user?.permissions?.includes(perm));

    if (!hasRequiredRoles || !hasRequiredPermissions) {
        if (fallback) return <>{fallback}</>;
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                Access denied
            </div>
        );
    }

    return <>{children}</>;
}
