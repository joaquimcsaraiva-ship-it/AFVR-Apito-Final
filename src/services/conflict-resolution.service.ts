import { getMatchSources } from "../repositories/match-source.repository";

export interface ResolutionResult {
  conflictDetected: boolean;
  officialSource: string | null;

  homeScore: number | null;
  awayScore: number | null;

  reasons: string[];
}
export interface DetailedResolutionResult
  extends ResolutionResult {

  reasons: string[];
}
export async function resolveMatch(
  matchId: number
): Promise<ResolutionResult | null> {

  const sources = await getMatchSources(matchId);

  if (!sources.length) {
    return null;
  }

     const sourcesWithScores = sources.filter(
    source =>
      source.homeScore !== null &&
      source.awayScore !== null
  );

  const uniqueScores = new Set(
    sourcesWithScores.map(
      source =>
        `${source.homeScore}-${source.awayScore}`
    )
  );
 const reasons: string[] = [];

if (uniqueScores.size > 1) {
  reasons.push("score_mismatch");
}

const conflictDetected =
  reasons.length > 0;

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
  awayScore: winner.awayScore,

  reasons
};
}