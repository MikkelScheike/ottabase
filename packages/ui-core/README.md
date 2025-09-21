# @ottabase/ui-core

UI components and Mantine-powered providers for Ottabase applications.

## Features

- **ProviderUI**: Main UI provider that wires Mantine, notifications, and modal support
- **Theme Management**: Integrated dark/light mode support with local storage persistence
- **Font Controls**: Configure the Mantine font families via `fontFamilies`
- **FOUC Prevention**: Flash of unstyled content prevention helpers

## Installation

```bash
npm install @ottabase/ui-core
# or
pnpm add @ottabase/ui-core
```

## Usage

### Basic Setup

```tsx
import { ProviderUI } from '@ottabase/ui-core';

const fontFamilies = {
  primary: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "Work Sans, 'Segoe UI', sans-serif",
  monospace: "JetBrains Mono, 'Fira Code', monospace",
};

function App({ children }) {
  return (
    <ProviderUI fontFamilies={fontFamilies}>
      {children}
    </ProviderUI>
  );
}

// Wrap the provider with framework-specific theme or font providers when needed
```

## Dependencies

This package requires the following peer dependencies:

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@mantine/core` ^8.3.1
- `@mantine/hooks` ^8.3.1
- `@mantine/modals` ^8.3.1
- `@mantine/notifications` ^8.3.1
- `@mantine/carousel` ^8.3.1

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Clean build artifacts
pnpm clean
```
