require("dotenv/config");

const { readFile, readdir } = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

function createPoolConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const poolLimits = {
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  };

  if (databaseUrl) {
    let parsed;
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

async function initializeDatabase() {
  const databasePath = path.join(process.cwd(), "database");
  const migrations = (await readdir(databasePath))
    .filter((name) => /^\d+.*\.sql$/i.test(name))
    .sort();

  try {
    for (const migration of migrations) {
      const schema = await readFile(path.join(databasePath, migration), "utf8");
      await pool.query(schema);
      console.log(`Aplicado: ${migration}`);
    }
    console.log("Base de dados inicializada com sucesso.");
  } finally {
    await pool.end();
  }
}

initializeDatabase().catch((error) => {
  console.error("Não foi possível inicializar a base de dados:", error.message);
  process.exitCode = 1;
});