import { useTheme } from '@/ottabase/providers/ThemeContext';
import { buildCSSVarMap, getThemeOrDefault, resolveTheme, THEME_PRESET_ITEMS } from '@ottabase/brand-engine';
import { OttaSelect, type OttaSelectItem } from '@ottabase/ottaselect';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Label,
} from '@ottabase/ui-shadcn';
import { useTheme as useNextTheme } from 'next-themes';
import { type CSSProperties, useMemo, useState } from 'react';

const stringifyTokenValue = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value === null || value === undefined) return '—';
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const hslToCss = (hsl: string): string => {
    const base = hsl.split('/')[0].trim();
    const parts = base
        .split(/\s+/)
        .map((v) => parseFloat(v))
        .filter((n) => !Number.isNaN(n));
    if (parts.length < 3) return 'hsl(221, 83%, 53%)';
    return `hsl(${parts[0]}, ${parts[1]}%, ${parts[2]}%)`;
};

export function ThemingDemoPage() {
    const { theme } = useTheme();
    const { setTheme: setMode, theme: mode, resolvedTheme } = useNextTheme();
    const activeMode = resolvedTheme || mode || 'light';
    const [localThemeName, setLocalThemeName] = useState(theme || 'default');

    const themePresetItems = useMemo(
        () =>
            THEME_PRESET_ITEMS.map((item) => ({
                id: item.id,
                name: item.name,
                colors: [...item.colors],
            })),
        [],
    );

    const selectedPresetItem = useMemo(
        () => themePresetItems.find((item) => item.id === localThemeName) ?? themePresetItems[0],
        [themePresetItems, localThemeName],
    );

    const previewResolved = useMemo(
        () =>
            resolveTheme({
                base: getThemeOrDefault(localThemeName || 'default'),
                mode: activeMode as 'light' | 'dark',
            }),
        [localThemeName, activeMode],
    );

    const previewVars = useMemo(() => buildCSSVarMap(previewResolved), [previewResolved]);

    return (
        <div
            className="space-y-theme-section animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={previewVars as CSSProperties}
        >
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Theming Configurator</h1>
                <p className="text-muted-foreground">
                    Theme is set by admin in Brand Engine. You can switch light/dark mode only.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Theme Switcher (Local Preview)</CardTitle>
                    <CardDescription>
                        Demo-only theme switcher, locally shows Brand Engine rendering below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <OttaSelect
                        mode="single"
                        items={themePresetItems}
                        value={selectedPresetItem ? ({ ...selectedPresetItem } as OttaSelectItem) : null}
                        onChange={(value) => {
                            const nextTheme = (value as OttaSelectItem | null)?.id || 'default';
                            setLocalThemeName(nextTheme);
                        }}
                        placeholder="Select theme preset"
                        searchable={false}
                        clearable={false}
                        renderItem={({ item }) => (
                            <div className="flex items-center gap-3 w-full">
                                <div className="flex items-center gap-1">
                                    {(((item as OttaSelectItem & { colors?: string[] }).colors as string[]) ?? [])
                                        .slice(0, 5)
                                        .map((color, index) => (
                                            <div
                                                key={`${item.id}-chip-${index}`}
                                                className="h-4 w-4 rounded border border-border"
                                                style={{ backgroundColor: hslToCss(color) }}
                                            />
                                        ))}
                                </div>
                                <span className="truncate font-medium">{item.name}</span>
                            </div>
                        )}
                        renderValue={(item) => (
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center gap-1 shrink-0">
                                    {(((item as OttaSelectItem & { colors?: string[] }).colors as string[]) ?? [])
                                        .slice(0, 5)
                                        .map((color, index) => (
                                            <div
                                                key={`selected-chip-${index}`}
                                                className="h-4 w-4 rounded border border-border"
                                                style={{ backgroundColor: hslToCss(color) }}
                                            />
                                        ))}
                                </div>
                                <span className="truncate font-medium">{(item as OttaSelectItem).name}</span>
                            </div>
                        )}
                        className="w-full"
                    />
                    <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Selected preset</span>
                        <span className="font-medium">{selectedPresetItem?.name ?? 'Default'}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-theme-card md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Active theme</CardTitle>
                        <CardDescription>App-level preset (admin-configured).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="font-mono text-sm capitalize">{theme || 'default'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mode</CardTitle>
                        <CardDescription>Light or Dark mode.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Button
                            variant={mode === 'light' ? 'default' : 'outline'}
                            onClick={() => setMode('light')}
                            className="w-full justify-start"
                        >
                            Light Mode
                        </Button>
                        <Button
                            variant={mode === 'dark' ? 'default' : 'outline'}
                            onClick={() => setMode('dark')}
                            className="w-full justify-start"
                        >
                            Dark Mode
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Typography Check</CardTitle>
                        <CardDescription>View local preview typography and spacing configuration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Heading:</span>
                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    {previewResolved?.typography?.heading?.fontFamily ?? '—'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Body:</span>
                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    {previewResolved?.typography?.body?.fontFamily ?? '—'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Cursive:</span>
                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    {previewResolved?.typography?.handwriting?.fontFamily ?? '—'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Vars:</span>
                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    H:{previewResolved?.typography?.heading?.fontFamily ?? '—'} / B:
                                    {previewResolved?.typography?.body?.fontFamily ?? '—'} / C:
                                    {previewResolved?.typography?.handwriting?.fontFamily ?? '—'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Radius:</span>
                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    {previewResolved?.radius ?? '—'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-16">Spacing:</span>
                                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                                    {previewResolved?.spacing?.section || 'N/A'} (Sec) /{' '}
                                    {previewResolved?.spacing?.card || 'N/A'} (Card)
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardContent className="space-y-4">
                        <div>
                            <h1 className="font-heading text-4xl font-extrabold lg:text-5xl">Heading 1</h1>
                            <h2 className="font-heading text-3xl font-semibold first:mt-0">Heading 2</h2>
                            <h3 className="font-heading text-2xl font-semibold">Heading 3</h3>
                            <p className="leading-7 [&:not(:first-child)]:mt-6">
                                The quick brown fox jumps over the lazy dog. This paragraph demonstrates the body font
                                readability and line height settings derived from the base design system.
                            </p>
                            <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
                                <p className="font-handwriting text-3xl text-primary">
                                    "Design is intelligence made visible."
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">- Handwriting Font Demo</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-theme-element py-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Color Palette</CardTitle>
                        <CardDescription>Full resolved semantic color tokens for the active mode.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(previewResolved?.colors ?? {}).map(([key, value]) => (
                                <div key={key} className="space-y-1.5">
                                    <div
                                        className="h-12 w-full rounded border ring-offset-background transition-shadow hover:ring-2 hover:ring-ring hover:ring-offset-2"
                                        style={{ backgroundColor: `hsl(${value})` }}
                                    />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium leading-none">{key}</p>
                                        <p className="text-xs text-muted-foreground">{value as string}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Brand Engine Tokens</CardTitle>
                        <CardDescription>
                            Expanded listing of spacing, shadows, motion, cursors, and typography.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-theme-card md:grid-cols-2">
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Spacing</p>
                            <div className="space-y-1">
                                {Object.entries(previewResolved?.spacing ?? {}).map(([key, value]) => (
                                    <div
                                        key={`spacing-${key}`}
                                        className="flex items-center justify-between gap-2 text-xs"
                                    >
                                        <span className="text-muted-foreground">{key}</span>
                                        <span className="font-mono">{stringifyTokenValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Shadows</p>
                            <div className="space-y-1">
                                {Object.entries(previewResolved?.shadows ?? {}).map(([key, value]) => (
                                    <div
                                        key={`shadow-${key}`}
                                        className="flex items-center justify-between gap-2 text-xs"
                                    >
                                        <span className="text-muted-foreground">{key}</span>
                                        <span className="font-mono text-right">{stringifyTokenValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Motion</p>
                            <div className="space-y-1">
                                {Object.entries(previewResolved?.motion ?? {}).map(([key, value]) => (
                                    <div
                                        key={`motion-${key}`}
                                        className="flex items-center justify-between gap-2 text-xs"
                                    >
                                        <span className="text-muted-foreground">{key}</span>
                                        <span className="font-mono">{stringifyTokenValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-medium">Cursors</p>
                            <div className="space-y-1">
                                {Object.entries(previewResolved?.cursors ?? {}).map(([key, value]) => (
                                    <div
                                        key={`cursor-${key}`}
                                        className="flex items-center justify-between gap-2 text-xs"
                                    >
                                        <span className="text-muted-foreground">{key}</span>
                                        <span className="font-mono">{stringifyTokenValue(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <p className="text-sm font-medium">Typography</p>
                            <pre className="w-full overflow-auto rounded bg-muted p-3 text-xs">
                                {JSON.stringify(previewResolved?.typography ?? {}, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-theme-card md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Component Samples</CardTitle>
                            <CardDescription>Inputs, buttons, and form controls.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input type="email" id="email" placeholder="Email" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button>Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Interactive</CardTitle>
                            <CardDescription>Hover states and focus rings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="h-10 w-10 rounded-full bg-primary animate-pulse" />
                                <div className="space-y-1">
                                    <div className="h-4 w-[200px] rounded bg-muted animate-pulse" />
                                    <div className="h-3 w-[150px] rounded bg-muted animate-pulse" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Action</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
