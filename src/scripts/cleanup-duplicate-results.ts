import pool from "../config/database";

async function run() {
  const result = await pool.query(`
    DELETE FROM matches scheduled_match
    WHERE
      scheduled_match.status = 'scheduled'
      AND scheduled_match.home_score IS NULL
      AND scheduled_match.away_score IS NULL
      AND EXISTS (
        SELECT 1
        FROM matches played_match
        WHERE
          played_match.id <> scheduled_match.id
          AND played_match.home_team = scheduled_match.home_team
          AND played_match.away_team = scheduled_match.away_team
          AND DATE(played_match.played_at) =
              DATE(scheduled_match.played_at)
          AND played_match.home_score IS NOT NULL
          AND played_match.away_score IS NOT NULL
      )
    RETURNING id, home_team, away_team;
  `);

  console.log(
    `Duplicados removidos: ${result.rowCount}`
  );

  console.table(result.rows.slice(0, 20));

  await pool.end();
}

run().catch(console.error);