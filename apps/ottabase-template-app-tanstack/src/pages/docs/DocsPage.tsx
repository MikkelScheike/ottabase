import { DocsLayout, buildPageSlug } from '@ottabase/docs';
import '@ottabase/docs/styles.css';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { docsConfig } from './docs.config';

export function DocsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract slug from URL path after /docs/
    const basePath = '/docs';
    // Guard: only redirect to first doc when actually on /docs. Prevents redirecting back to docs
    // when navigating away (e.g. clicking logo to /) during route transition.
    const isOnDocsRoute = location.pathname === basePath || location.pathname.startsWith(`${basePath}/`);
    const rawSlug = location.pathname.replace(`${basePath}/`, '').replace(/^\/+|\/+$/g, '');
    const activeSlug = rawSlug || undefined;

    // Auto-navigate to first page when on docs route with no slug (e.g. /docs or /docs/)
    useEffect(() => {
        if (!isOnDocsRoute || activeSlug || docsConfig.sources.length === 0) return;
        const firstSource = docsConfig.sources.find((s) => s.pages.length > 0);
        if (firstSource && firstSource.pages[0]) {
            const slug = buildPageSlug(firstSource, firstSource.pages[0]);
            navigate({ to: `${basePath}/${slug}` as string });
        }
    }, [isOnDocsRoute, activeSlug, navigate]);

    const handleNavigate = (slug: string) => {
        navigate({ to: `${basePath}/${slug}` as string });
    };

    return <DocsLayout config={docsConfig} activeSlug={activeSlug} onNavigate={handleNavigate} />;
}
