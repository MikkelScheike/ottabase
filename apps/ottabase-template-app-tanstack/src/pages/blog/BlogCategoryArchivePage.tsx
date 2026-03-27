/**
 * Public Blog Category Archive Page
 *
 * Shows category details (name, description) and a list of posts in that category.
 */
import { SEOHead } from '@/components/SEOHead';
import { BLOG_LIST_QUERY_CONFIG } from '@/config/queryConfig';
import { formatDate } from '@ottabase/ottablog';
import { useApiQuery } from '@ottabase/ottaorm/client';
import { Button, Card, CardContent } from '@ottabase/ui-shadcn';
import { Link, useParams } from '@tanstack/react-router';
import { Calendar, ChevronLeft, Clock, FolderTree, Lock, User } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    heroImage: { url: string; alt?: string } | null;
    authorName: string | null;
    readingTimeMinutes: number | null;
    isFeatured: boolean;
    isProtected?: boolean;
    publishedAt: string | null;
    tags?: { id: string; name: string; slug: string }[];
    categories?: { id: string; name: string; slug: string }[];
}

interface BlogPostsResponse {
    data: BlogPost[];
    pagination: { page: number; perPage: number; total: number; totalPages: number };
}

interface CategoryInfo {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
}

export function BlogCategoryArchivePage() {
    const params = useParams({ strict: false });
    const slug = (params as { slug?: string }).slug;

    // Fetch category info
    const { data: category, isLoading: isLoadingCategory } = useApiQuery<CategoryInfo>({
        entity: 'categories',
        queryKey: ['by-slug', slug],
        endpoint: `/api/blog/categories/by-slug/${encodeURIComponent(slug ?? '')}`,
        queryOptions: { enabled: !!slug, staleTime: 60_000 },
    });

    // Fetch posts in this category
    const { data: postsResponse, isLoading: isLoadingPosts } = useApiQuery<BlogPostsResponse>({
        entity: 'posts',
        queryKey: ['category-archive', slug],
        endpoint: `/api/blog/posts?categoryId=${encodeURIComponent(category?.id ?? '')}&perPage=50`,
        queryOptions: { enabled: !!category?.id, ...BLOG_LIST_QUERY_CONFIG },
    });

    const posts = postsResponse?.data ?? [];
    const isLoading = isLoadingCategory || isLoadingPosts;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!category) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
                <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
                <Button asChild>
                    <Link to="/blog">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <SEOHead
                title={`${category.name} — Blog`}
                description={category.description || `All blog posts in the ${category.name} category`}
            />

            {/* Back link */}
            <Button variant="ghost" size="sm" asChild>
                <Link to="/blog">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Blog
                </Link>
            </Button>

            {/* Category header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <FolderTree className="h-6 w-6 text-muted-foreground" />
                    <h1 className="text-3xl font-bold">{category.name}</h1>
                </div>
                {category.description && <p className="text-muted-foreground">{category.description}</p>}
                <p className="text-sm text-muted-foreground">
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </p>
            </div>

            {/* Posts list */}
            {posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No posts found in this category.</p>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="p-5 flex gap-4">
                                    {post.heroImage?.url && (
                                        <img
                                            src={post.heroImage.url}
                                            alt={post.heroImage.alt || post.title}
                                            className="w-24 h-24 object-cover rounded shrink-0 hidden sm:block"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-2">
                                            {post.title}
                                            {post.isProtected && (
                                                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            )}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                            {post.authorName && (
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {post.authorName}
                                                </span>
                                            )}
                                            {post.publishedAt && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(post.publishedAt)}
                                                </span>
                                            )}
                                            {post.readingTimeMinutes && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {post.readingTimeMinutes} min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BlogCategoryArchivePage;
