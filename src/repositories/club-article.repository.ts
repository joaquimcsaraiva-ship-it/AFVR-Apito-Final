import pool from "../config/database";

export async function saveClubArticle(
  clubSourceId: number,
  title: string,
  content: string,
  articleUrl: string | null = null,
  category: string | null = null
) {
  return pool.query(
    `
    INSERT INTO club_articles (
      club_source_id,
      article_url,
      title,
      content,
      category
    )
    VALUES ($1,$2,$3,$4,$5)

    ON CONFLICT (
      club_source_id,
      title
    )

    DO UPDATE SET
      content = EXCLUDED.content,
      category = EXCLUDED.category,
      article_url = EXCLUDED.article_url
    `,
    [
      clubSourceId,
      articleUrl,
      title,
      content,
      category
    ]
  );
}