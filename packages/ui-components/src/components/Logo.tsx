import React from "react";
import Link from "next/link";
import { Flex, Group, Title, Image } from "@mantine/core";
import DarkModeToggle from "./DarkModeToggle";
import { createAppConfig } from "@ottabase/config";

interface LogoProps {
  size?: number;
  darkModeSwitcher?: boolean;
  logoUrl?: string;
  appName?: string;
  linkUrl?: string;
  /** Optional app config - if not provided, will create default config */
  appConfig?: ReturnType<typeof createAppConfig>;
}

const defaultSizePx = 32;

// Pass a space " " for no appName (logo only)
export const Logo: React.FC<LogoProps> = ({
  size = defaultSizePx,
  darkModeSwitcher = false,
  logoUrl,
  appName,
  linkUrl = "",
  appConfig,
}) => {
  // Create default config if none provided
  const config = appConfig || createAppConfig();

  const minWidthPx = appName && appName?.length > 10 ? 279 : 100;

  const appLogoUrl = logoUrl || config.meta.logoUrl; // relative path `/logo.png` would be in `public` folder during dev;
  const appNameTitle = appName || config.meta.appName;

  const renderDarkModeToggle = () =>
    darkModeSwitcher && <DarkModeToggle type="button" />;

  return (
    <Flex
      justify="space-between"
      align="center"
      direction="row"
      wrap="nowrap"
      gap="4"
      style={{ minWidth: minWidthPx }}
    >
      <Group p="xs">
        {linkUrl ? (
          <Link href={linkUrl} className="flex items-center gap-3">
            {appLogoUrl && (
              <Image
                src={appLogoUrl}
                alt={`${appNameTitle}`}
                h={size}
                w={"auto"}
                fit="contain"
                radius={4}
              />
            )}
            {appNameTitle && <Title order={4}>{appNameTitle}</Title>}
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            {appLogoUrl && (
              <Image
                src={appLogoUrl}
                alt={`${appNameTitle}`}
                h={size}
                w={"auto"}
                fit="contain"
                radius={4}
              />
            )}
            {appNameTitle && <Title order={4}>{appNameTitle}</Title>}
          </div>
        )}
      </Group>
      {renderDarkModeToggle()}
    </Flex>
  );
};

export default Logo;
