import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { sql } from "drizzle-orm";

import { DatabaseService } from "../database/database.service";

interface HealthRow extends Record<string, unknown> {
  server_time: Date | string;
  database: string;
  version: string;
}

@Controller("health")
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  async getHealth() {
    try {
      const result = await this.database.db.execute<HealthRow>(
        sql`SELECT now() AS server_time, current_database() AS database, version() AS version`,
      );
      const row = result.rows[0];
      const serverTime =
        row?.server_time instanceof Date
          ? row.server_time.toISOString()
          : (row?.server_time ?? null);

      return {
        status: "ok",
        database: row?.database ?? null,
        serverTime,
        postgresVersion: row?.version ?? null,
        branch: process.env.NEON_BRANCH ?? null,
      };
    } catch (error) {
      console.error("Database health check failed:", error);
      throw new ServiceUnavailableException({
        status: "error",
        message: "Database connection failed",
      });
    }
  }
}
