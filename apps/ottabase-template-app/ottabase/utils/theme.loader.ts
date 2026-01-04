import { ThemeConfig } from '../config/theme.types';
import defaultTheme from '../config/themes/default.json';
import neoTheme from '../config/themes/neo.json';
import crispTheme from '../config/themes/crisp.json';
import funkyTheme from '../config/themes/funky.json';

// Registry of available themes
const themes: Record<string, ThemeConfig> = {
    default: defaultTheme as ThemeConfig,
    neo: neoTheme as ThemeConfig,
    crisp: crispTheme as ThemeConfig,
    funky: funkyTheme as ThemeConfig,
};

export const getAvailableThemes = () => Object.keys(themes);

export const getTheme = (themeName: string): ThemeConfig => {
    return themes[themeName] || themes['default'];
};

const injectFont = (url: string) => {
    if (typeof document !== 'undefined' && !document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement('link');
        link.href = url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
};

const setCSSVariable = (property: string, value: string) => {
    if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty(property, value);
    }
};

export const applyTheme = (themeName: string, mode: 'light' | 'dark' = 'light') => {
    const theme = getTheme(themeName);
    console.log(`Applying theme: ${themeName}`, theme);

    // 1. Apply Typography
    if (theme.typography.heading.url) {
        injectFont(theme.typography.heading.url);
    }
    if (theme.typography.body.url && theme.typography.body.url !== theme.typography.heading.url) {
        injectFont(theme.typography.body.url);
    }
    if (theme.typography.handwriting.url) {
        injectFont(theme.typography.handwriting.url);
    }
    setCSSVariable('--font-heading', theme.typography.heading.fontFamily);
    setCSSVariable('--font-body', theme.typography.body.fontFamily);
    setCSSVariable('--font-handwriting', theme.typography.handwriting.fontFamily);

    // 2. Apply Colors
    const colors = theme.colors[mode];
    Object.entries(colors).forEach(([key, value]) => {
        setCSSVariable(`--${key}`, value);
    });

    // 3. Apply Radius
    if (theme.radius) {
        setCSSVariable('--radius', theme.radius);
    }

    // 4. Apply Spacing (if any custom spacing overrides exist)
    if (theme.spacing) {
        Object.entries(theme.spacing).forEach(([key, value]) => {
            setCSSVariable(`--spacing-${key}`, value);
        });
    }
};
