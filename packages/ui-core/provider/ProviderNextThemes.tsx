"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface NextThemesWrapperProps {
  children: ReactNode;
  storagePrefix?: string;
}

const ProviderNextThemes = ({
  children,
  storagePrefix = "ottabase",
}: NextThemesWrapperProps) => {
  const storageKeyTheme = `${storagePrefix}.color-scheme`;
  const [initialTheme, setInitialTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKeyTheme) ?? "light";
    const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setInitialTheme(storedTheme ?? systemTheme);
  }, [storageKeyTheme]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={initialTheme}
      enableSystem
      disableTransitionOnChange={true}
    >
      {children}
    </NextThemesProvider>
  );
};

export default ProviderNextThemes;
