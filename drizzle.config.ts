import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = new URL(process.env.DATABASE_URL!);

export default {
  schema: "./shared/db/schema",
  out: "./shared/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 5432),
    user: databaseUrl.username,
    password: databaseUrl.password,
    database: databaseUrl.pathname.slice(1),
    ssl: "require",
  },
} satisfies Config;
