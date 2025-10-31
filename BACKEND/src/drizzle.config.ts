import {  defineConfig  } from "drizzle-kit"
import "dotenv/config"

export default defineConfig({
    schema: "./src/db/index.ts",
    out: "./src/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DB_URL as string
    },
    verbose: true,
    strict: true
})