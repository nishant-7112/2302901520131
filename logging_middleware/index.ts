/**
 * Logging Middleware
 * Reusable logging package that sends logs to the Affordmed evaluation server.
 * Supports stack: "frontend" | "backend"
 * Supports level: "debug" | "info" | "warn" | "error" | "fatal"
 * Supports package (frontend): "component" | "api" | "store" | "middleware" | "handler" | "util"
 */

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage = "component" | "api" | "store" | "middleware" | "handler" | "util";
type BackendPackage = "cache" | "controller" | "cron_job" | "db" | "domain";
type Package = FrontendPackage | BackendPackage;

let authToken: string | null = null;

/**
 * Set the Bearer token for authenticated log API calls.
 * Call this once after obtaining the token from the auth endpoint.
 */
export function setAuthToken(token: string): void {
  authToken = token;
}

/**
 * Core Log function — sends a log entry to the evaluation server.
 * @param stack   - "frontend" or "backend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - package name (must match allowed values for the stack)
 * @param message - descriptive log message
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  if (!authToken) {
    console.warn("[Logger] Auth token not set. Call setAuthToken() first.");
    return;
  }

  const payload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[Logger] Failed to send log. Status: ${response.status}`);
    }
  } catch (error) {
    // Silently fail — logging should never break the app
    console.error("[Logger] Network error while sending log:", error);
  }
}

// Convenience wrappers for cleaner usage
export const logger = {
  debug: (pkg: Package, message: string) => Log("frontend", "debug", pkg, message),
  info: (pkg: Package, message: string) => Log("frontend", "info", pkg, message),
  warn: (pkg: Package, message: string) => Log("frontend", "warn", pkg, message),
  error: (pkg: Package, message: string) => Log("frontend", "error", pkg, message),
  fatal: (pkg: Package, message: string) => Log("frontend", "fatal", pkg, message),
};

export default Log;
