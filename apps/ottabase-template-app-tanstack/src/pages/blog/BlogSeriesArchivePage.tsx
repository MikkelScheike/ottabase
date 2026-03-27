/**
 * Public Blog Series Archive Page
 *
 * Shows series details (title, description) and an ordered list of posts in the series.
 */
import { SEOHead } from '@/components/SEOHead';
import { BLOG_LIST_QUERY_CONFIG } from '@/config/queryConfig';
import { formatDate } from '@ottabase/ottablog';
import { useApiQuery } from '@ottabase/ottaorm/client';
import { Badge, Button, Card, CardContent } from '@ottabase/ui-shadcn';
import { Link, useParams } from '@tanstack/react-router';
import { BookOpen, Calendar, ChevronLeft, Clock, Lock, User } from 'lucide-react';

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
    seriesOrder?: number | null;
    tags?: { id: string; name: string; slug: string }[];
    categories?: { id: string; name: string; slug: string }[];
}

interface BlogPostsResponse {
    data: BlogPost[];
    pagination: { page: number; perPage: number; total: number; totalPages: number };
}

interface SeriesInfo {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    status?: string;
}

export function BlogSeriesArchivePage() {
    const params = useParams({ strict: false });
    const slug = (params as { slug?: string }).slug;

    // Fetch series info
    const { data: series, isLoading: isLoadingSeries } = useApiQuery<SeriesInfo>({
        entity: 'post_series',
        queryKey: ['by-slug', slug],
        endpoint: `/api/blog/series/by-slug/${encodeURIComponent(slug ?? '')}`,
        queryOptions: { enabled: !!slug, staleTime: 60_000 },
    });

    // Fetch posts in this series, ordered by seriesOrder
    const { data: postsResponse, isLoading: isLoadingPosts } = useApiQuery<BlogPostsResponse>({
        entity: 'posts',
        queryKey: ['series-archive', slug],
        endpoint: `/api/blog/posts?seriesId=${encodeURIComponent(series?.id ?? '')}&orderBy=seriesOrder&orderDirection=asc&perPage=50`,
        queryOptions: { enabled: !!series?.id, ...BLOG_LIST_QUERY_CONFIG },
    });

    const posts = postsResponse?.data ?? [];
    const isLoading = isLoadingSeries || isLoadingPosts;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!series) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold mb-4">Series Not Found</h1>
                <p className="text-muted-foreground mb-6">The series you're looking for doesn't exist.</p>
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
                title={`${series.title} — Blog Series`}
                description={series.description || `All posts in the "${series.title}" series`}
            />

            {/* Back link */}
            <Button variant="ghost" size="sm" asChild>
                <Link to="/blog">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Blog
                </Link>
            </Button>

            {/* Series header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                    <h1 className="text-3xl font-bold">{series.title}</h1>
                    {series.status && (
                        <Badge variant={series.status === 'completed' ? 'default' : 'secondary'}>{series.status}</Badge>
                    )}
                </div>
                {series.description && <p className="text-muted-foreground">{series.description}</p>}
                <p className="text-sm text-muted-foreground">
                    {posts.length} {posts.length === 1 ? 'part' : 'parts'}
                </p>
            </div>

            {/* Posts list (ordered) */}
            {posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No posts in this series yet.</p>
            ) : (
                <div className="space-y-4">
                    {posts.map((post, index) => (
                        <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="p-5 flex gap-4">
                                    {/* Part number */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold text-sm shrink-0">
                                        {post.seriesOrder ?? index + 1}
                                    </div>

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

export default BlogSeriesArchivePage;
