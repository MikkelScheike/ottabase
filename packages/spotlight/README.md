# @ottabase/spotlight

Lightweight spotlight/command palette component with dark mode support, background blur effects, and configurable search.

## Features

- 🎨 **Lightweight** - Minimal dependencies, built on shadcn/ui Dialog
- 🌓 **Dark/Light Mode** - Automatic theme support via Tailwind
- ✨ **CSS Effects** - Background blur and smooth animations
- ⌨️ **Keyboard Shortcuts** - Configurable trigger keys (default: `/`)
- 🔍 **Configurable Search** - Custom search callback and result renderer
- 🎯 **Keyboard Navigation** - Arrow keys, Enter, Escape support

## Installation

```bash
pnpm add @ottabase/spotlight
```

## Usage

### Basic Usage

```tsx
import { SpotlightProvider } from "@ottabase/spotlight";

function App() {
	return (
		<SpotlightProvider>
			<YourApp />
		</SpotlightProvider>
	);
}
```

### With Custom Search

```tsx
import { SpotlightProvider, type SpotlightResult } from "@ottabase/spotlight";

function App() {
	const handleSearch = async (query: string): Promise<SpotlightResult[]> => {
		// Your search logic
		const results = await fetch(`/api/search?q=${query}`).then((r) => r.json());
		return results.map((item) => ({
			id: item.id,
			label: item.title,
			description: item.description,
			onSelect: () => navigate(`/items/${item.id}`),
		}));
	};

	return (
		<SpotlightProvider
			onSearch={handleSearch}
			shortcuts={["/", "mod+k"]}
			placeholder="Search pages..."
		>
			<YourApp />
		</SpotlightProvider>
	);
}
```

### Programmatic Control

```tsx
import { useSpotlight } from "@ottabase/spotlight";

function MyComponent() {
	const { open, toggle, setOpen } = useSpotlight();

	return (
		<button onClick={toggle}>
			{open ? "Close" : "Open"} Spotlight
		</button>
	);
}
```

### Custom Result Renderer

```tsx
import { SpotlightProvider, type SpotlightResult } from "@ottabase/spotlight";

function App() {
	const renderResult = (result: SpotlightResult, index: number, isSelected: boolean) => {
		return (
			<div className={isSelected ? "bg-blue-500" : ""}>
				<h3>{result.label}</h3>
				<p>{result.description}</p>
			</div>
		);
	};

	return (
		<SpotlightProvider renderResult={renderResult}>
			<YourApp />
		</SpotlightProvider>
	);
}
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable spotlight |
| `shortcuts` | `string[]` | `["/"]` | Keyboard shortcuts to trigger (e.g., `["/", "mod+k"]`) |
| `placeholder` | `string` | `"Search..."` | Input placeholder text |
| `emptyMessage` | `string` | `"No results found"` | Message when no results |
| `onSearch` | `(query: string) => Promise<SpotlightResult[]> \| SpotlightResult[]` | - | Custom search function |
| `renderResult` | `(result, index, isSelected) => ReactNode` | - | Custom result renderer |
| `maxResults` | `number` | `50` | Maximum number of results to display |

### Keyboard Shortcuts Format

- `/` - Single key
- `mod+k` - Modifier + key (Cmd/Ctrl + K)
- `shift+/` - Shift + key
- `alt+s` - Alt + key

## Styling

The component uses Tailwind CSS and automatically adapts to dark/light mode via the `dark:` variant. The background blur effect uses `backdrop-blur` with semi-transparent backgrounds.

## License

MIT
