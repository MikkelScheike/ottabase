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
 * A Mantine theme inspired by Vercel's homepage design language:
 * - High contrast black/white aesthetic
 * - Inter font with precise typography
 * - Minimal borders and shadows
 * - Clean geometric shapes
 * - Subtle gradients and modern spacing
 * - Vibrant accent colors used sparingly
 */
export const mantineVercel: MantineThemeOverride = {
    primaryColor: 'blue',
    primaryShade: 6,
    fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    headings: {
        fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        fontWeight: '700',
    },

    // Vercel-inspired color palette
    colors: {
        // Pure grayscale with high contrast
        dark: [
            '#ffffff', // pure white
            '#fafafa', // very light gray
            '#f5f5f5', // light gray
            '#e5e5e5', // medium light gray
            '#d4d4d4', // medium gray
            '#a3a3a3', // darker gray
            '#737373', // dark gray
            '#525252', // very dark gray
            '#262626', // almost black
            '#000000', // pure black
        ],
        gray: [
            '#ffffff', '#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4',
            '#a3a3a3', '#737373', '#525252', '#262626', '#000000',
        ],
        // Vercel's signature blue
        blue: [
            '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
            '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
        ],
        // Vercel's accent colors
        violet: [
            '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc',
            '#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#5b21b6',
        ],
        // Success/error colors with Vercel's palette
        green: [
            '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
            '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
        ],
        red: [
            '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171',
            '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
        ],
    },

    // Sharp, modern radii
    defaultRadius: 6,
    radius: {
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
    },

    // Precise spacing like Vercel
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },

    // Minimal shadows - Vercel uses very subtle or no shadows
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 25px 50px rgba(0, 0, 0, 0.15)',
    },

    // Component overrides for Vercel aesthetic
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
                size: 'md',
            },
            styles: (theme: any, params: any) => ({
                root: {
                    fontWeight: '500',
                    paddingLeft: theme.spacing.lg,
                    paddingRight: theme.spacing.lg,
                    height: 40,
                    border: 'none',
                    transition: 'all 0.2s ease',
                    letterSpacing: '-0.01em',
                },
                filled: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: '#262626',
                        transform: 'translateY(-1px)',
                    },
                },
                outline: {
                    border: `1px solid ${theme.colors.gray?.[3] ?? '#e5e5e5'}`,
                    backgroundColor: 'transparent',
                    color: '#000000',
                    '&:hover': {
                        backgroundColor: '#fafafa',
                        borderColor: '#000000',
                    },
                },
                light: {
                    backgroundColor: '#fafafa',
                    color: '#000000',
                    '&:hover': {
                        backgroundColor: '#f5f5f5',
                    },
                },
            }),
        },

        Card: {
            defaultProps: {
                radius: 'lg',
                padding: 'xl',
            } as { radius: string; padding: string },
            styles: (theme: any) => ({
                root: {
                    backgroundColor: '#ffffff',
                    border: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: theme.colors.gray?.[3] ?? '#e5e5e5',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                },
            }) as Record<string, React.CSSProperties>,
        },

        Paper: {
            styles: (theme: any) => ({
                root: {
                    backgroundColor: '#ffffff',
                    border: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                    boxShadow: 'none',
                    borderRadius: theme.radius.lg,
                },
            }) as Record<string, React.CSSProperties>,
        },

        TextInput: {
            defaultProps: {
                size: 'md',
            } as { size: string },
            styles: (theme: any) => ({
                input: {
                    height: 40,
                    borderRadius: theme.radius.md,
                    border: `1px solid ${theme.colors.gray?.[3] ?? '#e5e5e5'}`,
                    backgroundColor: '#ffffff',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                        borderColor: '#000000',
                        boxShadow: `0 0 0 1px #000000`,
                    },
                    '&::placeholder': {
                        color: theme.colors.gray?.[5] ?? '#a3a3a3',
                    },
                },
            }) as Record<string, React.CSSProperties>,
        },

        Textarea: {
            styles: (theme: any) => ({
                input: {
                    borderRadius: theme.radius.md,
                    border: `1px solid ${theme.colors.gray?.[3] ?? '#e5e5e5'}`,
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                        borderColor: '#000000',
                        boxShadow: `0 0 0 1px #000000`,
                    },
                },
            }) as Record<string, React.CSSProperties>,
        },

        Badge: {
            defaultProps: {
                radius: 'xl',
            } as { radius: string },
            styles: (theme: any) => ({
                root: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 500,
                    fontSize: '12px',
                    padding: '4px 12px',
                    letterSpacing: '0.01em',
                },
            }) as Record<string, React.CSSProperties>,
        },

        Modal: {
            defaultProps: {
                centered: true,
                radius: 'lg',
            } as { centered: boolean; radius: string },
            styles: (theme: any) => ({
                content: {
                    borderRadius: theme.radius.lg,
                    border: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                },
                header: {
                    borderBottom: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                    paddingBottom: theme.spacing.md,
                },
            }) as Record<string, React.CSSProperties>,
        },

        Navbar: {
            styles: (theme: any) => ({
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderRight: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                },
            }) as Record<string, React.CSSProperties>,
        },

        Header: {
            styles: (theme: any) => ({
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                },
            }) as Record<string, React.CSSProperties>,
        },

        Tooltip: {
            styles: (theme: any) => ({
                tooltip: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                },
            }) as Record<string, React.CSSProperties>,
        },

        Anchor: {
            styles: (theme: any) => ({
                root: {
                    color: '#000000',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        textDecoration: 'underline',
                        color: theme.colors.blue[6],
                    },
                },
            }) as Record<string, React.CSSProperties>,
        },

        // Vercel-style code blocks
        Code: {
            styles: (theme: any) => ({
                root: {
                    backgroundColor: '#fafafa',
                    color: '#000000',
                    border: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                    borderRadius: theme.radius.sm,
                    fontFamily: 'Menlo, Monaco, "Lucida Console", monospace',
                    fontSize: '13px',
                    padding: '2px 6px',
                },
            }) as Record<string, React.CSSProperties>,
        },

        // Modern tabs
        Tabs: {
            styles: (theme: any) => ({
                tab: {
                    fontWeight: 500,
                    color: theme.colors.gray?.[6] ?? '#737373',
                    border: 'none',
                    borderBottom: '2px solid transparent',
                    '&[data-active]': {
                        color: '#000000',
                        borderBottomColor: '#000000',
                    },
                    '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#000000',
                    },
                },
                tabsList: {
                    borderBottom: `1px solid ${theme.colors.gray?.[2] ?? '#f5f5f5'}`,
                },
            }) as Record<string, React.CSSProperties>,
        },
    },

    // Vercel-specific design tokens
    other: {
        vercelGradient: 'linear-gradient(to right, #000000, #262626)',
        vercelBlur: 'blur(12px)',
        vercelTransition: 'all 0.2s ease',
    },
};

export default mantineVercel;