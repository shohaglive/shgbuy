// Grants the admin role to an existing account: `ADMIN_EMAIL=you@example.com npm run db:make-admin`
// (register the account at /account/register first). Nothing in the web app can grant admin.
// Pass --revoke to demote.
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!url) throw new Error("DATABASE_URL is not set (.env.local).");
  if (!email) throw new Error("Set ADMIN_EMAIL, e.g. ADMIN_EMAIL=you@example.com npm run db:make-admin");

  const role = process.argv.includes("--revoke") ? "user" : "admin";
  const sql = neon(url);
  const rows = await sql`update "user" set role = ${role}, updated_at = now() where lower(email) = ${email} returning email, role`;
  if (rows.length === 0) {
    throw new Error(`No account found for ${email}. Register it at /account/register first.`);
  }
  console.log(`${rows[0].email} is now "${rows[0].role}".`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
