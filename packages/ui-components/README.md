# @ottabase/ui-components

Shared UI components for Ottabase applications.

## Components

### DarkModeToggle

A versatile component that provides both toggle switch and button interfaces for switching between light and dark themes. It integrates with both Mantine's color scheme and next-themes for Tailwind CSS.

#### Props

- `type`: `'toggle-switch' | 'button'` - The visual type of the toggle
- `title?: string` - Tooltip text for the button type (default: "Toggle color scheme")

#### Usage

```tsx
// Import from main entry (all components)
import { DarkModeToggle } from '@ottabase/ui-components';

// Import atomically (better for tree shaking)
import { DarkModeToggle } from '@ottabase/ui-components/dark-mode-toggle';

// Toggle switch variant
<DarkModeToggle type="toggle-switch" />

// Button variant
<DarkModeToggle type="button" title="Switch theme" />
```

#### Dependencies

This component requires:
- `@mantine/core` - For UI components and color scheme management
- `@tabler/icons-react` - For sun and moon icons
- `next-themes` - For Tailwind CSS theme synchronization

## Tree Shaking

This package supports atomic imports for optimal tree shaking. Each component can be imported individually:

```tsx
// ✅ Tree-shakeable - only bundles DarkModeToggle
import { DarkModeToggle } from '@ottabase/ui-components/dark-mode-toggle';

// ❌ Imports all components (less optimal)
import { DarkModeToggle } from '@ottabase/ui-components';
```

## Available Atomic Imports

- `@ottabase/ui-components/dark-mode-toggle` - DarkModeToggle component

## Installation

This package is part of the Ottabase monorepo and should be installed via the workspace dependencies.

```bash
pnpm install @ottabase/ui-components
```