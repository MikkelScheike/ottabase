const { definePrismaConfig } = require("@ottabase/db/prisma");

module.exports = definePrismaConfig({
  // Select which core schemas to include from @ottabase/db
  // Available: "user", "post"
  coreSchemas: ["user", "post"],

  // Configure the database provider
  // Options: "postgresql", "mysql", "sqlite", "sqlserver", "mongodb", "cockroachdb"
  provider: "postgresql",

  // Path to app-specific schema (relative to app root)
  appSchemaPath: "ottabase/prisma/app.schema.prisma",

  // Output path for the generated schema (relative to app root)
  outputSchemaPath: "prisma/schema.prisma",
});
