export interface AfvrMatch {
  homeTeam: string;
  awayTeam: string;

  homeScore: number | null;
  awayScore: number | null;
}

export async function fetchAfvrResults(): Promise<
  AfvrMatch[]
> {
  return [];
}