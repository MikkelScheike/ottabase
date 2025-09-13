// Main exports for the UI package
export { default as ProviderUI } from '../provider/ProviderUI';
export { default as NextThemesWrapper } from '../provider/NextThemesWrapper';
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