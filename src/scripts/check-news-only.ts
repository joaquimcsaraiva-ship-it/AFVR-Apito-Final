import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      id,
      title,
      category,
      article_url
    FROM club_articles
    WHERE category <> 'general'
    ORDER BY id DESC
  `);

  console.table(result.rows);
}

run().catch(console.error);