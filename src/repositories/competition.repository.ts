import pool from "../config/database";

import type {
  CreateCompetitionDTO,
  PatchCompetitionDTO,
  UpdateCompetitionDTO
} from "../validators/competition.validator";

export interface Competition {
  id: number;
  name: string;
  season: string;
  sport: "football" | "futsal";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CompetitionRow {
  id: number;
  name: string;
  season: string;
  sport: "football" | "futsal";
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapRow(
  row: CompetitionRow
): Competition {
  return {
    id: row.id,
    name: row.name,
    season: row.season,
    sport: row.sport,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getAll():
Promise<Competition[]> {
  const result =
    await pool.query<CompetitionRow>(
      `
      SELECT
        id,
        name,
        season,
        sport,
        active,
        created_at,
        updated_at
      FROM competitions
      ORDER BY season DESC, name ASC
      `
    );

  return result.rows.map(mapRow);
}

export async function getById(
  id: number
): Promise<Competition | null> {
  const result =
    await pool.query<CompetitionRow>(
      `
      SELECT
        id,
        name,
        season,
        sport,
        active,
        created_at,
        updated_at
      FROM competitions
      WHERE id = $1
      `,
      [id]
    );

  const row = result.rows[0];

  return row ? mapRow(row) : null;
}

export async function create(
  data: CreateCompetitionDTO
): Promise<Competition> {
  const result =
    await pool.query<CompetitionRow>(
      `
      INSERT INTO competitions (
        name,
        season,
        sport,
        active
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        season,
        sport,
        active,
        created_at,
        updated_at
      `,
      [
        data.name,
        data.season,
        data.sport,
        data.active
      ]
    );

  return mapRow(result.rows[0]!);
}

export async function update(
  id: number,
  data: UpdateCompetitionDTO
): Promise<Competition | null> {
  const result =
    await pool.query<CompetitionRow>(
      `
      UPDATE competitions
      SET
        name = $1,
        season = $2,
        sport = $3,
        active = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING
        id,
        name,
        season,
        sport,
        active,
        created_at,
        updated_at
      `,
      [
        data.name,
        data.season,
        data.sport,
        data.active,
        id
      ]
    );

  const row = result.rows[0];

  return row ? mapRow(row) : null;
}

export async function patch(
  id: number,
  data: PatchCompetitionDTO
): Promise<Competition | null> {
  const current = await getById(id);

  if (!current) {
    return null;
  }

  return update(id, {
    name: data.name ?? current.name,
    season: data.season ?? current.season,
    sport: data.sport ?? current.sport,
    active: data.active ?? current.active
  });
}

export async function remove(
  id: number
): Promise<boolean> {
  const result =
    await pool.query(
      `
      DELETE FROM competitions
      WHERE id = $1
      `,
      [id]
    );

  return result.rowCount === 1;
}