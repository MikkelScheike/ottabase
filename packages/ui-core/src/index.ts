// Main exports for the UI package
export { default as ProviderUI } from '../provider/ProviderUI';
export { default as ProviderNextThemes } from '../provider/ProviderNextThemes';
export { default as ProviderFont } from '../provider/ProviderFont';

// Re-export font families
export {
  primaryFontFamily,
  headingFontFamily,
  monospaceFontFamily,
  handwritingFontFamily
} from '../provider/ProviderFont';

// Re-export types
export type { ThemeColors } from '../provider/ProviderUI';

// Export themes
export { default as mantineShadcn } from '../themes/mantine-shadcn';
export { default as mantineVercel } from '../themes/mantine-vercel';
export { default as mantineAnt } from '../themes/mantine-ant';
export { default as mantineStripe } from '../themes/mantine-stripe';

// Export theme configuration utilities
export type { MantineThemeConfig } from './themeConfig';
export { createMantineTheme, validateMantineThemeConfig } from './themeConfig';