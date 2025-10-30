# @ottabase/ui-mantine

Mantine UI components and providers for Ottabase applications. This package provides a comprehensive Mantine integration with pre-built themes and configuration utilities.

## Features

- **ProviderUIMantine**: Main UI provider that wires Mantine, notifications, and modal support
- **Pre-built Themes**: ShadCN, Vercel, Ant Design, and Stripe-inspired themes
- **Theme Management**: Integrated dark/light mode support with local storage persistence
- **Theme Configuration**: Utilities for creating and validating custom themes
- **Font Controls**: Configure Mantine font families via `fontFamilies` prop
- **FOUC Prevention**: Flash of unstyled content prevention helpers

## Installation

```bash
npm install @ottabase/ui-mantine @ottabase/ui-base
# or
pnpm add @ottabase/ui-mantine @ottabase/ui-base
```

## Usage

### Basic Setup

**Important:** ProviderUIMantine should be wrapped with ProviderUIMantineBase from `@ottabase/ui-base` to ensure base styles are loaded.

```tsx
import { ProviderUIMantineBase } from '@ottabase/ui-base';
import { ProviderUIMantine } from '@ottabase/ui-mantine';

const fontFamilies = {
  primary: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "Work Sans, 'Segoe UI', sans-serif",
  monospace: "JetBrains Mono, 'Fira Code', monospace",
};

function App({ children }) {
  return (
    <ProviderUIMantineBase>
      <ProviderUIMantine fontFamilies={fontFamilies}>
        {children}
      </ProviderUIMantine>
    </ProviderUIMantineBase>
  );
}
```

### Using Pre-built Themes

```tsx
import { ProviderUIMantineBase } from '@ottabase/ui-base';
import {
  ProviderUIMantine,
  mantineShadcn,
  mantineVercel,
  mantineAnt,
  mantineStripe
} from '@ottabase/ui-mantine';

function App({ children }) {
  return (
    <ProviderUIMantineBase>
      <ProviderUIMantine themeOverride={mantineShadcn}>
        {children}
      </ProviderUIMantine>
    </ProviderUIMantineBase>
  );
}
```

### Creating Custom Themes

```tsx
import { ProviderUIMantineBase } from '@ottabase/ui-base';
import {
  ProviderUIMantine,
  createMantineTheme,
  mantineShadcn,
  type MantineThemeConfig
} from '@ottabase/ui-mantine';

const myThemeConfig: MantineThemeConfig = {
  baseTheme: "mantine-shadcn",
  primaryColor: "blue",
  primaryShade: 6,
  colors: {
    brand: [
      "#f0f9ff",
      "#e0f2fe",
      "#bae6fd",
      "#7dd3fc",
      "#38bdf8",
      "#0ea5e9",
      "#0284c7",
      "#0369a1",
      "#075985",
      "#0c4a6e",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
  },
};

const customTheme = createMantineTheme(myThemeConfig, mantineShadcn);

function App({ children }) {
  return (
    <ProviderUIMantineBase>
      <ProviderUIMantine themeOverride={customTheme}>
        {children}
      </ProviderUIMantine>
    </ProviderUIMantineBase>
  );
}
```

## Available Themes

- **mantineShadcn**: ShadCN/UI inspired theme with neutral slate colors
- **mantineVercel**: Vercel-inspired clean and modern theme
- **mantineAnt**: Ant Design inspired theme
- **mantineStripe**: Stripe-inspired professional theme

## Dependencies

This package requires the following peer dependencies:

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@mantine/core` ^8.3.1
- `@mantine/hooks` ^8.3.1
- `@mantine/modals` ^8.3.1
- `@mantine/notifications` ^8.3.1
- `@mantine/carousel` ^8.3.1

**Note:** This package requires `@ottabase/ui-base` to be installed and its ProviderUIMantineBase component to wrap ProviderUIMantine.

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Clean build artifacts
pnpm clean
```

## Package Structure

```
ui-mantine/
├── src/
│   ├── index.ts         # Main entry point
│   └── themeConfig.ts   # Theme configuration utilities
├── provider/
│   └── ProviderUIMantine.tsx   # Mantine provider component
├── themes/
│   ├── mantine-shadcn.ts
│   ├── mantine-vercel.ts
│   ├── mantine-ant.ts
│   └── mantine-stripe.ts
└── package.json
```
