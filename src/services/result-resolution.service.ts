export interface MatchSourceRecord {
  source: string;
  sourcePriority: number;
}

export function pickOfficialSource(
  entries: MatchSourceRecord[]
): MatchSourceRecord | undefined {

  if (entries.length === 0) {
    return undefined;
  }

  return [...entries].sort(
    (a, b) =>
      b.sourcePriority - a.sourcePriority
  )[0];
}