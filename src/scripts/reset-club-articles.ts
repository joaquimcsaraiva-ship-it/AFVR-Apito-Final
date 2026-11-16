import pool from "../config/database";

async function run() {

  await pool.query(`
    TRUNCATE TABLE club_articles
    RESTART IDENTITY
    CASCADE
  `);

  console.log("club_articles limpa");
}

run()
  .then(() => process.exit(0))
  .catch(console.error);