import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { deliverPasswordResetCode } from "@/lib/password-reset";

// Email + password only. No email provider is configured, so email
// verification and password reset are intentionally not enabled yet.
// Requires BETTER_AUTH_SECRET (and optionally BETTER_AUTH_URL) in .env.local.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // After a reset, sign the account out everywhere (a stolen session must not survive it).
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    additionalFields: {
      // Typed on the session user. input:false means sign-up and update-user
      // requests can never set it; only src/db/make-admin.ts grants "admin".
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  // Lets Server Actions and Server Components set/refresh the session cookie.
  plugins: [
    nextCookies(),
    // Used ONLY for "forgot password": a 6-digit code the customer types in. Codes are stored
    // hashed, expire after 10 minutes, allow 3 attempts, and are rate limited (3 requests/min).
    // Requests for unknown emails succeed silently, so account existence isn't revealed.
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
      storeOTP: "hashed",
      // The plugin also ships passwordless sign-in; keep that from creating accounts.
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        // Never deliver codes for any other purpose (sign-in, email verification...).
        if (type !== "forget-password") return;
        await deliverPasswordResetCode({ email, code: otp });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
