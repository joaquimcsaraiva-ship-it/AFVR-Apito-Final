import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      id,
      title,
      category,
      LEFT(content, 500) AS content
    FROM club_articles
    WHERE category = 'match_results'
  `);

  console.table(result.rows);
}

run().catch(console.error);