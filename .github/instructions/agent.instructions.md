# Ottabase Monorepo - AI Coding Agent Instructions

## 🏗️ Architecture Overview

Ottabase is a **pnpm monorepo** with **Turborepo** for build orchestration, featuring:

- **Next.js 15+ applications** in `apps/` (using App Router)
- **Shared packages** in `packages/` (React components, utilities, configuration)
- **Template-driven development** with `ottabase-template-app` as the reference implementation

## ⚙️ Environment & Tooling

- **Node.js**: `>=24.0.0` (enforced via root `package.json`)
- **pnpm**: `>=10.0.0` (commands must use pnpm; npm/yarn are not supported)
- **Turbo CLI**: invoked through `pnpm` scripts (`pnpm dev`, `pnpm build`, etc.)
- Local development assumes **Ubuntu (WSL or otherwise)** as the base; keep file paths linux-compatible
- Keep the workspace clean: do not add per-package lockfiles, always rely on the root `pnpm-lock.yaml`

## ✅ Agent Workflow Checklist

1. Review this file (`.github\instructions\agent.instructions.md`) and `AGENTS.MD` before making changes to confirm architecture and dependency rules.
2. Install dependencies with `pnpm install` if needed; never use other package managers.
3. For code changes, run `pnpm lint`, `pnpm type-check`, and any relevant `pnpm test` or `pnpm storybook` tasks (use `--filter` to scope when appropriate. E.g Build only ui-components package: `pnpm --filter @ottabase/ui-components build`).
4. When adding dependencies, update `pnpm-workspace.yaml`'s catalog first, then reference them as `"catalog:"` or `"workspace:*"`.
5. Validate that shared changes do not break `apps/ottabase-template-app`; use targeted build/dev commands when touching shared packages.

## 🎯 Core Patterns

### Dependency Management Strategy

- **PNPM Catalog System**: All shared dependencies are defined in `pnpm-workspace.yaml` catalog section
- **Workspace Protocol**: Internal packages use `"workspace:*"` (e.g., `"@ottabase/ui-core": "workspace:*"`)
- **Catalog References**: External deps use `"catalog:"` (e.g., `"react": "catalog:"`)
- **Peer Dependencies**: Shared packages declare framework deps as peerDependencies to avoid duplication

### Directory Structure Convention

Applications use a **3-directory architecture**:

- `app/` - Next.js App Router (pages, layouts, routing)
- `ottabase/` - Framework configuration (config, theme, state, menu)
- `src/` - Application logic (components, hooks, lib, types)

Example structure:

```
apps/my-app/
├── app/           # Next.js routing & pages
├── ottabase/      # Ottabase framework config
│   ├── config.ts  # Main app config using @ottabase/config
│   ├── theme.ts   # Mantine theme configuration
│   └── state.ts   # State management setup
└── src/           # App-specific code
    ├── components/
    ├── hooks/
    └── lib/
```

### Package Architecture

- **Build Tool**: All packages use `tsup` for dual CJS/ESM builds with TypeScript
- **Export Strategy**: Packages use modern exports field with types, import, require
- **CSS Exports**: UI packages export styles via `"./styles/*": "./styles/*"`
- **Internal Imports**: Root tsconfig.json provides path aliases for development

## 🚀 Development Workflows

### Essential Commands

```bash
# Install dependencies (always use pnpm)
pnpm install

# Development mode (all apps)
pnpm dev

# Build everything (respects Turbo dependency graph)
pnpm build

# Linting, type checking, testing
pnpm lint
pnpm type-check
pnpm test

# Storybook for UI validation
pnpm storybook

# Work with specific packages
pnpm dev --filter=@ottabase/ui-core
pnpm build --filter=ottabase-template-app
pnpm lint --filter=@ottabase/ui-components
```

### Adding Dependencies

```bash
# Add to catalog (shared across packages)
# First add to pnpm-workspace.yaml catalog, then reference as "catalog:"

# Add to specific package
pnpm add --filter @ottabase/ui-core some-package

# Add workspace dependency
# Use "workspace:*" in package.json dependencies
```

### Creating New Apps

1. Copy `apps/ottabase-template-app` structure
2. Update `ottabase/config.ts` with app-specific settings
3. Customize `ottabase/theme.ts` and `ottabase/menu.ts`
4. Delete `app/demo/` directory (template showcase)

### Creating New Packages

1. Follow naming: `@ottabase/package-name`
2. Use standard package.json with tsup build script
3. Export via `src/index.ts` with proper TypeScript types
4. Add to root tsconfig.json paths for development

## 📦 Package System & Catalog Management

### Package Structure Standards

All packages in `/packages` follow a consistent structure:

```
packages/my-package/
├── package.json      # Standard exports, peerDependencies, tsup build
├── src/
│   ├── index.ts     # Main export file
│   └── components/  # Package-specific code
├── README.md        # Package documentation
└── tsconfig.json    # Extends root config
```

### Package.json Template

```json
{
  "name": "@ottabase/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    },
    "./styles/*": "./styles/*"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "peerDependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "tsup": "catalog:"
  }
}
```

### PNPM Catalog System Deep Dive

The catalog in `pnpm-workspace.yaml` centralizes ALL external dependencies:

```yaml
catalog:
  '@mantine/core': ^8.3.1
  'react': ^18.3.1
  'typescript': ^5.9.2
  # Add deps here first based on `Dependency Decision Matrix`
```

**Critical Workflow**:

1. Add dependency to `pnpm-workspace.yaml` catalog first
2. Reference as `"catalog:"` in package.json
3. Use `peerDependencies` for shared framework deps (React, Mantine)
4. Use `dependencies` only for package-specific utilities

**⚠️ Dependency Decision Matrix**:

- **Add to catalog**: If 2+ packages will use it OR it's a major framework dependency that the apps can use
- **Package-level only**: If it's truly package-specific (e.g., a specialized parser library)
- **When unsure**: Add to catalog - easier to centralize than deduplicate later

### Existing Package Types

- **`@ottabase/config`** - App configuration utilities with `createAppConfig()`
- **`@ottabase/state`** - Jotai-based state management with providers
- **`@ottabase/ui-core`** - Core UI shell, Mantine provider, theme management
- **`@ottabase/ui-components`** - Reusable UI components (buttons, forms, layout helpers)
- **`@ottabase/ui-code-highlight`** - Code syntax highlighting providers and styles
- **`@ottabase/ui-tailwind`** - Tailwind preset and shared CSS (`tailwind.base.cjs`)
- **`@ottabase/core-auth`** - NextAuth utilities, providers, and route protection helpers
- **`@ottabase/core-prisma`** - Prisma client helpers, adapters, and schema integration
- **`@ottabase/hello-world`** - Example/template package for quick scaffolding

## 🔧 Framework Integration Patterns

### UI Provider Hierarchy (apps/\*/app/providers.tsx)

```tsx
<ProviderState>           // @ottabase/state - global state
  <ProviderUI>            // @ottabase/ui-core - Mantine + themes
    <ProviderCodeHighlight> // @ottabase/ui-code-highlight
      {children}
    </ProviderCodeHighlight>
  </ProviderUI>
</ProviderState>
```

### Configuration Pattern (ottabase/config.ts)

- Use `createAppConfig()` from `@ottabase/config`
- Export named constants for common values (`APP_NAME`, `THEME_COLORS`)
- Include meta, UI settings, storage prefix, API config, and feature flags

### Tailwind Integration

- Apps use `@ottabase/ui-tailwind/tailwind.base.cjs` as preset
- Content paths include relevant package source directories
- Shared UI components require package paths in Tailwind content

### State Management

- Built on Jotai atoms via `@ottabase/state`
- Use `createDefaultAppState()` with storage prefix from config
- Export individual atoms for component usage

## ⚠️ Critical Implementation Details

### Turbo Build Dependencies

- Packages must build before apps (configured in turbo.json)
- Use `dependsOn: ["^build"]` for lint/type-check tasks
- `dev` task is cache-disabled and persistent

### TypeScript Configuration

- Root tsconfig.json provides package path aliases for development
- Individual packages extend root config
- Apps have their own tsconfig.json for Next.js compatibility

### CSS & Styling

- Import `@ottabase/ui-tailwind/styles/tailwind.base.css` in app layout
- UI packages export CSS via exports field
- Mantine integration via `postcss-preset-mantine`

### Template App Guidelines

- `ottabase-template-app` serves as the canonical implementation
- Demo content in `app/demo/` should be marked for deletion in new apps
- Framework configuration in `ottabase/` directory is the customization point
- Reference this app for integration patterns and provider setup

## 🎯 When Working on This Codebase

1. **Always use pnpm** - never npm or yarn
2. **Check turbo.json** for task dependencies before adding new build steps
3. **Update pnpm-workspace.yaml catalog** when adding shared dependencies
4. **Follow the 3-directory pattern** for new applications
5. **Use workspace protocol** for internal package references
6. **Export styles properly** from UI packages for Tailwind content scanning
7. **Test template app** after making changes to shared packages
