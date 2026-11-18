import pool from "../config/database";

export interface Standing {
  id: number;
  competitionId: number;
  groupName: string | null;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface StandingRow {
  id: number;
  competition_id: number;
  group_name: string | null;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

function mapRow(row: StandingRow): Standing {
  return {
    id: row.id,
    competitionId: row.competition_id,
    groupName: row.group_name,
    teamName: row.team_name,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goals_for,
    goalsAgainst: row.goals_against,
    goalDifference: row.goal_difference,
    points: row.points
  };
}

export async function getByCompetitionId(
  competitionId: number
): Promise<Standing[]> {
  const result = await pool.query<StandingRow>(
    `
    SELECT *
    FROM standings
    WHERE competition_id = $1
    ORDER BY
      points DESC,
      goal_difference DESC,
      goals_for DESC,
      team_name ASC
    `,
    [competitionId]
  );

  return result.rows.map(mapRow);
}