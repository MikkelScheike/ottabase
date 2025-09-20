"use client";

import { Radio, Group, Text, Badge, Button, Card, Stack } from "@mantine/core";
import { useTheme, ThemeOption } from "../lib/themeContext";

export function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value as ThemeOption);
  };

  const getThemeDescription = (theme: ThemeOption) => {
    switch (theme) {
      case "mantine-shadcn":
        return "Clean, minimal design inspired by ShadCN UI with neutral greys and subtle rounded corners";
      case "mantine-vercel":
        return "High-contrast black/white aesthetic inspired by Vercel with sharp, modern elements";
      case "mantine-ant":
        return "Professional enterprise design system with Ant Design's signature blue palette and structured layouts";
      case "mantine-stripe":
        return "Sophisticated fintech aesthetic with purple gradients, premium feel, and payment-optimized forms";
      case "app-override":
        return "Custom theme with brand colors, glass morphism effects, and app-specific component styling";
      default:
        return "Theme description";
    }
  };

  const getThemeBadgeColor = (theme: ThemeOption) => {
    switch (theme) {
      case "mantine-shadcn":
        return "gray";
      case "mantine-vercel":
        return "dark";
      case "mantine-ant":
        return "blue";
      case "mantine-stripe":
        return "violet";
      case "app-override":
        return "cyan";
      default:
        return "gray";
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="xs">
        <Text fw={600}>Mantine Theme</Text>
        <Badge
          color={getThemeBadgeColor(currentTheme)}
          variant="light"
          size="sm"
        >
          {availableThemes.find((t) => t.value === currentTheme)?.label}
        </Badge>
      </Group>

      <Radio.Group value={currentTheme} onChange={handleThemeChange} mb="sm">
        <Group gap="32px">
          {availableThemes.map((theme) => (
            <Radio
              key={theme.value}
              value={theme.value}
              label={theme.label}
              size="sm"
            />
          ))}
        </Group>
      </Radio.Group>

      <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
        {getThemeDescription(currentTheme)}
      </Text>

      {/* Theme Preview - Show some sample components */}
      <Card withBorder mt="md" p="sm">
        <Text size="sm" fw={600} mb="xs">
          Theme Preview
        </Text>
        <Stack gap="xs">
          <Group gap="xs">
            <Button size="xs" variant="filled">
              Filled Button
            </Button>
            <Button size="xs" variant="outline">
              Outline Button
            </Button>
            <Button size="xs" variant="light">
              Light Button
            </Button>
          </Group>
          <Group gap="xs">
            <Badge variant="filled" size="sm">
              Filled Badge
            </Badge>
            <Badge variant="outline" size="sm">
              Outline Badge
            </Badge>
            <Badge variant="light" size="sm">
              Light Badge
            </Badge>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
