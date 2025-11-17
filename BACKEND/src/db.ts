import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from "pg";
import 'dotenv/config';
import * as schema from "./db/index.ts";

const pool = new Pool({ connectionString: process.env.DB_URL as string });

const db = drizzle( pool, {
    schema: schema,
    logger: true,
});

console.log("Database Connected: EdGi Custom Works");

export { db };