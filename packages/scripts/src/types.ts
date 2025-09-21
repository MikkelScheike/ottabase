export interface PrismaConfig {
  includeOttabaseSchema?: boolean;
  appSchemaPath?: string;
  outputSchemaPath?: string;
  prismaGenerate?: {
    enabled?: boolean;
  };
}

export const definePrismaConfig = (config: PrismaConfig): PrismaConfig =>
  config;
