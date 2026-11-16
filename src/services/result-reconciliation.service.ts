export interface MatchSnapshot {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  matchDate?: Date | string | null;
}

export interface ReconciliationResult {
  hasConflict: boolean;
  reasons: string[];
}

export function reconcileMatchResults(
  afvr: MatchSnapshot,
  fpf: MatchSnapshot
): ReconciliationResult {
  const reasons: string[] = [];

  if (
    afvr.homeTeam.trim().toLowerCase() !==
    fpf.homeTeam.trim().toLowerCase()
  ) {
    reasons.push("home_team_mismatch");
  }

  if (
    afvr.awayTeam.trim().toLowerCase() !==
    fpf.awayTeam.trim().toLowerCase()
  ) {
    reasons.push("away_team_mismatch");
  }

  if (afvr.homeGoals !== fpf.homeGoals) {
    reasons.push("home_goals_mismatch");
  }

  if (afvr.awayGoals !== fpf.awayGoals) {
    reasons.push("away_goals_mismatch");
  }

  return {
    hasConflict: reasons.length > 0,
    reasons
  };
}