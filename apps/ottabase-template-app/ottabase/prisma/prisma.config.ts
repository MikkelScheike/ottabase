import { definePrismaConfig } from "@ottabase/scripts/prisma";

export default definePrismaConfig({
  includeOttabaseSchema: true,
  appSchemaPath: "app.schema.prisma",
  outputSchemaPath: "prisma/schema.prisma", // Output to <appRoot>/prisma/schema.prisma
});
