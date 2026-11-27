import { defineConfig } from "drizzle-kit";

import { loadMonorepoEnv } from "./src/database/env";

// Use the direct (unpooled) Neon connection string for schema migrations.
loadMonorepoEnv("DATABASE_URL_UNPOOLED");

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set. Run `neon deploy` or `neon env pull`.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url,
  },
});
