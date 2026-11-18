import pool from "../config/database";

type Standing = {
  competitionId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export async function rebuildStandings(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("TRUNCATE TABLE standings RESTART IDENTITY");

    const { rows } = await client.query(`
      SELECT
        competition_id,
        home_team,
        away_team,
        home_score,
        away_score
      FROM matches
      WHERE status = 'played'
        AND home_score IS NOT NULL
        AND away_score IS NOT NULL
    `);

    const standings = new Map<string, Standing>();

    const getTeam = (
      competitionId: number,
      teamName: string
    ): Standing => {
      const key = `${competitionId}:${teamName}`;

      if (!standings.has(key)) {
        standings.set(key, {
          competitionId,
          teamName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        });
      }

      return standings.get(key)!;
    };

    for (const match of rows) {
      const competitionId = Number(match.competition_id);

      const home = getTeam(
        competitionId,
        match.home_team
      );

      const away = getTeam(
        competitionId,
        match.away_team
      );

      const hs = Number(match.home_score);
      const as = Number(match.away_score);

      home.played++;
      away.played++;

      home.goalsFor += hs;
      home.goalsAgainst += as;

      away.goalsFor += as;
      away.goalsAgainst += hs;

      if (hs > as) {
        home.wins++;
        home.points += 3;
        away.losses++;
      } else if (hs < as) {
        away.wins++;
        away.points += 3;
        home.losses++;
      } else {
        home.draws++;
        away.draws++;
        home.points++;
        away.points++;
      }
    }

    for (const team of standings.values()) {
      team.goalDifference =
        team.goalsFor - team.goalsAgainst;

      await client.query(
        `
        INSERT INTO standings (
          competition_id,
          team_name,
          played,
          wins,
          draws,
          losses,
          goals_for,
          goals_against,
          goal_difference,
          points
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        `,
        [
          team.competitionId,
          team.teamName,
          team.played,
          team.wins,
          team.draws,
          team.losses,
          team.goalsFor,
          team.goalsAgainst,
          team.goalDifference,
          team.points
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}