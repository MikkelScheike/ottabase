import {
  CoreSchemaName,
  PrismaConfig,
  PrismaProvider,
} from "@ottabase/db/prisma";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Complete path patterns for easy developer reference
const OTTABASE_SCHEMAS_DIR = "packages/db/prisma/schemas";
const DEFAULT_APP_SCHEMA_PATH = "ottabase/prisma/app.schema.prisma";
const PRISMA_CONFIG_PATH = "ottabase/prisma/prisma.config.js";
const DEFAULT_OUTPUT_SCHEMA_PATH = "prisma/schema.prisma";

// Path construction helpers
const getOttabasePrismaDir = (cwd: string) =>
  path.join(cwd, "ottabase", "prisma");
const getPrismaConfigPath = (cwd: string) => path.join(cwd, PRISMA_CONFIG_PATH);
const getAppSchemaPath = (cwd: string, customPath?: string) =>
  path.join(cwd, customPath || DEFAULT_APP_SCHEMA_PATH);
const getOutputSchemaPath = (cwd: string, customPath?: string) =>
  path.join(cwd, customPath || DEFAULT_OUTPUT_SCHEMA_PATH);

const generateBaseSchema = (
  provider: PrismaProvider = "postgresql",
  dbUrlEnvVar: string = "DATABASE_URL",
  clientProvider: string = "prisma-client-js",
): string => {
  return `generator client {
  provider = "${clientProvider}"
}

datasource db {
  provider = "${provider}"
  url      = env("${dbUrlEnvVar}")
}`;
};

// Modular schemas directory fallback paths
const getModularSchemasDirPaths = (cwd: string) => [
  // From app directory: ../../packages/db/prisma/schemas
  path.join(cwd, "..", "..", OTTABASE_SCHEMAS_DIR),
  // From root directory: packages/db/prisma/schemas
  path.join(cwd, OTTABASE_SCHEMAS_DIR),
  // From packages directory: ../db/prisma/schemas
  path.join(cwd, "..", "db", "prisma", "schemas"),
];

const loadConfig = async (configPath: string): Promise<PrismaConfig> => {
  // Try both .js and .ts extensions
  const jsConfigPath = configPath;
  const tsConfigPath = configPath.replace(".js", ".ts");

  let actualConfigPath = "";
  if (existsSync(jsConfigPath)) {
    actualConfigPath = jsConfigPath;
  } else if (existsSync(tsConfigPath)) {
    actualConfigPath = tsConfigPath;
  } else {
    console.log("⚠️  No config file found, using defaults");
    return {};
  }

  console.log(`📄 Loading config from: ${actualConfigPath}`);

  // Simple require-based loading for .js/.ts files or default config
  try {
    // For TypeScript files, we need to use ts-node or similar
    // For now, try to require and handle errors gracefully
    delete require.cache[require.resolve(actualConfigPath)];
    const config = require(actualConfigPath);
    const loadedConfig = config.default || config;
    console.log(`✅ Config loaded:`, JSON.stringify(loadedConfig, null, 2));
    return loadedConfig;
  } catch (error) {
    console.warn(`⚠️  Failed to load config: ${(error as Error).message}`);
    console.log("Using default configuration");
    return {};
  }
};

const getModularSchemasDir = (): string => {
  // Find the @ottabase/db package and get its schemas directory
  try {
    const dbPackagePath = require.resolve("@ottabase/db/package.json");
    const dbDir = path.dirname(dbPackagePath);
    return path.join(dbDir, "prisma", "schemas");
  } catch {
    // Fallback: try to find it in the monorepo structure
    const cwd = process.cwd();
    const possiblePaths = getModularSchemasDirPaths(cwd);

    for (const schemasDir of possiblePaths) {
      if (existsSync(schemasDir)) {
        return schemasDir;
      }
    }

    throw new Error(
      "Could not find @ottabase/db schemas directory. Make sure @ottabase/db is installed.",
    );
  }
};

const readModularSchema = async (
  schemaName: CoreSchemaName,
): Promise<string> => {
  const schemasDir = getModularSchemasDir();
  const schemaPath = path.join(schemasDir, `${schemaName}.schema.prisma`);

  if (!existsSync(schemaPath)) {
    throw new Error(
      `Core schema "${schemaName}" not found at ${schemaPath}. Check available schemas in ${schemasDir}.`,
    );
  }

  return await readFile(schemaPath, "utf8");
};

const runPrismaGenerate = async (
  schemaPath: string,
  cwd: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["prisma", "generate", "--schema", schemaPath], {
      cwd,
      stdio: "inherit",
      shell: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prisma generate exited with code ${code}`));
      }
    });
  });
};

export const concatenatePrismaSchema = async (
  cwd: string = process.cwd(),
): Promise<void> => {
  const prismaDir = getOttabasePrismaDir(cwd);
  const configPath = getPrismaConfigPath(cwd);

  // Load configuration
  const config = await loadConfig(configPath);

  // Define paths
  const appSchemaPath = getAppSchemaPath(cwd, config.appSchemaPath);
  const outputSchemaPath = getOutputSchemaPath(cwd, config.outputSchemaPath);

  const schemas: string[] = [];

  // Use modular schemas approach
  if (config.coreSchemas && config.coreSchemas.length > 0) {
    console.log("📦 Using modular core schemas:", config.coreSchemas);

    // Add base configuration with configurable provider
    const provider = config.provider || "postgresql";
    const baseSchema = generateBaseSchema(provider);
    schemas.push(`// ---- Base Configuration ----\n${baseSchema.trim()}`);

    // Add selected core schemas
    for (const schemaName of config.coreSchemas!) {
      try {
        const schemaContent = await readModularSchema(schemaName);
        schemas.push(
          `// ---- Core Schema: ${schemaName} ----\n${schemaContent.trim()}`,
        );
      } catch (error) {
        console.error(
          `Error loading core schema "${schemaName}":`,
          (error as Error).message,
        );
        throw error;
      }
    }
  } else {
    // No core schemas - just use base configuration
    console.log("📦 No core schemas selected, using base configuration only");
    const provider = config.provider || "postgresql";
    const baseSchema = generateBaseSchema(provider);
    schemas.push(`// ---- Base Configuration ----\n${baseSchema.trim()}`);
  }

  // Add app schema if it exists
  if (existsSync(appSchemaPath)) {
    const appSchema = await readFile(appSchemaPath, "utf8");
    schemas.push(`// ---- App Schema ----\n${appSchema.trim()}`);
  }

  if (schemas.length === 0) {
    throw new Error("No schemas found to concatenate");
  }

  // Create combined schema
  const timestamp = new Date().toLocaleString();
  const header =
    "// This file is auto-generated by @ottabase/scripts\n// Do not edit this file directly\n" +
    `// Script generated at: ${timestamp}\n`;
  const combinedSchema = header + "\n" + schemas.join("\n\n") + "\n";

  // Ensure output directory exists
  const outputDir = path.dirname(outputSchemaPath);
  await mkdir(outputDir, { recursive: true });

  // Write combined schema
  await writeFile(outputSchemaPath, combinedSchema, "utf8");

  console.log(`✅ Generated schema at ${outputSchemaPath}`);

  // Run prisma generate
  await runPrismaGenerate(outputSchemaPath, cwd);

  console.log("✅ Prisma client generated successfully");
};
