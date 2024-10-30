import { Pool, PoolClient } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const POOL_CONNECTIONS = 10;
const LAZY = true;

const database = new Pool(
    {
        user: Deno.env.get("DB_USERNAME"),
        password: Deno.env.get("DB_PASSWORD"),
        database: Deno.env.get("DB_NAME"),
        hostname: Deno.env.get("DB_HOST"),
        port: parseInt(Deno.env.get("DB_PORT") || "5432"),
    },
    POOL_CONNECTIONS,
    LAZY,
);

const client: PoolClient = await database.connect();

export default client;
