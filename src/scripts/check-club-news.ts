import pool from "../config/database";

async function run() {

  const result =
    await pool.query(`
      SELECT
        id,
        title,
        category,
        LEFT(content, 500) AS content
      FROM club_articles
      ORDER BY id DESC
      LIMIT 20
    `);

  console.table(result.rows);
}

run().catch(console.error);