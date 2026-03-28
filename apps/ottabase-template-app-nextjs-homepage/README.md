# Ottabase Next.js Homepage Template

Next.js 16 homepage template deployed to Cloudflare Workers via OpenNext. Uses Brand Engine for theming with 8 presets
and live switching.

> **Monorepo note:** The main TanStack app (`ottabase-template-app-tanstack`) drives its brand config from a D1
> database, editable via the admin UI at `/admin/brand-engine`. This homepage is intentionally **config-first** — no DB,
> no API call; the preset is set in `config/brand.config.ts` and resolved at request time. Both apps use the same
> underlying `@ottabase/brand-engine` presets, so to keep them visually in sync just match `themePreset` here to
> whatever preset is active in the TanStack app.

## Quick Start

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

## Structure

```
app/
├── page.tsx              # Homepage
├── about/page.tsx        # About
├── theme-demo/page.tsx   # Live theme switcher
├── layout.tsx            # Root layout (SSR critical CSS)
├── layout-shell.tsx      # Navbar + Footer wrapper
├── providers.tsx         # Theme providers + saved preset restore
├── globals.css           # Global styles
├── not-found.tsx         # 404
├── error.tsx             # Error boundary
└── loading.tsx           # Route spinner
components/
├── Navbar.tsx            # Sticky navbar, mobile menu, dark mode toggle
├── Footer.tsx            # Footer with links
├── Hero.tsx              # Hero section
├── FeatureCard.tsx       # Feature list items
├── CTASection.tsx        # Call-to-action block
├── ThemePresetSwitcher.tsx  # Preset picker (persists to localStorage)
└── index.ts              # Barrel exports
config/
└── brand.config.ts       # Theme preset + brand overrides
lib/
└── brand-server.ts       # Server-side brand/theme utilities
__tests__/                # Vitest test suite
```

## Brand Engine Integration

This app is fully wired to `@ottabase/brand-engine` for SSR-safe theming without a database or API call.

### How it works (end-to-end)

```
config/brand.config.ts          ← 1. Define your preset name + optional overrides
        ↓
lib/brand-server.ts             ← 2. Server resolves light + dark themes at request time
        ↓
app/layout.tsx (Server Component)
  - generateBrandConfig()       ← 3. Builds FullBrandConfig (both color modes)
  - buildCriticalCSS(theme)     ← 4. Injects CSS variables into <head> (prevents FOUC)
  - font <link> tags            ← 5. Loads preset fonts (only if the theme defines URLs)
        ↓
app/providers.tsx (Client Component)
  - BrandProvider               ← 6. Makes brand config available via useBrand()
  - ThemeProvider (next-themes) ← 7. Manages light/dark class on <html>
  - MutationObserver            ← 8. Watches dark class changes → calls applyBrandTheme()
  - localStorage restore        ← 9. Restores a user-saved preset on hydration
```

### Customising the brand

Edit `config/brand.config.ts`:

```typescript
import type { BrandTheme } from '@ottabase/brand-engine';

// Pick one of the 8 built-in presets
export const themePreset = 'crisp'; // default | neo | crisp | funky | artisan | midnight | rose | verdant

// Optionally override individual tokens — merged on top of the preset
export const brandConfig: Partial<BrandTheme> = {
    name: 'my-brand',
    // primaryColor, fontHeading, spacing, etc.
};
```

Changes take effect on the next server render — no migration or API call needed.

### Live preset switching

`ThemePresetSwitcher` (`components/ThemePresetSwitcher.tsx`) applies a new preset instantly via `applyBrandTheme()` and
persists the choice to `localStorage` (`ottabase.homepage.theme-preset`). On the next page load `providers.tsx` reads
this key and re-applies the preset before paint.

Visit `/theme-demo` to try all 8 presets live.

### Dark mode

`next-themes` adds/removes the `dark` class on `<html>`. `providers.tsx` observes that class and calls
`applyBrandTheme()` with the correct `darkTheme` or `theme` from the resolved brand config, so CSS variables flip
instantly without a full render.

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Dev server                           |
| `pnpm build`         | Production Next.js build             |
| `pnpm build:worker`  | Build OpenNext Cloudflare worker     |
| `pnpm start`         | Start production server locally      |
| `pnpm preview`       | Build + run on local `workerd`       |
| `pnpm deploy`        | Build + deploy to Cloudflare Workers |
| `pnpm lint`          | ESLint                               |
| `pnpm type-check`    | TypeScript validation                |
| `pnpm test`          | Run tests                            |
| `pnpm test:coverage` | Run tests with coverage              |

## Deployment

```bash
pnpm deploy
```

CI/CD is handled by the shared `.github/workflows/deploy.yml` — deploys on push to `main` with smart change detection
(only re-deploys when this app or shared packages change).

**Config-driven - no yml editing needed when renaming the app:**

1. Update `cloudflare-config.json` `workerName` and `wrangler.jsonc` `name` to match your new app name.
2. Set the `APPS_TO_DEPLOY` GitHub secret to a comma-separated list of app folder names, e.g. `main-app,homepage-app`.
3. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets.

The workflow reads `cloudflare-config.json` from each app folder to determine app type (`nextjs`), build commands,
output paths and wrangler config — no hardcoded names in yml.
