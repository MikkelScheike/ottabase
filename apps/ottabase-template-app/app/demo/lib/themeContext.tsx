"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { MantineThemeOverride } from "@mantine/core";
import {
  createMantineTheme,
  mantineShadcn,
  mantineVercel,
  mantineAnt,
  mantineStripe,
} from "@ottabase/ui-mantine";
import { mantineThemeConfig } from "@/ottabase/config/theme.mantine";

// Available theme options
export type ThemeOption =
  | "mantine-shadcn"
  | "mantine-vercel"
  | "mantine-ant"
  | "mantine-stripe"
  | "app-override";

export interface ThemeContextValue {
  currentTheme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  currentMantineTheme: MantineThemeOverride;
  availableThemes: { value: ThemeOption; label: string }[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Map of available base themes
const BASE_THEMES = {
  "mantine-shadcn": mantineShadcn,
  "mantine-vercel": mantineVercel,
  "mantine-ant": mantineAnt,
  "mantine-stripe": mantineStripe,
} as const;

// Available theme options for dropdown
const THEME_OPTIONS = [
  { value: "mantine-shadcn" as ThemeOption, label: "Mantine ShadCN" },
  { value: "mantine-vercel" as ThemeOption, label: "Mantine Vercel" },
  { value: "mantine-ant" as ThemeOption, label: "Mantine Ant Design" },
  { value: "mantine-stripe" as ThemeOption, label: "Mantine Stripe" },
  { value: "app-override" as ThemeOption, label: "App Override (Custom)" },
];

/**
 * Get the base theme by name
 */
function getBaseTheme(themeName: string) {
  if (themeName in BASE_THEMES) {
    return BASE_THEMES[themeName as keyof typeof BASE_THEMES];
  }

  // Fallback to shadcn theme if theme not found
  console.warn(
    `Theme "${themeName}" not found, falling back to mantine-shadcn`,
  );
  return BASE_THEMES["mantine-shadcn"];
}

/**
 * Get the Mantine theme based on the selected option
 */
function getMantineTheme(themeOption: ThemeOption): MantineThemeOverride {
  switch (themeOption) {
    case "mantine-shadcn":
      return mantineShadcn;
    case "mantine-vercel":
      return mantineVercel;
    case "mantine-ant":
      return mantineAnt;
    case "mantine-stripe":
      return mantineStripe;
    case "app-override":
      return createMantineTheme(
        mantineThemeConfig,
        getBaseTheme(mantineThemeConfig.baseTheme),
      );
    default:
      return mantineShadcn;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>("app-override");

  const currentMantineTheme = getMantineTheme(currentTheme);

  const contextValue: ThemeContextValue = {
    currentTheme,
    setTheme: setCurrentTheme,
    currentMantineTheme,
    availableThemes: THEME_OPTIONS,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
