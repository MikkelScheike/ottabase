"use client";

import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { ActionIcon, rem, Switch, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useEffect } from "react";
import { useTheme } from "next-themes";

type DarkModeToggleProps = {
    type: 'toggle-switch' | 'button';
    title?: string;
};

const DarkModeToggle = (props: DarkModeToggleProps) => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme({
        keepTransitions: false,
    });

    const isDarkMode = colorScheme === 'dark';
    const mantineTheme = useMantineTheme();

    const { type, title = "Toggle color scheme" } = props;

    // Tailwind Dark Mode
    const { setTheme: setTailwindTheme } = useTheme();
    useEffect(() => {
        if (!colorScheme) return;
        setTailwindTheme((colorScheme === 'dark') ? 'dark' : 'light')
    }, [colorScheme, setTailwindTheme]);

    return (
        type === 'toggle-switch' ?
            <Switch
                size="md"
                color={isDarkMode ? 'gray' : '#dedede'}
                onClick={toggleColorScheme}
                onLabel={<IconSun size={rem('16px')} stroke={2.5} />} // light
                offLabel={<IconMoonStars size={rem('16px')} stroke={2.5} />} // dark
            />
            :
            <ActionIcon
                variant="light"
                size="md"
                color={isDarkMode ? 'yellow' : 'gray'}
                onClick={toggleColorScheme}
                title={title}
            >
                {isDarkMode ? <IconSun size={rem('16px')} /> : <IconMoonStars size={rem('16px')} />}
            </ActionIcon>
    )
}

export default DarkModeToggle;