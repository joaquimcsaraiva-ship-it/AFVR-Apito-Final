import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      COUNT(*) AS total
    FROM matches
  `);

  console.table(result.rows);
}

run().catch(console.error);