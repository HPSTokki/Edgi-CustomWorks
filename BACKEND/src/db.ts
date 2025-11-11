import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from "pg";
import * as schema from './db/index.ts';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DB_URL as string });

const db = drizzle({ client: pool });

console.log("Database Connected: EdGi Custom Works");

export { db };