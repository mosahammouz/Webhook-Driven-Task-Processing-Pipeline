import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const dbURL = process.env.DATABASE_URL;
if(!dbURL){throw new Error("DATABASE_URL is not set in .env");}
const conn = postgres(dbURL);
export const db = drizzle(conn, { schema });
