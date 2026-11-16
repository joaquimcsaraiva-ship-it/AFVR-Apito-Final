import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      id,
      title,
      category
    FROM club_articles
    ORDER BY id DESC
    LIMIT 30
  `);

  console.log(
    "Total:",
    result.rows.length
  );

  console.table(result.rows);
}

run().catch(console.error);