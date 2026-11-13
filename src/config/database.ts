import "dotenv/config";

import { Pool } from "pg";

function createPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const poolLimits = {
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  };

  if (databaseUrl) {
    let parsed: URL;
    try {
      parsed = new URL(databaseUrl);
    } catch {
      throw new Error("DATABASE_URL não contém um endereço válido de PostgreSQL.");
    }

    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      throw new Error("DATABASE_URL tem de usar o protocolo PostgreSQL.");
    }

    const sslMode = parsed.searchParams.get("sslmode")?.toLowerCase();
    if (sslMode && !["require", "verify-ca", "verify-full"].includes(sslMode)) {
      throw new Error("DATABASE_URL tem de exigir TLS com validação do certificado.");
    }

    // Enforce TLS and certificate verification; remove URL flags that could override it.
    for (const key of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert"]) {
      parsed.searchParams.delete(key);
    }

    return {
      connectionString: parsed.toString(),
      ssl: { rejectUnauthorized: true },
      ...poolLimits
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL?.toLowerCase() === "true"
      ? { rejectUnauthorized: true }
      : undefined,
    ...poolLimits
  };
}

const pool = new Pool(createPoolConfig());

pool.on("error", (error) => {
  console.error("Erro inesperado no pool PostgreSQL:", error.message);
});

export async function checkDatabaseConnection(): Promise<void> {
  const result = await pool.query<{ current_time: Date }>("SELECT NOW() AS current_time");
  console.log("PostgreSQL ligado:", result.rows[0]?.current_time);
}

export default pool;