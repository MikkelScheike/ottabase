import {
    Outlet,
    RootRoute,
    Route,
    Router,
    Link,
    createBrowserHistory,
    lazyRouteComponent,
} from "@tanstack/react-router";
import { APP_META } from "@/ottabase/config/app.config";
import { DarkModeToggle } from "@ottabase/ui-components/dark-mode-toggle";
import { Button } from "@ottabase/ui-shadcn";

function RootLayout() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="font-semibold">
                            {APP_META.appName}
                        </Link>
                        <span className="text-xs text-muted-foreground">TanStack</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/">Home</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/demo">Demo</Link>
                        </Button>
                        <DarkModeToggle type="button" title="Toggle dark/light mode" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-10">
                <Outlet />
            </main>
        </div>
    );
}

function HomeRouteComponent() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold">{APP_META.appName}</h1>
            <p className="text-muted-foreground">{APP_META.description}</p>

            <p className="text-sm text-muted-foreground">
                Built with <strong>Vite</strong>, <strong>TanStack Router</strong>, and
                <strong> TanStack Query</strong>. Deploys to <strong>Cloudflare
                    Workers</strong> (assets served by the Worker).
            </p>

            <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                    <Link to="/demo">Go to Demo</Link>
                </Button>
                <Button asChild variant="outline">
                    <a href="/api/health" target="_blank" rel="noreferrer">
                        /api/health
                    </a>
                </Button>
            </div>
        </div>
    );
}

const rootRoute = new RootRoute({
    component: RootLayout,
    notFoundComponent: () => (
        <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Not found</h2>
            <Button asChild variant="outline">
                <Link to="/">Back home</Link>
            </Button>
        </div>
    ),
});

const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomeRouteComponent,
});

const demoRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo",
    component: lazyRouteComponent(() => import("@/pages/demo/DemoIndexPage").then((m) => ({ default: m.DemoIndexPage }))),
});

const demoMantineRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/mantine",
    component: lazyRouteComponent(() => import("@/pages/demo/mantine/MantineDemoRoute").then((m) => ({ default: m.MantineDemoRoute }))),
});

const demoShadcnRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/shadcn",
    component: lazyRouteComponent(() => import("@/pages/demo/shadcn/ShadcnDemoPage").then((m) => ({ default: m.ShadcnDemoPage }))),
});

const demoOttaEditorRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/ottaeditor",
    component: lazyRouteComponent(() => import("@/pages/demo/ottaeditor/OttaEditorDemoPage").then((m) => ({ default: m.OttaEditorDemoPage }))),
});

const demoOttaOrmRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/ottaorm",
    component: lazyRouteComponent(() => import("@/pages/demo/ottaorm/OttaORMDemoPage").then((m) => ({ default: m.OttaORMDemoPage }))),
});

const demoOttaFormsRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/ottaforms",
    component: lazyRouteComponent(() => import("@/pages/demo/ottaforms/OttaFormsDemoPage").then((m) => ({ default: m.OttaFormsDemoPage }))),
});

const demoTimezoneRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/timezone",
    component: lazyRouteComponent(() => import("@/pages/demo/timezone/TimezoneDemoPage").then((m) => ({ default: m.TimezoneDemoPage }))),
});

const demoCloudflareRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareDemoIndexPage").then((m) => ({ default: m.CloudflareDemoIndexPage }))),
});

const demoCloudflareD1Route = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/d1",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareD1DemoPage").then((m) => ({ default: m.CloudflareD1DemoPage }))),
});

const demoCloudflareKVRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/kv",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareKVDemoPage").then((m) => ({ default: m.CloudflareKVDemoPage }))),
});

const demoCloudflareR2Route = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/r2",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareR2DemoPage").then((m) => ({ default: m.CloudflareR2DemoPage }))),
});

const demoCloudflareImagesRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/images",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareImagesDemoPage").then((m) => ({ default: m.CloudflareImagesDemoPage }))),
});

const demoCloudflareHyperdriveRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/hyperdrive",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareHyperdriveDemoPage").then((m) => ({ default: m.CloudflareHyperdriveDemoPage }))),
});

const demoCloudflareQueuesRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/queues",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareQueuesDemoPage").then((m) => ({ default: m.CloudflareQueuesDemoPage }))),
});

const demoCloudflareRateLimitingRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/rate-limiting",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareRateLimitingDemoPage").then((m) => ({ default: m.CloudflareRateLimitingDemoPage }))),
});

const demoCloudflareRealtimeRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/cloudflare/realtime",
    component: lazyRouteComponent(() => import("@/pages/demo/cloudflare/CloudflareRealtimeDemoPage").then((m) => ({ default: m.CloudflareRealtimeDemoPage }))),
});

const demoApiRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/demo/api",
    component: lazyRouteComponent(() => import("@/pages/demo/api/ApiDemoPage").then((m) => ({ default: m.ApiDemoPage }))),
});

const routeTree = rootRoute.addChildren([
    indexRoute,
    demoRoute,
    demoMantineRoute,
    demoShadcnRoute,
    demoOttaEditorRoute,
    demoOttaOrmRoute,
    demoOttaFormsRoute,
    demoTimezoneRoute,
    demoCloudflareRoute,
    demoCloudflareD1Route,
    demoCloudflareKVRoute,
    demoCloudflareR2Route,
    demoCloudflareImagesRoute,
    demoCloudflareHyperdriveRoute,
    demoCloudflareQueuesRoute,
    demoCloudflareRateLimitingRoute,
    demoCloudflareRealtimeRoute,
    demoApiRoute,
]);

const browserHistory = createBrowserHistory();

export const router = new Router({
    routeTree,
    history: browserHistory,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
