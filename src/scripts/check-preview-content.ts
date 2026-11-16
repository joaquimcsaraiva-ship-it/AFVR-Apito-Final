import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      title,
      category,
      LEFT(content, 1000) AS content
    FROM club_articles
    WHERE category IN (
      'match_results',
      'match_preview'
    )
  `);

  console.table(result.rows);
}

run().catch(console.error);