/**
 * User Management Page (Admin)
 *
 * System-wide user management for admins
 * GitHub-like minimal UI with dark mode support
 */

import { TableSkeleton } from '@/components/LoadingSkeletons';
import { useApiQuery } from '@ottabase/ottaorm/client';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@ottabase/ui-shadcn';
import type { PaginatedResponse } from '@ottabase/utils/pagination';
import { Link } from '@tanstack/react-router';
import { Calendar, ChevronLeft, ChevronRight, Mail, Search, Shield, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const PER_PAGE = 25;

interface User {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: string | null;
    image: string | null;
    createdAt: string;
    role?: 'admin' | 'user';
}

export function UserManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce search to avoid hammering the API on every keystroke.
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on new search
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchTerm]);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('per_page', String(PER_PAGE));
        if (debouncedSearch) params.set('search', debouncedSearch);
        return params.toString();
    }, [currentPage, debouncedSearch]);

    const { data: response, isLoading } = useApiQuery<PaginatedResponse<User>>({
        entity: 'users',
        queryKey: ['admin-users', queryParams],
        endpoint: `/api/admin/users?${queryParams}`,
        queryOptions: { staleTime: 2 * 60 * 1000 },
    });

    const users = response?.data ?? [];
    const pagination = response?.pagination;

    const getUserInitials = (user: User) => {
        if (user.name) {
            return user.name
                .split(' ')
                .filter((n) => n.length > 0)
                .map((n) => n[0])
                .join('')
                .toUpperCase();
        }
        return user.email?.[0]?.toUpperCase() || '?';
    };

    const pageStart = pagination ? (pagination.page - 1) * pagination.perPage + 1 : 0;
    const pageEnd = pagination ? Math.min(pagination.page * pagination.perPage, pagination.total) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground mt-1">View and manage all users across the system</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/admin">← Back to Admin</Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Users</CardDescription>
                        <CardTitle className="text-2xl">{pagination?.total ?? '—'}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Users</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <TableSkeleton rows={5} columns={5} />
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found matching your search
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.image || undefined} />
                                                    <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name || 'No name'}</div>
                                                    <code className="text-xs text-muted-foreground">{user.id}</code>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {user.email || 'No email'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.role === 'admin' ? (
                                                <Badge variant="default" className="gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">User</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {user.emailVerified ? (
                                                <Badge variant="outline" className="gap-1">
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link to={`/admin/access/users/${user.id}/rbac`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {!isLoading && pagination && pagination.total > PER_PAGE && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {pageStart}–{pageEnd} of {pagination.total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
