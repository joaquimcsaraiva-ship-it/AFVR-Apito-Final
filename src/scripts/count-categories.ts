import pool from "../config/database";

async function run() {

  const result = await pool.query(`
    SELECT
      category,
      COUNT(*) AS total
    FROM club_articles
    GROUP BY category
    ORDER BY total DESC
  `);

  console.table(result.rows);
}

run().catch(console.error);