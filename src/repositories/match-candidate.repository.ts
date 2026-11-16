import pool from "../config/database";

export async function saveMatchCandidate(
  clubArticleId: number,
  score: string,
  homeGoals: number,
  awayGoals: number,
  candidateType: string | null = null
): Promise<void> {

  await pool.query(
    `
    INSERT INTO match_candidates (
      club_article_id,
      score,
      home_goals,
      away_goals,
      candidate_type
    )
    VALUES ($1,$2,$3,$4,$5)
    `,
    [
      clubArticleId,
      score,
      homeGoals,
      awayGoals,
      candidateType
    ]
  );
}