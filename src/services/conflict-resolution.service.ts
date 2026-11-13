import { getMatchSources } from "../repositories/match-source.repository";

export interface ResolutionResult {
  conflictDetected: boolean;
  officialSource: string | null;

  homeScore: number | null;
  awayScore: number | null;
}

export async function resolveMatch(
  matchId: number
): Promise<ResolutionResult | null> {

  const sources = await getMatchSources(matchId);

  if (!sources.length) {
    return null;
  }

  const uniqueScores = new Set(
    sources.map(
      source =>
        `${source.homeScore}-${source.awayScore}`
    )
  );

  const conflictDetected =
    uniqueScores.size > 1;

  const winner =
    [...sources].sort(
      (a, b) =>
        b.sourcePriority -
        a.sourcePriority
    )[0];

  return {
    conflictDetected,
    officialSource: winner.source,

    homeScore: winner.homeScore,
    awayScore: winner.awayScore
  };
}