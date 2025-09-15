import type { MantineThemeOverride, MantineTheme } from '@mantine/core';

/**
 * Helper function to create rgba from hex color
 */
const rgba = (color: string, alpha: number): string => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * A Mantine theme that approximates the modern ShadCN-like design language:
 * - neutral, low-contrast greys
 * - Inter font
 * - subtle rounded corners (8px default)
 * - minimal shadows
 * - clean, flat components with light borders
 * - component-specific overrides for Button, Card, Input, Badge, Modal
 */
export const mantineShadcn: MantineThemeOverride = {
    primaryColor: 'blue',
    primaryShade: 6,
    fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    headings: {
        fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        fontWeight: '600',
    },

    // tokens
    colors: {
        // soft neutral palette inspired by tailwind gray / shadcn
        dark: [
            '#f8fafc', // not used directly, present for theme completeness
            '#f1f5f9',
            '#e2e8f0',
            '#cbd5e1',
            '#94a3b8',
            '#64748b',
            '#475569',
            '#334155',
            '#1f2937',
            '#0f172a',
        ],
        gray: [
            '#fbfdfe', '#f8fafc', '#f1f5f9', '#e6eef6', '#cfd8e3',
            '#9aa6b2', '#6b7280', '#4b5563', '#374151', '#111827',
        ],
        blue: [
            '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
            '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
        ],
        violet: [
            '#f5f3ff', '#efe7ff', '#e6d9ff', '#d3b9ff', '#c08aff',
            '#9b4dff', '#7a3bdb', '#5d2f9b', '#3b2266', '#1b1636',
        ],
        // keep Mantine's other palettes intact (apps can extend)
    },

    // radii / spacing / shadows
    defaultRadius: 8,
    radius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
    },
    spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
    },

    // subtle, soft shadows similar to modern card shadows
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.02)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
        md: '0 4px 6px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.08)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.10)',
    },

    // component styles (keeps defaults but nudges things to the shadcn look)
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
            styles: (theme: MantineTheme, params: any) => ({
                root: {
                    fontWeight: '600',
                    paddingLeft: theme.spacing.md,
                    paddingRight: theme.spacing.md,
                    height: 44,
                    border: 'none',
                    // remove shadow for cleaner look
                    // subtle letter spacing like shadcn
                    letterSpacing: '0.2px',
                },
                outline: {
                    border: `1px solid ${theme.colors.gray?.[3] ?? '#d1d5db'}`,
                    backgroundColor: 'transparent',
                    color: theme.black,
                    '&:hover': {
                        backgroundColor: theme.colors.gray?.[1] ?? '#f9fafb',
                    },
                },
                filled: {
                    backgroundColor: theme.colors.blue[6],
                    '&:hover': {
                        backgroundColor: theme.colors.blue[7],
                    },
                },
            }),
        },

        Card: {
            defaultProps: {
                radius: 'md',
                padding: 'md',
            } as { radius: string; padding: string },
            styles: (theme: MantineTheme) => ({
                root: {
                    backgroundColor: 'var(--mantine-color-body)',
                    border: `1px solid var(--mantine-color-default-border)`,
                    boxShadow: 'none',
                },
            }) as Record<string, React.CSSProperties>,
        },

        Paper: {
            styles: (theme: MantineTheme) => ({
                root: {
                    backgroundColor: 'var(--mantine-color-body)',
                    border: `1px solid var(--mantine-color-default-border)`,
                    boxShadow: 'none',
                    borderRadius: theme.radius.md,
                },
            }) as Record<string, React.CSSProperties>,
        },

        TextInput: {
            defaultProps: {
                size: 'md',
            } as { size: string },
            styles: (theme: MantineTheme) => ({
                input: {
                    height: 44,
                    borderRadius: theme.radius.md,
                    border: `1px solid var(--mantine-color-default-border)`,
                    backgroundColor: 'var(--mantine-color-body)',
                    '&:focus': {
                        borderColor: theme.colors.blue[6],
                        boxShadow: `0 0 0 1px ${rgba(theme.colors.blue[6], 0.1)}`,
                    },
                },
            }) as Record<string, React.CSSProperties>,
        },

        Textarea: {
            styles: (theme: MantineTheme) => ({
                input: {
                    borderRadius: theme.radius.md,
                    border: `1px solid var(--mantine-color-default-border)`,
                    backgroundColor: 'var(--mantine-color-body)',
                },
            }) as Record<string, React.CSSProperties>,
        },

        Badge: {
            defaultProps: {
                radius: 'sm',
            } as { radius: string },
            styles: (theme: MantineTheme) => ({
                root: {
                    backgroundColor: 'var(--mantine-color-default)',
                    color: 'var(--mantine-color-text)',
                    border: `1px solid var(--mantine-color-default-border)`,
                    fontWeight: 600,
                    padding: '4px 8px',
                },
            }) as Record<string, React.CSSProperties>,
        },

        Modal: {
            defaultProps: {
                centered: true,
                radius: 'md',
            } as { centered: boolean; radius: string },
            styles: (theme: MantineTheme) => ({
                content: {
                    borderRadius: theme.radius.md,
                    border: `1px solid var(--mantine-color-default-border)`,
                    backgroundColor: 'var(--mantine-color-body)',
                    boxShadow: theme.shadows.md,
                },
            }) as Record<string, React.CSSProperties>,
        },

        Navbar: {
            styles: (theme: MantineTheme) => ({
                root: {
                    backgroundColor: 'transparent',
                    borderRight: `1px solid var(--mantine-color-default-border)`,
                },
            }) as Record<string, React.CSSProperties>,
        },

        Tooltip: {
            styles: (theme: MantineTheme) => ({
                tooltip: {
                    backgroundColor: 'var(--mantine-color-text)',
                    color: 'var(--mantine-color-body)',
                    borderRadius: 8,
                    fontSize: 13,
                },
            }) as Record<string, React.CSSProperties>,
        },

        // small helper: make links look like shadcn
        Anchor: {
            styles: (
                theme: MantineTheme,
            ) => ({
                root: {
                    color: theme.colors?.blue?.[6] ?? '#2563eb',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                },
            }) as Record<string, React.CSSProperties>,
        },
    },

    // small utilities
    other: {
        // you can attach design-system tokens here if you want
    },
};

export default mantineShadcn;
