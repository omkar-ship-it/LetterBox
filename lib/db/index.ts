import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

export const hasDb = Boolean(connectionString);

export const db = connectionString ? drizzle(neon(connectionString), { schema }) : null;
