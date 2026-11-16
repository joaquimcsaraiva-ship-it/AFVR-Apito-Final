import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      id,
      competition_id,
      home_team,
      away_team,
      home_score,
      away_score,
      status,
      source
    FROM matches
    ORDER BY id DESC
    LIMIT 30
  `);

  console.table(result.rows);
}

run().catch(console.error);