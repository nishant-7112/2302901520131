// src/lib/logger.ts
// Frontend logging utility — wraps sendLog from api.ts

import { sendLog } from "./api";

type Level = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage = "component" | "api" | "store" | "middleware" | "handler" | "util";

export async function Log(
  level: Level,
  pkg: FrontendPackage,
  message: string
): Promise<void> {
  await sendLog("frontend", level, pkg, message);
}

export const logger = {
  debug: (pkg: FrontendPackage, msg: string) => Log("debug", pkg, msg),
  info: (pkg: FrontendPackage, msg: string) => Log("info", pkg, msg),
  warn: (pkg: FrontendPackage, msg: string) => Log("warn", pkg, msg),
  error: (pkg: FrontendPackage, msg: string) => Log("error", pkg, msg),
  fatal: (pkg: FrontendPackage, msg: string) => Log("fatal", pkg, msg),
};
