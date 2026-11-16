import pool from "../config/database";

import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

import {
  extractArticleBody
} from "../services/article-body.service";

async function run() {

  const result =
    await pool.query(`
      SELECT
        id,
        article_url
      FROM club_articles
      WHERE article_url IS NOT NULL
    `);

  console.log(
    `Artigos: ${result.rows.length}`
  );

  for (const article of result.rows) {

    try {

      const html =
        await fetchWebsiteContent(
          article.article_url
        );

      const content =
        extractArticleBody(html);

      await pool.query(
        `
        UPDATE club_articles
        SET content = $1
        WHERE id = $2
        `,
        [
          content,
          article.id
        ]
      );

      console.log(
        `✓ Artigo ${article.id}`
      );

    } catch (error) {

      console.error(
        `✗ Artigo ${article.id}`,
        error
      );
    }
  }
}

run().catch(console.error);