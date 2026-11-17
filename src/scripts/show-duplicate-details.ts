import pool from "../config/database";

async function run() {
  const result = await pool.query(`
    SELECT
      id,
      home_team,
      away_team,
      played_at,
      status,
      home_score,
      away_score,
      source
    FROM matches
    WHERE
      home_team = 'Abambres Sc "A"'
      AND away_team = 'Ccp Alto Douro'
    ORDER BY played_at;
  `);

  console.table(result.rows);

  await pool.end();
}

run().catch(console.error);