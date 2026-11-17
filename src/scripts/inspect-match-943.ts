import pool from "../config/database";

async function run() {
  const result = await pool.query(`
    SELECT
      id,
      competition_id,
      home_team,
      away_team,
      played_at,
      status,
      home_score,
      away_score,
      source,
      external_id
    FROM matches
    WHERE id IN (943, 19619)
  `);

  console.table(result.rows);

  await pool.end();
}

run().catch(console.error);