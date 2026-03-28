# Ottabase Next.js Homepage Template

Next.js 16 homepage template deployed to Cloudflare Workers via OpenNext. Uses Brand Engine for theming with 8 presets
and live switching.

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

## Theming

Edit `config/brand.config.ts`:

```typescript
export const themePreset = 'crisp'; // default | neo | crisp | funky | artisan | midnight | rose | verdant
```

The selected preset is saved to `localStorage` (`ottabase.homepage.theme-preset`) and restored on page load. Visit
`/theme-demo` to switch presets live.

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

CI/CD via `.github/workflows/deploy-homepage.yml` — deploys on pushes to `main`. Requires `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` GitHub secrets.
