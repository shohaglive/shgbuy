import { isLocalEnv } from "@/lib/env";

/**
 * The single place where a password reset code leaves the system.
 *
 *  - APP_ENV=local: printed to the server console so you can test without email.
 *  - dev / production: there is no email provider yet, so nothing is sent and the code is
 *    never logged. When you add one (Resend, SES, ...), send the email from here.
 */
export async function deliverPasswordResetCode({ email, code }: { email: string; code: string }) {
  if (isLocalEnv()) {
    console.log(
      [
        "",
        "┌──────────────────────────────────────────────┐",
        "│  PASSWORD RESET CODE (APP_ENV=local only)    │",
        `│  Email: ${email.padEnd(36).slice(0, 36)} │`,
        `│  Code:  ${code.padEnd(36)} │`,
        "└──────────────────────────────────────────────┘",
        "",
      ].join("\n"),
    );
    return;
  }
  console.warn("[auth] A password reset was requested, but no email provider is configured. No code was sent.");
}
