import pool from "../config/database";

async function run() {

  const result =
    await pool.query(`
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
    `);

  console.log(
    "Artigos:",
    result.rows.length
  );

  for (const row of result.rows) {

    console.log("\n----------------");

    console.log(
      "TITLE:",
      row.title
    );

    console.log(
      "CATEGORY:",
      row.category
    );

    console.log(
      "CONTENT:",
      row.content
    );
  }
}

run().catch(console.error);