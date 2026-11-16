import pool from "../config/database";

import {
  extractScores
} from "../services/match-extractor.service";

import {
  saveMatchCandidate
} from "../repositories/match-candidate.repository";

async function run() {

  const result =
    await pool.query(
      `
      SELECT
        id,
        title,
        content,
        category
      FROM club_articles
      WHERE category IN (
        'match_results',
        'match_preview'
      )
      `
    );

  let total = 0;

  for (const article of result.rows) {

    const scores =
      extractScores(
        article.content ?? ""
      );

    for (const score of scores) {

      await saveMatchCandidate(
        article.id,
        score.score,
        score.homeGoals,
        score.awayGoals,
        article.category
      );

      total++;

      console.log(
        `✓ ${article.title} -> ${score.score}`
      );
    }
  }

  console.log(
    `Candidatos gerados: ${total}`
  );
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });