# @ottabase/ottaeditor

A flexible EditorJS wrapper with typesafe plugin management for React applications.

## Features

- **21 pre-installed plugins** (15 Editor.js + 6 custom blocks)
- **Type-safe plugin selection** with autocomplete
- **TypeScript support**
- **Custom plugin integration**
- **Zero-config defaults**

## Installation

```bash
pnpm add @ottabase/ottaeditor
```

## Default Plugins

15 Editor.js plugins included: Header, Paragraph, List, Checklist, Code, Quote, Table, Warning, Delimiter, Link, Embed,
Raw HTML, Marker, Underline, Inline Code.

### Custom Block Plugins

- **Spoiler** – Collapsible spoiler content
- **CTA** – Call-to-action button with alignment (left/center/right) and four style variants (primary, secondary,
  outline, ghost)
- **Review** – Product/service review block with image, rating, pros/cons, and summary
- **Map** – Embeddable map block (OpenStreetMap, Google Maps)
- **Layout** – Multi-column layout with six preset splits; each column hosts a full nested editor
- **Disclosure** – Transparency block with AI usage disclosure (slight/mid/high/custom %) and sponsored-content
  disclaimer (preset or custom wording)

CTA and Disclosure generate instance-scoped input IDs/names so multiple blocks can coexist without DOM ID or radio-group
collisions.

## Quick Start

### Load All Plugins

```tsx
import { useOttaEditor } from '@ottabase/ottaeditor';

const { editorRef, save, hasUnsavedChanges } = useOttaEditor({
    defaultPlugins: 'all',
    placeholder: 'Start writing...',
});

<button onClick={save} disabled={!hasUnsavedChanges}>
    Save
</button>;
```

### Select Specific Plugins

```tsx
const { editorRef } = useOttaEditor({
    defaultPlugins: ['header', 'paragraph', 'list', 'code'],
});
```

### Add Custom Plugins

```tsx
import MyCustomPlugin from './MyCustomPlugin';

const { editorRef } = useOttaEditor({
    defaultPlugins: 'all',
    additionalPlugins: [{ name: 'custom', tool: MyCustomPlugin }],
});
```

### Use Constants (Type-safe)

```tsx
import { DEFAULT_PLUGIN_NAMES } from '@ottabase/ottaeditor';

const { editorRef } = useOttaEditor({
    defaultPlugins: [DEFAULT_PLUGIN_NAMES.HEADER, DEFAULT_PLUGIN_NAMES.PARAGRAPH],
});
```

## Available Plugin Names

Use these names with `defaultPlugins`:

`'header'`, `'paragraph'`, `'list'`, `'checklist'`, `'code'`, `'quote'`, `'table'`, `'warning'`, `'delimiter'`,
`'linkTool'`, `'embed'`, `'raw'`, `'Marker'`, `'underline'`, `'inlineCode'`, `'spoiler'`, `'cta'`, `'review'`, `'map'`,
`'layout'`, `'disclosure'`

## API

### `useOttaEditor` Options

```typescript
{
  defaultPlugins?: 'all' | string[];  // Which default plugins to load
  additionalPlugins?: OttaEditorPlugin[];  // Custom plugins to add
  placeholder?: string;
  data?: OutputData;
  minHeight?: number;
  readOnly?: boolean;
  autofocus?: boolean;
  onReady?: () => void;
  onChange?: (api, event) => void;
}
```

### `useOttaEditor` Returns

```typescript
{
    editorRef: React.RefObject<HTMLDivElement>;
    editor: OttaEditor | null;
    save: () => Promise<OutputData | null>;
    clear: () => Promise<void>;
    render: (data: OutputData) => Promise<void>;
    toggleReadOnly: (state?: boolean) => Promise<void>;
    isReady: boolean;
    hasUnsavedChanges: boolean; // True when content changes, false after save
}
```

## Plugin Reference

### CTA

```typescript
// Saved data shape
interface CTAData {
    text: string; // Button label
    url: string; // Destination URL
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
    alignment: 'left' | 'center' | 'right';
    openInNewTab: boolean;
    icon?: string; // Optional SVG string
}
```

### Disclosure

```typescript
// Saved data shape
interface DisclosureData {
    aiEnabled: boolean;
    aiLevel: 'none' | 'slight' | 'mid' | 'high' | 'custom';
    aiPercent?: number; // 1–100, used when aiLevel === 'custom'
    sponsoredEnabled: boolean;
    sponsoredType: 'preset' | 'custom';
    sponsoredText?: string; // Used when sponsoredType === 'custom'
}

// Standard AI wording presets
// slight → "AI tools were used to assist in light editing and proofreading…"
// mid    → "AI tools were significantly used in drafting and editing…"
// high   → "This content was primarily generated with AI assistance…"
// custom → "Approximately {n}% of this content was created with AI assistance."

// Standard sponsored preset
// "This content was created in partnership with a sponsor. Our editorial standards remain independent."
```

### Layout

```typescript
// Saved data shape
interface LayoutData {
    preset: '1-1' | '1-3' | '3-1' | '1-2' | '2-1' | '1-1-1';
    columns: Array<{ content: OutputData }>;
}
```

## Styling

All custom plugins use common classes from `ottaeditor-common.css` (imported by `editorjs-brandkit-theme.css`):

- **Root**: `.ob-plugin` — padding 12px, border-radius 8px, margin-bottom 16px
- **Form**: `.ob-form` — flex column, gap 8px
- **Input group**: `.ob-input-group` — flex column, gap 4px
- **Labels**: `.ob-label`, `.ob-section-label`, `.ob-hint`
- **Inputs**: `.ob-input`, `.ob-select`, `.ob-textarea` — padding 8px 12px, border-radius 4px, font-size 13px

Individual plugin CSS files contain only custom/override styles (e.g. background colors, layout, tool-specific UI).

## Types

```typescript
import type {
    AIDisclosureLevel,
    DefaultPluginName,
    DisclosureData,
    LayoutData,
    LayoutPreset,
    OttaEditorPlugin,
    OutputData,
} from '@ottabase/ottaeditor';
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
