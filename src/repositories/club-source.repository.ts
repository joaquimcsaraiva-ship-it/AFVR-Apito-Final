import pool from "../config/database";

export interface ClubSource {
  id: number;
  clubName: string;
  websiteUrl: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapClubSource(row: Record<string, unknown>): ClubSource {
  return {
    id: Number(row.id),
    clubName: String(row.club_name),
    websiteUrl: String(row.website_url),
    facebookUrl:
      row.facebook_url == null
        ? null
        : String(row.facebook_url),
    instagramUrl:
      row.instagram_url == null
        ? null
        : String(row.instagram_url),
    active: Boolean(row.active),
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at))
  };
}

export async function listClubSources(): Promise<ClubSource[]> {
  const result = await pool.query(
    `
      SELECT *
      FROM club_sources
      ORDER BY club_name ASC
    `
  );

  return result.rows.map(mapClubSource);
}

export async function getClubSource(
  id: number
): Promise<ClubSource | null> {

  const result = await pool.query(
    `
      SELECT *
      FROM club_sources
      WHERE id = $1
    `,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  return mapClubSource(result.rows[0]);
}

export async function createClubSource(
  clubName: string,
  websiteUrl: string,
  facebookUrl: string | null = null,
  instagramUrl: string | null = null
): Promise<ClubSource> {

  const result = await pool.query(
    `
      INSERT INTO club_sources (
        club_name,
        website_url,
        facebook_url,
        instagram_url
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [
      clubName,
      websiteUrl,
      facebookUrl,
      instagramUrl
    ]
  );

  return mapClubSource(result.rows[0]);
}

export async function updateClubSource(
  id: number,
  websiteUrl: string,
  facebookUrl: string | null,
  instagramUrl: string | null,
  active: boolean
): Promise<ClubSource | null> {

  const result = await pool.query(
    `
      UPDATE club_sources
      SET
        website_url = $2,
        facebook_url = $3,
        instagram_url = $4,
        active = $5,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      websiteUrl,
      facebookUrl,
      instagramUrl,
      active
    ]
  );

  if (!result.rowCount) {
    return null;
  }

  return mapClubSource(result.rows[0]);
}

export async function deleteClubSource(
  id: number
): Promise<boolean> {

  const result = await pool.query(
    `
      DELETE FROM club_sources
      WHERE id = $1
    `,
    [id]
  );

  return (result.rowCount ?? 0) > 0;
}