export interface MatchCandidateResult {
  score: string;
  homeGoals: number;
  awayGoals: number;
}

export function extractScores(
  text: string
): MatchCandidateResult[] {

  const regex =
    /\b(\d+)\s*-\s*(\d+)\b/g;

  const results: MatchCandidateResult[] = [];

  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {

    results.push({
      score: match[0],
      homeGoals: Number(match[1]),
      awayGoals: Number(match[2])
    });
  }

  return results;
}

export function containsMatchInformation(
  category: string
): boolean {

  return [
    "match_results",
    "match_preview",
    "standings"
  ].includes(category);
}