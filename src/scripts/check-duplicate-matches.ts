import pool from "../config/database";

async function run() {
  const result = await pool.query(`
    SELECT
      home_team,
      away_team,
      DATE(played_at) AS day,
      COUNT(*) AS total
    FROM matches
    GROUP BY
      home_team,
      away_team,
      DATE(played_at)
    HAVING COUNT(*) > 1
    ORDER BY day DESC
  `);

  console.table(result.rows);
  await pool.end();
}

run();