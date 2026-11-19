export type AppEnv = "local" | "dev" | "production";

/**
 * Which environment the app runs in, from APP_ENV ("local", "dev" or "production").
 * A missing or unrecognised value is treated as "production" so that anything gated
 * on `local` (like printing secrets to the console) fails closed.
 */
export function getAppEnv(): AppEnv {
  const value = process.env.APP_ENV?.trim().toLowerCase();
  return value === "local" || value === "dev" || value === "production" ? value : "production";
}

export const isLocalEnv = () => getAppEnv() === "local";
