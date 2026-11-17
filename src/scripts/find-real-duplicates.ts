import pool from "../config/database";

async function run() {
  const result = await pool.query(`
    SELECT
      competition_id,
      home_team,
      away_team,
      DATE(played_at) AS day,
      COUNT(*) AS total,
      STRING_AGG(id::text, ', ') ids
    FROM matches
    GROUP BY
      competition_id,
      home_team,
      away_team,
      DATE(played_at)
    HAVING COUNT(*) > 1
    ORDER BY day DESC;
  `);

  console.table(result.rows.slice(0, 50));
  await pool.end();
}

run().catch(console.error);