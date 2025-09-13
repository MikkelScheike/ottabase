# @ottabase/ui

UI components and providers for Ottabase applications.

## Features

- **ProviderUI**: Main UI provider that combines Mantine and Next.js themes
- **NextThemesWrapper**: Standalone Next.js themes provider wrapper
- **Theme Management**: Integrated dark/light mode support
- **Mantine Integration**: Full Mantine UI library support
- **FOUC Prevention**: Flash of unstyled content prevention

## Installation

```bash
npm install @ottabase/ui
# or
pnpm add @ottabase/ui
```

## Usage

### Basic Setup

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

### Using NextThemesWrapper Separately

```tsx
import { NextThemesWrapper } from '@ottabase/ui';

function App({ children }) {
  return (
    <NextThemesWrapper>
      {children}
    </NextThemesWrapper>
  );
}
```

## Dependencies

This package requires the following peer dependencies:

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `next` >= 13.0.0

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Clean build artifacts
pnpm clean
