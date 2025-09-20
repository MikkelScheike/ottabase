"use client";

import React, { ReactNode, useEffect } from "react";
// NextThemes Wrapper
import ProviderNextThemes from "./ProviderNextThemes";
// Font Provider
import ProviderFont, {
  headingFontFamily,
  monospaceFontFamily,
  primaryFontFamily,
} from "./ProviderFont";
// Mantine
import {
  MantineProvider,
  createTheme,
  MantineThemeOverride,
  MantineColorsTuple,
  localStorageColorSchemeManager,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
//import {SpotlightProvider} from '@mantine/spotlight';
import { Group, Text, Anchor, rem } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

/* CSS Reset & Ottabase UI Core global styles */
import "../styles/index.css";

/* Import Mantine CSS */
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";

import { mantineShadcn } from "../themes/mantine-shadcn";
import { mantineVercel } from "../themes/mantine-vercel";

interface ProvidersProps {
  children: ReactNode;
  // Configuration props
  storagePrefix?: string;
  preventFOUC?: boolean;
  preventFOUCInsideIframe?: boolean;
  themeColors?: Record<string, MantineColorsTuple>;
  primaryColor?: string;
  enforceGoogleFonts?: boolean;
  scale?: number;
  // Theme override - allows apps to provide their own complete theme
  themeOverride?: MantineThemeOverride;
}

export type ThemeColors = Record<string, MantineColorsTuple>;

const ProviderUI = ({
  children,
  storagePrefix = "ottabase",
  preventFOUC = false,
  preventFOUCInsideIframe = false,
  themeColors = {},
  primaryColor = "blue",
  enforceGoogleFonts = true,
  scale = 1.0,
  themeOverride,
}: ProvidersProps) => {
  const storageKeyTheme = `${storagePrefix}.color-scheme`;
  const colorSchemeManager = localStorageColorSchemeManager({
    key: storageKeyTheme,
  });

  const [isInsideIFRAME, setIsInsideIFRAME] = React.useState(false);

  useEffect(() => {
    setIsInsideIFRAME(window.self !== window.top);
  }, []);

  /* =============================================================== */
  /* Prevent Flash of Un-styled Content ? */
  const overlayElId = "cdc-blocking-overlay";

  useEffect(() => {
    const overlay = document.getElementById(overlayElId);
    if (overlay) overlay.style.display = "none";

    /* Delete the FOUC element after x seconds */
    const cleanupFOUC = () => {
      setTimeout(() => {
        const overlay = document.getElementById(overlayElId);
        if (overlay) overlay.remove();
      }, 5000);
    };

    window.addEventListener("load", cleanupFOUC);
    return () => window.removeEventListener("load", cleanupFOUC);
  }, []);
  /* =============================================================== */

  type ColorSchemeType = "light" | "dark" | "auto";

  /* Theme switch: save to local storage */
  const [colorScheme, setColorScheme] = useLocalStorage<ColorSchemeType>({
    key: storageKeyTheme,
    defaultValue: "light" as ColorSchemeType,
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorSchemeType) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const mantineDefaultTheme: MantineThemeOverride = {
    defaultRadius: "sm",
    colors: themeColors,
    primaryColor: primaryColor,
    scale: scale,
    focusRing: "auto",
    fontSmoothing: true,
    respectReducedMotion: true,
    autoContrast: true,
    luminanceThreshold: 0.35, // https://mantine.dev/theming/theme-object/#luminancethreshold
    cursorType: "pointer", // For interactive elements
    fontFamily: primaryFontFamily.style.fontFamily,
    fontFamilyMonospace: monospaceFontFamily.style.fontFamily,
    headings: { fontFamily: headingFontFamily.style.fontFamily },
    fontSizes: {
      xs: rem(12),
      sm: rem(14),
      md: rem(16),
      lg: rem(18),
      xl: rem(20),
      xxl: rem(28),
    },
  };

  // Use theme override if provided, otherwise use the default theme
  const finalTheme = themeOverride ? themeOverride : mantineDefaultTheme;
  const mantineTheme = createTheme(finalTheme);

  return (
    <ProviderFont enforceGoogleFonts={enforceGoogleFonts}>
      <MantineProvider
        colorSchemeManager={colorSchemeManager}
        withCssVariables={true}
        deduplicateCssVariables={true}
        classNamesPrefix="cdc-mt"
        withStaticClasses={false} // Static class = cdc-mtn-Button-inner | Dynamic class = m-a25b86ee
        theme={mantineTheme}
      >
        {/* Modals manager */}
        <ModalsProvider>
          {/*<SpotlightProvider shortcut={['mod + K', '/']}
										   transitionProps={{duration: 128}} actions={[]}
										   actionsWrapperComponent={ActionsWrapper}
						>*/}
          <ProviderNextThemes storagePrefix={storagePrefix}>
            {children}
          </ProviderNextThemes>
          {/*</SpotlightProvider>*/}
        </ModalsProvider>
        {/* Notifications system */}
        <Notifications position="top-right" limit={5} zIndex={10010} />
        {/* Blocking overlay */}
        {preventFOUC || preventFOUCInsideIframe ? (
          <div
            id="cdc-blocking-overlay"
            style={{
              position: "fixed",
              width: "100vw",
              height: "100vh",
              top: 0,
              left: 0,
              backgroundColor: "rgba(255,255,255,0.98)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Loading ...
          </div>
        ) : (
          <></>
        )}
      </MantineProvider>
    </ProviderFont>
  );
};

// Spotlight actions wrapper
function ActionsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <Group
      //position="apart"
      //px={15}
      //py="xs"
      //sx={(theme) => ({
      //	borderTop: `${rem(1)} solid ${
      //		theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      //	}`,
      //})
      //}
      >
        <Text size="xs" c="dimmed">
          Looking for detailed search?
        </Text>
        <Anchor size="xs" href="#">
          Advanced search
        </Anchor>
      </Group>
    </div>
  );
}

export default ProviderUI;
