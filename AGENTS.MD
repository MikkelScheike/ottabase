# Agents & Architecture

This is a monorepo which uses **Turbo** for efficient build orchestration and contains shared packages and standalone applications.

## 📁 Structure

```
ottabase/
├── apps/           # Standalone independent applications
└── packages/       # Shared code and utilities
```

## 🚀 Applications (`/apps`)

Independent Next.js 15 applications that can be deployed separately:

- **`ottabase-template-app`** - Template Next.js application with shared package integration

## 📦 Shared Packages (`/packages`)

Reusable code shared across applications:

### Core Packages

- **`@ottabase/config`** - Application configuration utilities
- **`@ottabase/state`** - State management with providers
- **`@ottabase/ui`** - UI components and theming system
- **`@ottabase/hello-world`** - Example component package

### Package Details

| Package | Purpose | Key Features |
|---------|---------|--------------|
| `config` | App configuration | Type-safe config creation |
| `state` | State management | Global state with React providers |
| `ui` | UI components | Tailwind CSS, themes, providers |
| `hello-world` | Example package | Sample React component |

## 🛠 Build System

- **Turbo** - Monorepo build orchestration
- **pnpm** - Package manager with workspace support
- **TypeScript** - Type safety across all packages

## 🎯 Development

Each app in `/apps` can:

- Import and use any package from `/packages`
- Be developed and deployed independently
- Share common utilities and components

Each package in `/packages` provides:

- Reusable functionality
- Type definitions
- Consistent APIs across apps

## 📋 Dependency Management

This monorepo uses a sophisticated dependency management strategy for maximum deduplication and efficiency:

### 🎯 PNPM Catalog System

All shared dependencies are managed through **PNPM's catalog feature** defined in [`pnpm-workspace.yaml`](pnpm-workspace.yaml:5):

- **Centralized versions**: Common dependencies like [`react`](pnpm-workspace.yaml:25), [`typescript`](pnpm-workspace.yaml:29), [`@mantine/core`](pnpm-workspace.yaml:8) are defined once in the catalog
- **Catalog references**: Packages use `"catalog:"` specifier instead of version numbers (e.g., [`"react": "catalog:"`](apps/ottabase-template-app/package.json:14))
- **Version consistency**: Ensures all packages use identical versions of shared dependencies

### 🔗 Workspace Dependencies

Internal packages use [`workspace:*`](apps/ottabase-template-app/package.json:16) protocol:

```json
"@ottabase/ui": "workspace:*",
"@ottabase/config": "workspace:*",
"@ottabase/state": "workspace:*"
```

This creates symlinks to local packages during development and resolves to proper versions during publishing.

### 🎨 Peer Dependencies Strategy

Shared packages declare external dependencies as **peerDependencies** to avoid duplication:

- [`@ottabase/hello-world`](packages/hello-world/package.json:27): Declares `react` and `react-dom` as peers
- [`@ottabase/state`](packages/state/package.json:35): Declares `jotai` as peer dependency
- [`@ottabase/ui`](packages/ui/package.json:42): Declares all UI framework dependencies as peers

### 📦 Package-Specific Lock Files

**✅ RESOLVED**: Package-specific lock files have been removed to maintain monorepo consistency.

### ✅ Best Practices for Contributors

1. **Use catalog references**: Always use `"catalog:"` for shared dependencies
2. **Workspace protocol**: Use `"workspace:*"` for internal package dependencies
3. **Peer dependencies**: Declare framework dependencies as peers in shared packages
4. **Single lock file**: Maintain only the root [`pnpm-lock.yaml`](pnpm-lock.yaml:1) - remove package-specific lock files
5. **Version updates**: Update versions only in [`pnpm-workspace.yaml`](pnpm-workspace.yaml:5) catalog section

This strategy ensures:

- **Zero duplication** of common dependencies across packages
- **Consistent versions** throughout the monorepo
- **Efficient installs** with PNPM's content-addressable storage
- **Type safety** with shared TypeScript configurations
