# Ottabase Monorepo

A modern monorepo setup with pnpm workspaces and Turborepo for Next.js 15+ applications and shared packages.

## 🏗️ Structure

```
ottabase/
├── apps/                       # Next.js applications
│   └── ottabase-template-app/  # Example Next.js 15 app that uses packages as sample
├── packages/                # Shared packages
│   ├── ui/                  # UI components and providers
│   └── hello-world/         # Example package
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode for all apps
pnpm dev
```

### Commands

```bash
# Development
pnpm dev                    # Start all apps in dev mode
pnpm dev --filter=example-app  # Start specific app

# Building
pnpm build                  # Build all packages and apps
pnpm build --filter=@ottabase/ui  # Build specific package

# Linting & Type Checking
pnpm lint                   # Lint all packages
pnpm type-check            # Type check all packages

# Testing
pnpm test                   # Run tests for all packages

# Cleaning
pnpm clean                  # Clean all build artifacts
```

## 📦 Packages

### @ottabase/ui

UI components and providers for Ottabase applications.

**Features:**

- ProviderUI: Main UI provider combining Mantine and Next.js themes
- NextThemesWrapper: Standalone Next.js themes provider
- Theme management with dark/light mode support
- FOUC (Flash of Unstyled Content) prevention

**Usage:**

```tsx
import { ProviderUI } from '@ottabase/ui';

function App({ children }) {
  return (
    <ProviderUI>
      {children}
    </ProviderUI>
  );
}
```

## 🏗️ Creating New Apps

### Next.js App

```bash
# Create new Next.js app
mkdir apps/my-new-app
cd apps/my-new-app

# Copy from example-app or create manually
cp -r ../example-app/* .

# Update package.json name
# Update any app-specific configurations
```

### Package Structure

```json
{
  "name": "@ottabase/my-new-app",
  "dependencies": {
    "next": "^15.0.0",
    "react": "workspace:*",
    "react-dom": "workspace:*",
    "@ottabase/ui": "workspace:*"
  },
  "devDependencies": {
    "typescript": "workspace:*",
    "eslint": "workspace:*"
  }
}
```

## 🔧 Creating New Packages

```bash
# Create new package
mkdir packages/my-package
cd packages/my-package

# Create package.json
{
  "name": "@ottabase/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "devDependencies": {
    "typescript": "workspace:*",
    "tsup": "workspace:*"
  }
}
```

## 🎯 Key Features

- **Zero Duplication**: Shared dependencies via pnpm workspaces
- **Fast Builds**: Turborepo with intelligent caching
- **Type Safety**: Full TypeScript support across packages
- **Modern Stack**: Next.js 15+, React 18+, TypeScript 5+
- **Developer Experience**: Hot reload, linting, type checking
- **Scalable**: Easy to add new apps and packages

## 🔄 Dependency Management

### Adding Dependencies

```bash
# Add to root (shared across all packages)
pnpm add -w some-package

# Add to specific package
pnpm add --filter @ottabase/ui some-package

# Add dev dependency to root
pnpm add -wD some-dev-package
```

### Workspace Protocol

Use `workspace:*` to reference internal packages:

```json
{
  "dependencies": {
    "@ottabase/ui": "workspace:*",
    "react": "workspace:*"
  }
}
```

## 🏃‍♂️ Performance

- **Turborepo**: Intelligent build caching and parallelization
- **pnpm**: Content-addressable storage, faster installs
- **Workspace Dependencies**: No duplication, consistent versions
- **Incremental Builds**: Only rebuild what changed

## 🛠️ Configuration Files

- `turbo.json`: Turborepo pipeline configuration
- `pnpm-workspace.yaml`: pnpm workspace and catalog configuration
- `tsconfig.json`: Root TypeScript configuration
- `.eslintrc.js`: ESLint configuration for all packages
