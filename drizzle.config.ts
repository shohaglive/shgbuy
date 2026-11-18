import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local env files for drizzle-kit (Next.js loads these automatically at runtime).
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
