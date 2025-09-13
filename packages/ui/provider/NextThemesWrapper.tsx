"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface NextThemesWrapperProps {
    children: ReactNode;
    storagePrefix?: string;
}

const NextThemesWrapper = ({ children, storagePrefix = 'ottabase' }: NextThemesWrapperProps) => {
    const storageKeyTheme = `${storagePrefix}.color-scheme`;
    const [isInsideIFRAME, setIsInsideIFRAME] = useState(false);
    const [initialTheme, setInitialTheme] = useState('light');

    useEffect(() => {
        setIsInsideIFRAME(window.self !== window.top);
        const storedTheme = localStorage.getItem(storageKeyTheme) ?? 'light';
        const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

export default NextThemesWrapper;
