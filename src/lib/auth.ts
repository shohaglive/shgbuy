import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Email + password only. No email provider is configured, so email
// verification and password reset are intentionally not enabled yet.
// Requires BETTER_AUTH_SECRET (and optionally BETTER_AUTH_URL) in .env.local.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Lets Server Actions and Server Components set/refresh the session cookie.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
