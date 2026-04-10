/**
 * Admin Content List Page
 *
 * Unified content management for all content types (blog, changelog, docs, news, announcements).
 * Lists all posts with filtering, status management, and CRUD operations.
 */
import { ADMIN_LIST_QUERY_CONFIG } from '@/config/queryConfig';
import { api } from '@/lib/api';
import { CONTENT_TYPES, formatShortDate, POST_STATUSES, type ContentType, type PostStatus } from '@ottabase/ottablog';
import { createModelHooks } from '@ottabase/ottaorm/client';
import { ConfirmDialog } from '@ottabase/ui-components';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Input,
} from '@ottabase/ui-shadcn';
import { Link } from '@tanstack/react-router';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    FileText,
    Filter,
    Loader2,
    Plus,
    Search,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BlogAdminNav } from './BlogAdminNav';

/** Debounce delay for search input (ms) */
const SEARCH_DEBOUNCE_MS = 300;

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    contentType: ContentType;
    status: PostStatus;
    authorName: string | null;
    isFeatured: boolean;
    readingTimeMinutes: number | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

const blogPostHooks = createModelHooks<BlogPost>({ entityName: 'posts' });

const POSTS_PER_PAGE = 20;

/** Get the correct public URL for a post based on its content type */
function getPublicUrl(slug: string, contentType: ContentType): string {
    switch (contentType) {
        case 'changelog':
            return `/changelog/${slug}`;
        case 'docs':
            return `/docs/${slug}`;
        default:
            return `/blog/${slug}`;
    }
}

/** Content type tabs - all singular for consistency */
const CONTENT_TYPE_TABS: Array<{ value: ContentType | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'changelog', label: 'Changelog' },
    { value: 'docs', label: 'Doc' },
    { value: 'news', label: 'News' },
    { value: 'announcement', label: 'Announcement' },
];

export function AdminBlogListPage() {
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
    const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);
    const [alertDialog, setAlertDialog] = useState<{ open: boolean; title: string; message: string }>({
        open: false,
        title: '',
        message: '',
    });

    // Debounce search input to reduce API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(1); // Reset to page 1 when search changes
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const [kitchensinkState, setKitchensinkState] = useState<'idle' | 'loading' | 'created' | 'exists'>('idle');
    const [kitchensinkSlug, setKitchensinkSlug] = useState<string | null>(null);

    const seedKitchensink = async () => {
        setKitchensinkState('loading');
        try {
            const json = await api<{ status: string; id?: string; slug?: string }>('/api/blog/kitchensink', 'POST');
            setKitchensinkSlug(json.slug ?? null);
            setKitchensinkState(json.status === 'created' ? 'created' : 'exists');
        } catch {
            setKitchensinkSlug(null);
            setKitchensinkState('idle');
        }
    };

    // Build where clause for server-side filtering
    const whereClause: Record<string, unknown> = {};
    if (statusFilter !== 'all') {
        whereClause.status = statusFilter;
    }
    if (contentTypeFilter !== 'all') {
        whereClause.contentType = contentTypeFilter;
    }

    // Fetch posts with pagination and server-side filtering + search
    const {
        data: postsResponse,
        isLoading,
        error,
    } = blogPostHooks.useList(
        {
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            search: debouncedSearch || undefined,
            orderBy: 'updatedAt',
            orderDirection: 'desc',
            limit: POSTS_PER_PAGE,
            offset: (currentPage - 1) * POSTS_PER_PAGE,
        },
        ADMIN_LIST_QUERY_CONFIG,
    );

    const posts = postsResponse || [];

    const updatePost = blogPostHooks.useUpdate();
    const deletePost = blogPostHooks.useDelete();

    // Toggle highlight/featured status
    const handleToggleFeatured = (id: string, currentValue: boolean) => {
        updatePost.mutate({ id, data: { isFeatured: !currentValue } });
    };

    // Reset to page 1 when filters change
    const handleFilterChange = (callback: () => void) => {
        callback();
        setCurrentPage(1);
    };

    const handleDelete = (id: string, title: string) => {
        setDeleteDialog({ id, title });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog) return;

        try {
            await deletePost.mutateAsync(deleteDialog.id);
        } catch (err) {
            console.error('Failed to delete blog post:', err);
            const failedTitle = deleteDialog.title;
            setAlertDialog({
                open: true,
                title: 'Error',
                message: `Failed to delete "${failedTitle}". Please try again.`,
            });
        } finally {
            setDeleteDialog(null);
        }
    };

    const getStatusBadge = (status: PostStatus) => {
        const variants: Record<PostStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            published: 'default',
            draft: 'secondary',
            scheduled: 'outline',
            archived: 'destructive',
        };
        return <Badge variant={variants[status]}>{POST_STATUSES[status].label}</Badge>;
    };

    const getContentTypeBadge = (contentType: ContentType) => {
        return (
            <Badge variant="outline" className="text-xs">
                {CONTENT_TYPES[contentType].label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <BlogAdminNav />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage blog posts, changelogs, documentation, news, and announcements.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Seed Kitchensink: creates a demo post with all block types */}
                    {(kitchensinkState === 'created' || kitchensinkState === 'exists') && kitchensinkSlug ? (
                        <Badge variant="outline" className="text-xs">
                            {kitchensinkState === 'created' ? '✓ Created' : 'Already exists'}{' '}
                            <a href={`/blog/${kitchensinkSlug}`} className="ml-1 underline text-primary">
                                View
                            </a>
                        </Badge>
                    ) : null}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={seedKitchensink}
                        disabled={
                            kitchensinkState === 'loading' ||
                            kitchensinkState === 'created' ||
                            kitchensinkState === 'exists'
                        }
                    >
                        {kitchensinkState === 'loading' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        Seed Demo
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {Object.entries(CONTENT_TYPES).map(([value, { label }]) => (
                                <DropdownMenuItem key={value} asChild>
                                    <Link to="/admin/blog/new" search={{ contentType: value }}>
                                        {label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Content Type Tabs */}
            <div className="flex items-center gap-1 border-b">
                {CONTENT_TYPE_TABS.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => handleFilterChange(() => setContentTypeFilter(value))}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                            contentTypeFilter === value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by title, slug, or excerpt..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9"
                            />
                            {isLoading && debouncedSearch && (
                                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    handleFilterChange(() => setStatusFilter(e.target.value as PostStatus | 'all'))
                                }
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                aria-label="Filter by status"
                            >
                                <option value="all">All Status</option>
                                {Object.entries(POST_STATUSES).map(([value, { label }]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error.message}</p>
                    </CardContent>
                </Card>
            )}

            {/* Posts List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{CONTENT_TYPE_TABS.find((t) => t.value === contentTypeFilter)?.label || 'Content'}</span>
                        {isLoading && <span className="text-sm font-normal text-muted-foreground">Loading...</span>}
                    </CardTitle>
                    <CardDescription>
                        {posts.length} item{posts.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No posts found</h3>
                            <p className="mt-2 text-muted-foreground">
                                {posts.length === 0
                                    ? 'Get started by creating your first post.'
                                    : 'Try adjusting your search or filters.'}
                            </p>
                            {posts.length === 0 && (
                                <Button asChild className="mt-4">
                                    <Link to="/admin/blog/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Post
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                title={post.isFeatured ? 'Remove highlight' : 'Highlight this post'}
                                                className="shrink-0 text-muted-foreground hover:text-yellow-500 transition-colors"
                                                onClick={() => handleToggleFeatured(post.id, post.isFeatured)}
                                                disabled={updatePost.isPending}
                                            >
                                                {post.isFeatured ? (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                ) : (
                                                    <Star className="h-4 w-4" />
                                                )}
                                            </button>
                                            <Link
                                                to="/admin/blog/$postId/edit"
                                                params={{ postId: post.id }}
                                                className="font-semibold hover:underline"
                                            >
                                                {post.title}
                                            </Link>
                                            {getStatusBadge(post.status)}
                                            {getContentTypeBadge(post.contentType)}
                                        </div>

                                        {post.excerpt && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : '—'}
                                            </span>
                                            {post.authorName && <span>by {post.authorName}</span>}
                                            <span>
                                                {post.status === 'published'
                                                    ? `Published ${formatShortDate(post.publishedAt)}`
                                                    : `Updated ${formatShortDate(post.updatedAt)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <a
                                                href={getPublicUrl(post.slug, post.contentType)}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to="/admin/blog/$postId/edit" params={{ postId: post.id }}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(post.id, post.title)}
                                            disabled={deletePost.isPending}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {!isLoading && posts.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {Math.min((currentPage - 1) * POSTS_PER_PAGE + 1, posts.length)} to{' '}
                        {Math.min(currentPage * POSTS_PER_PAGE, posts.length)} results
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">Page {currentPage}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={posts.length < POSTS_PER_PAGE}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteDialog !== null}
                onOpenChange={(open) => !open && setDeleteDialog(null)}
                title="Delete Post?"
                description={`Are you sure you want to delete "${deleteDialog?.title}"?`}
                tone="destructive"
                secondaryActionText="Cancel"
                primaryActionText="Delete"
                onConfirm={handleConfirmDelete}
                confirmProps={{ disabled: deletePost.isPending }}
                cancelProps={{ disabled: deletePost.isPending }}
            />

            <AlertDialog
                open={alertDialog.open}
                onOpenChange={(open) => !open && setAlertDialog({ ...alertDialog, open: false })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>{alertDialog.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setAlertDialog({ ...alertDialog, open: false })}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
