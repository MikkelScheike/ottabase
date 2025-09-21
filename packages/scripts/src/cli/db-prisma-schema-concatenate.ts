#!/usr/bin/env node

import { concatenatePrismaSchema } from "../concatenate";

const run = async () => {
  try {
    const cwd = process.argv[2] || process.cwd();
    await concatenatePrismaSchema(cwd);
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
};

void run();
