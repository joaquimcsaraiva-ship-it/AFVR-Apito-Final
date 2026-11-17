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
    WHERE competition_id = 10
    ORDER BY home_team, away_team, played_at
  `);

  console.table(
    result.rows.filter(
      r =>
        r.home_team === 'Ade Geração Talentos "B"' ||
        r.away_team === 'Mondinense Fc'
    )
  );

  await pool.end();
}

run().catch(console.error);