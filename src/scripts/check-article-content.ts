import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      id,
      title,
      LEFT(content, 300) AS content
    FROM club_articles
    ORDER BY id DESC
    LIMIT 10
  `);

  console.table(result.rows);
}

run().catch(console.error);