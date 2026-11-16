import pool from "../config/database";

async function run() {

  const result =
    await pool.query(
      `
      SELECT
        id,
        title,
        category,
        content
      FROM club_articles
      WHERE category IN (
        'match_results',
        'match_preview',
        'standings'
      )
      `
    );

  for (const article of result.rows) {

    console.log("-----");

    console.log(article.title);

    console.log(article.category);

    console.log(
      article.content?.slice(0, 300)
    );
  }
}

run().catch(console.error);