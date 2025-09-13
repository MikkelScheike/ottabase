# @ottabase/config

Shared configuration utilities for Ottabase applications with environment variable support.

## Features

- **Environment Variable Support**: Automatically reads from `NEXT_PUBLIC_*` environment variables
- **Type-Safe Configuration**: Full TypeScript support with strict typing
- **Flexible Defaults**: Override defaults per app or use global defaults
- **Storage Utilities**: Helper functions for consistent storage key naming
- **Multiple UI Framework Support**: Built-in support for Mantine, Shadcn, Chakra, and MUI

## Installation

```bash
pnpm add @ottabase/config
```

## Usage

### Basic Usage

```typescript
import { createAppConfig } from '@ottabase/config';

// Create config with defaults
const config = createAppConfig({
  appName: 'My Awesome App',
});

console.log(config.meta.appName); // "My Awesome App" or NEXT_PUBLIC_APP_NAME
console.log(config.uiFramework); // "mantine" or NEXT_PUBLIC_UI_FRAMEWORK
```

### With Custom Defaults

```typescript
import { createAppConfig } from '@ottabase/config';

const config = createAppConfig({
  appName: 'My App',
  defaults: {
    meta: {
      author: 'Custom Author',
      description: 'Custom description',
    },
    uiFramework: 'shadcn',
    features: {
      darkMode: false,
      analytics: true,
    },
  },
});
```

### Environment Variables

The package automatically reads from these environment variables:

```bash
# App Meta
NEXT_PUBLIC_APP_NAME="My App"
NEXT_PUBLIC_APP_TITLE="My App Title"
NEXT_PUBLIC_APP_DESCRIPTION="App description"
NEXT_PUBLIC_APP_LOGO_URL="/custom-logo.png"
NEXT_PUBLIC_APP_AUTHOR="Your Name"
NEXT_PUBLIC_APP_KEYWORDS="react,nextjs,typescript"
NEXT_PUBLIC_APP_ROBOTS="index,follow"
NEXT_PUBLIC_APP_COPYRIGHT_TEXT="© 2024 Your Company"
NEXT_PUBLIC_APP_COMPANY_NAME="Your Company"

# UI Framework
NEXT_PUBLIC_UI_FRAMEWORK="mantine" # mantine | shadcn | chakra | mui

# Features
NEXT_PUBLIC_FEATURE_DARK_MODE="true"
NEXT_PUBLIC_FEATURE_ANALYTICS="false"
NEXT_PUBLIC_FEATURE_NOTIFICATIONS="true"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="/api/v1"
NEXT_PUBLIC_API_TIMEOUT="15000"

# Storage
NEXT_PUBLIC_STORAGE_PREFIX="my-app"
```

### Storage Utilities

```typescript
import { createAppConfig, createStorageKey, STORAGE_KEYS } from '@ottabase/config';

const config = createAppConfig({ appName: 'My App' });

// Create prefixed storage keys
const themeKey = createStorageKey(config, STORAGE_KEYS.THEME);
// Result: "my-app-theme"

const customKey = createStorageKey(config, 'user-settings');
// Result: "my-app-user-settings"

// Use in localStorage
localStorage.setItem(themeKey, 'dark');
```

### TypeScript Types

```typescript
import type { AppConfig, AppMeta, SupportedUIFramework } from '@ottabase/config';

// Use the types in your app
function useAppConfig(): AppConfig {
  return createAppConfig({ appName: 'My App' });
}

// Type-safe UI framework
const framework: SupportedUIFramework = 'mantine';
```

## Configuration Structure

```typescript
interface AppConfig {
  meta: {
    appName: string;
    logoUrl: string;
    title: string;
    author: string;
    description: string;
    keywords: string;
    robots: string;
    copyrightText: string;
    companyName: string;
  };
  uiFramework: 'mantine' | 'shadcn' | 'chakra' | 'mui';
  features: {
    darkMode: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  storage: {
    prefix: string;
  };
}
```

## Examples

### Next.js App Router

```typescript
// app/layout.tsx
import { createAppConfig } from '@ottabase/config';

const config = createAppConfig({
  appName: 'My Next.js App',
});

export const metadata = {
  title: config.meta.title,
  description: config.meta.description,
  keywords: config.meta.keywords,
  robots: config.meta.robots,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Custom Hook

```typescript
// hooks/useAppConfig.ts
import { createAppConfig } from '@ottabase/config';
import { useMemo } from 'react';

export function useAppConfig() {
  return useMemo(() => createAppConfig({
    appName: 'My App',
    defaults: {
      features: {
        darkMode: true,
        analytics: false,
        notifications: true,
      },
    },
  }), []);
}
