import fs from "node:fs";
import path from "node:path";

export function loadMonorepoEnv(requiredVar = "DATABASE_URL"): void {
  if (process.env[requiredVar] || typeof process.loadEnvFile !== "function") {
    return;
  }

  let dir = process.cwd();
  for (let depth = 0; depth < 5; depth += 1) {
    for (const filename of [".env.local", ".env"]) {
      const envPath = path.join(dir, filename);
      if (fs.existsSync(envPath)) {
        process.loadEnvFile(envPath);
        if (process.env[requiredVar]) {
          return;
        }
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}
