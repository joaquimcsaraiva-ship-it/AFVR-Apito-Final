import pool from "../config/database";

async function run() {

  const results = [
    {
      homeTeam: "GD Chaves",
      awayTeam: "FC Penafiel",
      homeGoals: 2,
      awayGoals: 1,
      source: "FPF"
    }
  ];

  for (const match of results) {

    await pool.query(
      `
      INSERT INTO match_candidates (
        home_team,
        away_team,
        home_goals,
        away_goals,
        source
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        match.homeTeam,
        match.awayTeam,
        match.homeGoals,
        match.awayGoals,
        match.source
      ]
    );

    console.log(
      `✓ ${match.homeTeam} ${match.homeGoals}-${match.awayGoals} ${match.awayTeam}`
    );
  }
}

run()
  .then(() => process.exit(0))
  .catch(console.error);