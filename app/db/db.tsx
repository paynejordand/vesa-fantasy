import { neon, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as txDrizzle } from "drizzle-orm/neon-serverless";

export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const txDB = txDrizzle({ client: pool });