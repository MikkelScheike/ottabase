import { Box, Title, Text, Button, Stack, Group } from "@mantine/core";
import { DarkModeToggle } from "@ottabase/ui-components/dark-mode-toggle";
import { APP_META } from "@/ottabase/config/app.config";
import Link from "next/link";

export default function HomePage() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--mantine-color-body)",
      }}
    >
      <Stack
        align="center"
        gap="xl"
        style={{ textAlign: "center", maxWidth: 600 }}
      >
        {/* Dark Mode Toggle in corner */}
        <Group
          justify="flex-end"
          style={{ position: "absolute", top: 20, right: 20 }}
        >
          <DarkModeToggle type="button" title="Toggle dark/light mode" />
        </Group>

        {/* Main Heading */}
        <Title
          order={1}
          size={64}
          fw={700}
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 16,
          }}
        >
          {APP_META.appName}
        </Title>

        {/* Description */}
        <Text
          size="xl"
          c="dimmed"
          style={{ lineHeight: 1.6, marginBottom: 32 }}
        >
          {APP_META.description}
        </Text>

        <Text size="lg" c="dimmed" style={{ lineHeight: 1.5 }}>
          A modern React app template built with <strong>Next.js</strong>,{" "}
          <strong>Mantine</strong>, <strong>TypeScript</strong>, and{" "}
          <strong>Tailwind CSS</strong>. Features theme switching, state
          management, and a scalable monorepo architecture.
        </Text>

        {/* Action Buttons */}
        <Group gap="md" style={{ marginTop: 32 }}>
          <Button
            component={Link}
            href="/demo"
            size="lg"
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              border: "none",
            }}
          >
            Kitchensink
          </Button>

          <Button
            variant="outline"
            size="lg"
            component="a"
            href="https://github.com/thinkdj/"
            target="_blank"
          >
            Homepage
          </Button>
        </Group>

        {/* Footer */}
        <Text size="sm" c="dimmed" style={{ marginTop: 64 }}>
          {APP_META.copyrightText}
        </Text>

        <Text size="xs" c="dimmed" style={{ marginTop: 8 }}>
          To create a new app from this template, simply delete the{" "}
          <code>/demo</code> directory and customize this landing page to match
          your project needs.
        </Text>
      </Stack>
    </Box>
  );
}
