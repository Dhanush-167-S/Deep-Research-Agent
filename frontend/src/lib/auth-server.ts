import { betterAuth } from "better-auth";
import { Pool } from "pg";

const rawDbUrl = process.env.DATABASE_URL || "postgresql://topresearch:topresearch_pass@localhost:5432/topresearch_db";
const pgConnectionString = rawDbUrl.replace("postgresql+asyncpg://", "postgresql://").replace("postgres+asyncpg://", "postgres://");

export const auth = betterAuth({
  database: new Pool({
    connectionString: pgConnectionString,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});
