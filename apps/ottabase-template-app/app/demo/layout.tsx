"use client";

import { ThemeProvider } from "./lib/themeContext";
import { DemoProviders } from "./components/DemoProviders";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DemoProviders>{children}</DemoProviders>
    </ThemeProvider>
  );
}
