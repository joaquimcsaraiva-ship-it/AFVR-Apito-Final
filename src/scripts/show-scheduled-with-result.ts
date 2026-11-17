import pool from "../config/database";

async function run() {
  const result = await pool.query(`
    SELECT
      s.id AS scheduled_id,
      p.id AS played_id,
      s.home_team,
      s.away_team,
      s.played_at AS scheduled_date,
      p.played_at AS played_date
    FROM matches s
    JOIN matches p
      ON p.home_team = s.home_team
     AND p.away_team = s.away_team
     AND DATE(p.played_at) = DATE(s.played_at)
    WHERE
      s.status = 'scheduled'
      AND s.home_score IS NULL
      AND s.away_score IS NULL
      AND p.home_score IS NOT NULL
      AND p.away_score IS NOT NULL
    LIMIT 20
  `);

  console.table(result.rows);

  await pool.end();
}

run().catch(console.error);