import { createRequire } from "node:module";
import fs from "node:fs";
import path, { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-webpack5";
import { resolveStorybookEntries } from "./story-sources";

const require = createRequire(import.meta.url);

const { stories, staticDirs, scope } = resolveStorybookEntries();

const projectRoot = path.resolve(__dirname, "..");
const storybookPostCssConfig = path.resolve(__dirname, "postcss.config.cjs");
const storybookTailwindConfig = path.resolve(__dirname, "tailwind.config.cjs");
const defaultTailwindConfig = path.resolve(
  projectRoot,
  "apps/ottabase-template-app/tailwind.config.cjs",
);

// Use Storybook-specific Tailwind config by default
if (!process.env.TAILWIND_CONFIG) {
  process.env.TAILWIND_CONFIG = storybookTailwindConfig;
}

if (process.env.DEBUG || process.env.STORYBOOK_DEBUG_SCOPE) {
  // eslint-disable-next-line no-console
  console.info(
    "[storybook] packages:",
    scope.selectedPackages.map((pkg) => pkg.dirName).join(", ") || "none",
  );
  // eslint-disable-next-line no-console
  console.info(
    "[storybook] apps:",
    scope.selectedApps.map((app) => app.dirName).join(", ") || "none",
  );
  // eslint-disable-next-line no-console
  console.info(
    '[storybook] primary app alias "@":',
    scope.primaryApp ? scope.primaryApp.dirName : "unset",
  );
}

const config: StorybookConfig = {
  stories,
  staticDirs,
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    {
      name: getAbsolutePath("@storybook/addon-styling-webpack"),
      options: {
        rules: [
          {
            test: /\.css$/,
            sideEffects: true,
            use: [
              require.resolve("style-loader"),
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  postcssOptions: {
                    config: storybookPostCssConfig,
                  },
                },
              },
            ],
          },
        ],
      },
    },
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },
  docs: {
    defaultName: "Documentation",
  },
  typescript: {
    check: false,
  },
  core: {
    disableTelemetry: true,
  },
  async webpackFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias ?? {}) };

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: false,
      buffer: false,
    };

    // Add simple process polyfill using DefinePlugin
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require("webpack").DefinePlugin)({
        "process.env": JSON.stringify({}),
        "process.browser": JSON.stringify(true),
        "process.version": JSON.stringify(""),
        "process.platform": JSON.stringify("browser"),
      }),
    );

    if (scope.primaryApp) {
      config.resolve.alias["@"] = scope.primaryApp.root;
    }

    const nextFontMock = path.resolve(__dirname, "./next-font-mock.js");
    config.resolve.alias["next/font/google"] = nextFontMock;
    config.resolve.alias["next/font/local"] = nextFontMock;

    scope.selectedApps.forEach((app) => {
      const aliasKey = `@apps/${app.dirName}`;
      if (!config.resolve.alias[aliasKey]) {
        config.resolve.alias[aliasKey] = app.root;
      }
    });

    const workspaceAliases: Record<string, string> = {
      "@ottabase/ui-core": path.resolve(projectRoot, "packages/ui-core/src"),
      "@ottabase/ui-core/styles": path.resolve(
        projectRoot,
        "packages/ui-core/styles",
      ),
      "@ottabase/ui-core/themes": path.resolve(
        projectRoot,
        "packages/ui-core/themes",
      ),
      "@ottabase/ui-core/provider": path.resolve(
        projectRoot,
        "packages/ui-core/provider",
      ),
      "@ottabase/ui-components": path.resolve(
        projectRoot,
        "packages/ui-components/src",
      ),
      "@ottabase/config": path.resolve(projectRoot, "packages/config/src"),
      "@ottabase/state": path.resolve(projectRoot, "packages/state/src"),
      "@ottabase/hello-world": path.resolve(
        projectRoot,
        "packages/hello-world/src",
      ),
      "@ottabase/ui-code-highlight": path.resolve(
        projectRoot,
        "packages/ui-code-highlight/src",
      ),
      "@ottabase/ui-tailwind": path.resolve(
        projectRoot,
        "packages/ui-tailwind/src",
      ),
      "@ottabase/ui-tailwind/styles": path.resolve(
        projectRoot,
        "packages/ui-tailwind/styles",
      ),
      "@ottabase/core-auth": path.resolve(
        projectRoot,
        "packages/core-auth/src",
      ),
      "@ottabase/core-prisma": path.resolve(
        projectRoot,
        "packages/core-prisma/src",
      ),
    };

    config.resolve.alias["@ottabase/ui-tailwind/styles/tailwind.base.css"] =
      path.resolve(
        projectRoot,
        "packages/ui-tailwind/styles/tailwind.base.css",
      );
    Object.entries(workspaceAliases).forEach(([key, value]) => {
      if (!config.resolve.alias[key]) {
        config.resolve.alias[key] = value;
      }
    });

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    config.module.rules.forEach((rule) => {
      const uses = Array.isArray(rule.use)
        ? rule.use
        : rule.use
        ? [rule.use]
        : [];

      uses.forEach((useEntry) => {
        if (
          useEntry &&
          typeof useEntry === "object" &&
          "loader" in useEntry &&
          typeof useEntry.loader === "string" &&
          useEntry.loader.includes("postcss-loader")
        ) {
          useEntry.options = {
            ...(useEntry.options || {}),
            postcssOptions: {
              ...(useEntry.options?.postcssOptions || {}),
              config: storybookPostCssConfig,
            },
          };
        }
      });
    });

    config.module.rules.push({
      test: /\.[jt]sx?$/,
      include: [
        path.resolve(projectRoot, "packages"),
        path.resolve(projectRoot, "apps"),
        __dirname,
      ],
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [
              require.resolve("@babel/preset-env"),
              [
                require.resolve("@babel/preset-react"),
                { runtime: "automatic" },
              ],
              require.resolve("@babel/preset-typescript"),
            ],
          },
        },
      ],
    });

    scope.selectedPackages.forEach((pkg) => {
      const aliasKey = `@packages/${pkg.dirName}`;
      if (!config.resolve.alias[aliasKey]) {
        config.resolve.alias[aliasKey] = pkg.root;
      }
    });

    config.resolve.extensions = Array.from(
      new Set([
        ...(config.resolve.extensions ?? []),
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
      ]),
    );

    config.stats = {
      ...(config.stats ?? {}),
      children: true,
      errorDetails: true,
    };

    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
