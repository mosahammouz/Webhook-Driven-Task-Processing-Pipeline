import { defineConfig } from "drizzle-kit";

const config = {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
    dialect: "postgresql", 
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};

export default config;