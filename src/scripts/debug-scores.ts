import pool from "../config/database";

import {
  extractScores
} from "../services/match-extractor.service";

async function run() {

  const result = await pool.query(`
    SELECT
      title,
      category,
      content
    FROM club_articles
    WHERE category IN (
      'match_preview',
      'match_results'
    )
  `);

  for (const article of result.rows) {

    console.log("\n----------------");

    console.log(article.title);

    const scores =
      extractScores(
        article.content ?? ""
      );

    console.log(scores);
  }
}

run().catch(console.error);