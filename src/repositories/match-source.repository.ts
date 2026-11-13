import pool from "../config/database";
import { ResultSource } from "../types/result-source";

export interface MatchSource {
  id: number;
  matchId: number;

  source: ResultSource;
  sourcePriority: number;

  sourceUrl: string | null;

  homeScore: number | null;
  awayScore: number | null;

  verified: boolean;
}

export async function saveMatchSource(
  matchId: number,
  source: ResultSource,
  sourcePriority: number,
  sourceUrl: string | null,
  homeScore: number | null,
  awayScore: number | null
): Promise<void> {

  await pool.query(
    `
      INSERT INTO match_sources (
        match_id,
        source,
        source_priority,
        source_url,
        home_score,
        away_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      matchId,
      source,
      sourcePriority,
      sourceUrl,
      homeScore,
      awayScore
    ]
  );
}

export async function getMatchSources(
  matchId: number
): Promise<MatchSource[]> {

  const result = await pool.query(
    `
      SELECT *
      FROM match_sources
      WHERE match_id = $1
      ORDER BY source_priority DESC
    `,
    [matchId]
  );

  return result.rows.map(row => ({
    id: Number(row.id),
    matchId: Number(row.match_id),

    source: row.source as ResultSource,
    sourcePriority: Number(row.source_priority),

    sourceUrl: row.source_url,

    homeScore:
      row.home_score == null
        ? null
        : Number(row.home_score),

    awayScore:
      row.away_score == null
        ? null
        : Number(row.away_score),

    verified: Boolean(row.verified)
  }));
}