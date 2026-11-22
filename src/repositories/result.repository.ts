import { getMatchSources } from "./match-source.repository";
import { resolveMatch } from "../services/conflict-resolution.service";
import { ResultSource } from "../types/result-source";
import { SOURCE_PRIORITY } from "../services/source-priority.service";
import { saveMatchSource } from "./match-source.repository";

import { createHash } from "node:crypto";

import pool from "../config/database";

import type { FpfCompetition, FpfMatch } from "../services/fpf.service";
import type { ManualResultDTO, ResultUploadDTO } from "../validators/result.validator";

export interface MatchResult {
  id: number;
  competitionId: number;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  playedAt: Date | null;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "played" | "postponed" | "cancelled";
  source: "manual" | "fpf";
  updatedAt: Date;

  officialSource?: string | null;
  verificationStatus?: string | null;
  conflictDetected?: boolean;
  conflictReasons?: string[] | null;
}

export interface TeamStanding {
  position: number;
  groupName: string | null;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

function mapMatch(row: Record<string, unknown>): MatchResult {
  return {
  id: Number(row.id),
  competitionId: Number(row.competition_id),
  homeTeam: String(row.home_team),
  awayTeam: String(row.away_team),
  groupName: row.group_name == null ? null : String(row.group_name),
  playedAt: row.played_at ? new Date(String(row.played_at)) : null,
  venue: row.venue == null ? null : String(row.venue),
  homeScore: row.home_score == null ? null : Number(row.home_score),
  awayScore: row.away_score == null ? null : Number(row.away_score),
  status: row.status as MatchResult["status"],
  source: row.source as MatchResult["source"],
  updatedAt: new Date(String(row.updated_at)),
  officialSource:
    row.official_source == null
      ? null
      : String(row.official_source),
  verificationStatus:
    row.verification_status == null
      ? null
      : String(row.verification_status),
  conflictDetected: Boolean(row.conflict_detected),
  conflictReasons: Array.isArray(row.conflict_reasons)
    ? (row.conflict_reasons as string[])
    : null
};
}

function normalizeCompetitionName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeTeamName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const matchColumns = `
  id,
  competition_id,
  home_team,
  away_team,
  group_name,
  played_at,
  venue,
  home_score,
  away_score,
  status,
  source,
  updated_at,
  official_source,
  verification_status,
  conflict_detected,
  conflict_reasons
`;

export async function listByCompetition(competitionId: number): Promise<MatchResult[]> {
  const result = await pool.query(
    `SELECT ${matchColumns} FROM matches WHERE competition_id = $1
     ORDER BY played_at NULLS LAST, played_at DESC, home_team ASC`,
    [competitionId]
  );
  return result.rows.map(mapMatch);
}
export async function listConflicts() {
  const result = await pool.query(
    `
 SELECT
  id,
  competition_id,
  home_team,
  away_team,
  played_at,
  home_score,
  away_score,
  status,
  source,
  conflict_detected
FROM matches
      WHERE conflict_detected = TRUE
      ORDER BY played_at DESC NULLS LAST
    `
  );

  return result.rows;
}
export async function getConflictDetails(
  matchId: number
) {
  const match = await pool.query(
    `
SELECT
  id,
  home_team,
  away_team,
  official_source,
  verification_status,
  conflict_detected,
  conflict_reasons
FROM matches
      WHERE id = $1
    `,
    [matchId]
  );

  if (!match.rowCount) {
    return null;
  }

  const sources =
    await getMatchSources(matchId);

  return {
    ...match.rows[0],
    sources
  };
}
export async function standingsByCompetition(competitionId: number): Promise<TeamStanding[]> {
  const result = await pool.query<{
    home_team: string;
    away_team: string;
    group_name: string | null;
    home_score: number | null;
    away_score: number | null;
    status: string;
  }>(
    `SELECT m.home_team, m.away_team, m.group_name, m.home_score, m.away_score, m.status
     FROM matches m
     JOIN competitions c ON c.id = m.competition_id
     WHERE m.competition_id = $1
       AND m.status IN ('scheduled', 'played')
       AND c.name ~* '(campeonato|divisão|liga|atividades)'
       AND c.name !~* '(encontros|taça)'
     `,
    [competitionId]
  );

  const teams = new Map<string, Omit<TeamStanding, "position">>();
  const getTeam = (name: string, groupName: string | null): Omit<TeamStanding, "position"> => {
    const key = `${groupName ?? ""}\u0000${name}`;
    let team = teams.get(key);
    if (!team) {
      team = { groupName, team: name, played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
      teams.set(key, team);
    }
    return team;
  };

  for (const match of result.rows) {
    const home = getTeam(match.home_team, match.group_name);
    const away = getTeam(match.away_team, match.group_name);
    if (match.status !== "played" || match.home_score == null || match.away_score == null) continue;
    home.played++;
    away.played++;
    home.goalsFor += match.home_score;
    home.goalsAgainst += match.away_score;
    away.goalsFor += match.away_score;
    away.goalsAgainst += match.home_score;
    if (match.home_score > match.away_score) {
      home.wins++; home.points += 3; away.losses++;
    } else if (match.home_score < match.away_score) {
      away.wins++; away.points += 3; home.losses++;
    } else {
      home.draws++; away.draws++; home.points++; away.points++;
    }
  }

  const groupOrder = (groupName: string | null): number => {
    const group = groupName?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ?? "";
    const zones = ["zona centro", "zona norte", "zona sul"];
    const zoneIndex = zones.indexOf(group.replace(/[-]+/g, " ").replace(/\s+/g, " ").trim());
    return zoneIndex >= 0 ? zoneIndex : zones.length;
  };
  const sorted = [...teams.values()]
    .map((team) => ({ ...team, goalDifference: team.goalsFor - team.goalsAgainst }))
    .sort((a, b) => groupOrder(a.groupName) - groupOrder(b.groupName) ||
      (a.groupName ?? "").localeCompare(b.groupName ?? "", "pt-PT") ||
      b.points - a.points || b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor || a.team.localeCompare(b.team, "pt-PT"));

  let previousGroup: string | null | undefined;
  let previousStanding: typeof sorted[number] | undefined;
  let position = 0;
  let groupIndex = 0;
  return sorted.map((team) => {
    const sameGroup = team.groupName === previousGroup;
    const sameRecord = previousStanding && team.points === previousStanding.points &&
      team.goalDifference === previousStanding.goalDifference &&
      team.goalsFor === previousStanding.goalsFor && team.goalsAgainst === previousStanding.goalsAgainst;
    if (!sameGroup) {
      position = 1;
      groupIndex = 1;
    } else {
      groupIndex++;
      if (!sameRecord) position = groupIndex;
    }
    previousGroup = team.groupName;
    previousStanding = team;
    return { ...team, position };
  });
}

export async function saveManualResults(input: ResultUploadDTO): Promise<MatchResult[]> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const competition = await client.query(
      "SELECT id FROM competitions WHERE id = $1 FOR SHARE",
      [input.competitionId]
    );
    if (!competition.rowCount) throw new Error("A competição selecionada não existe.");

    const saved: MatchResult[] = [];
    for (const match of input.matches) {
      const stableKey = [
        input.competitionId,
        match.homeTeam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
        match.awayTeam.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
        match.playedAt ?? ""
      ].join("|");
      const externalId = `manual:${createHash("sha256").update(stableKey).digest("hex")}`;
      const scoresPresent = match.homeScore != null && match.awayScore != null;
      const result = await client.query(
        `INSERT INTO matches (
           competition_id, external_id, home_team, away_team, played_at, venue,
           home_score, away_score, status, source
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'manual')
         ON CONFLICT (external_id) DO UPDATE SET
           home_team = EXCLUDED.home_team,
           away_team = EXCLUDED.away_team,
           played_at = EXCLUDED.played_at,
           venue = EXCLUDED.venue,
           home_score = EXCLUDED.home_score,
           away_score = EXCLUDED.away_score,
           status = EXCLUDED.status,
           updated_at = NOW()
         RETURNING ${matchColumns}`,
        [input.competitionId, externalId, match.homeTeam, match.awayTeam,
          match.playedAt ?? null, match.venue ?? null, match.homeScore ?? null,
          match.awayScore ?? null, scoresPresent ? "played" : "scheduled"]
      );
      const savedMatch =
  mapMatch(
    result.rows[0] as Record<string, unknown>
  );

await saveMatchSource(
  client,
  savedMatch.id,
  ResultSource.MANUAL,
  SOURCE_PRIORITY.manual,
  null,
  savedMatch.homeScore,
  savedMatch.awayScore
);
const resolution =
  await resolveMatch(savedMatch.id);

console.log(
  "Resolution:",
  resolution
);
if (resolution) {
  await client.query(
    `
      UPDATE matches
SET
  official_source = $2,
  home_score = $3,
  away_score = $4,
  source = $5,
  verification_status = $6,
  conflict_detected = $7,
  conflict_reasons = $8
WHERE id = $1
    `,
    [
  savedMatch.id,
  resolution.officialSource,
  resolution.homeScore,
  resolution.awayScore,
  resolution.officialSource,

  resolution.conflictDetected
    ? "conflict"
    : "official",

  resolution.conflictDetected,

  JSON.stringify(resolution.reasons)
]
  );
}
saved.push(savedMatch);

}

await client.query("COMMIT");
return saved;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function syncExternalResults(
  associationId: number,
  competition: FpfCompetition,
  matches: FpfMatch[],
source: ResultSource,
sourcePriority: number
): Promise<{ localCompetitionId: number; saved: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const possibleCompetitions = await client.query<{ id: number; name: string; fpf_competition_id: number | null }>(
      `SELECT id, name, fpf_competition_id
       FROM competitions
       WHERE fpf_competition_id = $1 OR (season = $2 AND sport = $3)
       FOR UPDATE`,
      [competition.fpfCompetitionId, competition.season, competition.sport]
    );
    const existing = possibleCompetitions.rows.find((row) =>
      Number(row.fpf_competition_id) === competition.fpfCompetitionId ||
      normalizeCompetitionName(row.name) === normalizeCompetitionName(competition.name)
    );
    let localCompetitionId: number;
    if (existing) {
      localCompetitionId = Number(existing.id);
      await client.query(
        `UPDATE competitions
         SET name = $1, season = $2, sport = $3, active = TRUE,
             fpf_competition_id = $4, fpf_season_id = $5,
             fpf_association_id = $6, updated_at = NOW()
         WHERE id = $7`,
        [competition.name, competition.season, competition.sport,
          competition.fpfCompetitionId, competition.seasonId, associationId, localCompetitionId]
      );
    } else {
      const competitionResult = await client.query<{ id: number }>(
        `INSERT INTO competitions (
           name, season, sport, active, fpf_competition_id, fpf_season_id, fpf_association_id
         ) VALUES ($1, $2, $3, TRUE, $4, $5, $6)
         RETURNING id`,
        [competition.name, competition.season, competition.sport,
          competition.fpfCompetitionId, competition.seasonId, associationId]
      );
      localCompetitionId = Number(competitionResult.rows[0]!.id);
    }

    const manualCandidates = await client.query<{
      id: number;
      home_team: string;
      away_team: string;
      played_at: Date;
    }>(
      `SELECT id, home_team, away_team, played_at FROM matches
       WHERE competition_id = $1 AND source = 'manual' AND status = 'scheduled'
         AND home_score IS NULL AND away_score IS NULL AND played_at IS NOT NULL
       FOR UPDATE`,
      [localCompetitionId]
    );
    const placeholderCandidates = await client.query<{ id: number }>(
      `SELECT id FROM matches
       WHERE competition_id = $1 AND source = 'fpf' AND status = 'scheduled'
         AND home_score IS NULL AND away_score IS NULL
         AND home_team = '1º ENCONTRO -' AND away_team = 'Jogos'
       ORDER BY id FOR UPDATE`,
      [localCompetitionId]
    );

    for (const match of matches) {
      const externalId = `fpf:${match.fpfMatchId}`;
      const matchDay = match.playedAt?.slice(0, 10);
      const manualIndex = manualCandidates.rows.findIndex((row) =>
        normalizeTeamName(row.home_team) === normalizeTeamName(match.homeTeam) &&
        normalizeTeamName(row.away_team) === normalizeTeamName(match.awayTeam) &&
        row.played_at.toISOString().slice(0, 10) === matchDay
      );

      if (manualIndex >= 0) {
console.log(
  "SYNC_MATCH",
  externalId,
  match.homeTeam,
  "vs",
  match.awayTeam
);        
const [manualMatch] = manualCandidates.rows.splice(manualIndex, 1);
        const occupiedId = await client.query(
          "SELECT id FROM matches WHERE external_id = $1 AND id <> $2",
          [externalId, manualMatch!.id]
        );
        if (!occupiedId.rowCount) {
          await client.query(
            `UPDATE matches SET external_id = $1, home_team = $2, away_team = $3,
               group_name = $4, played_at = $5, venue = $6, home_score = $7, away_score = $8,
               status = $9, source = 'fpf', updated_at = NOW() WHERE id = $10`,
            [externalId, match.homeTeam, match.awayTeam, match.groupName, match.playedAt, match.venue,
              match.homeScore, match.awayScore, match.status, manualMatch!.id]
          );
          continue;
        }
      }
const existingFpfMatch = await client.query<{
  id: number;
}>(
  `
    SELECT id
    FROM matches
    WHERE competition_id = $1
      AND source = 'fpf'
      AND LOWER(home_team) = LOWER($2)
      AND LOWER(away_team) = LOWER($3)
      AND DATE(played_at) = DATE($4)
    LIMIT 1
    FOR UPDATE
  `,
  [
    localCompetitionId,
    match.homeTeam,
    match.awayTeam,
    match.playedAt
  ]
);
if (existingFpfMatch.rowCount) {

  const duplicateExternalId = await client.query(
    `
      SELECT id
      FROM matches
      WHERE external_id = $1
        AND id <> $2
    `,
    [
      externalId,
      existingFpfMatch.rows[0].id
    ]
  );

  if ((duplicateExternalId.rowCount ?? 0) > 0) {
    console.warn(
      "SKIPPED_DUPLICATE_EXTERNAL_ID",
      externalId,
      match.homeTeam,
      match.awayTeam
    );

    continue;
  }

  await client.query(
    `
      UPDATE matches
      SET
        external_id = $1,
        group_name = $2,
        played_at = $3,
        venue = $4,
        home_score = $5,
        away_score = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $8
    `,
    [
      externalId,
      match.groupName,
      match.playedAt,
      match.venue,
      match.homeScore,
      match.awayScore,
      match.status,
      existingFpfMatch.rows[0].id
    ]
  );

  continue;
}
const scheduledFpfMatch = await client.query<{
  id: number;
}>(
  `
    SELECT id
    FROM matches
    WHERE competition_id = $1
      AND source = 'fpf'
      AND status = 'scheduled'
      AND home_score IS NULL
      AND away_score IS NULL
      AND LOWER(home_team) = LOWER($2)
      AND LOWER(away_team) = LOWER($3)
      AND DATE(played_at) = DATE($4)
    LIMIT 1
    FOR UPDATE
  `,
  [
    localCompetitionId,
    match.homeTeam,
    match.awayTeam,
    match.playedAt
  ]
);
if (scheduledFpfMatch.rowCount && scheduledFpfMatch.rows[0]) {

  const existingExternalId = await client.query(
    `
    SELECT id
    FROM matches
    WHERE external_id = $1
      AND id <> $2
    `,
    [
      externalId,
      scheduledFpfMatch.rows[0].id
    ]
  );

  if ((existingExternalId.rowCount ?? 0) > 0) {
    console.warn(
      "SKIPPED_DUPLICATE_EXTERNAL_ID",
      externalId,
      match.homeTeam,
      match.awayTeam
    );

    continue;
  }
}

if (scheduledFpfMatch.rowCount) {
  await client.query(
    `
      UPDATE matches
      SET
        external_id = $1,
        group_name = $2,
        played_at = $3,
        venue = $4,
        home_score = $5,
        away_score = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $8
    `,
    [
      externalId,
      match.groupName,
      match.playedAt,
      match.venue,
      match.homeScore,
      match.awayScore,
      match.status,
      scheduledFpfMatch.rows[0].id
    ]
  );

  continue;
}      
const placeholder = placeholderCandidates.rows.shift();
const duplicatePlaceholder = await client.query(
  `
    SELECT id
    FROM matches
    WHERE external_id = $1
  `,
  [externalId]
);

if ((duplicatePlaceholder.rowCount ?? 0) > 0) {
  console.warn(
    "SKIPPED_DUPLICATE_EXTERNAL_ID_PLACEHOLDER",
    externalId,
    match.homeTeam,
    match.awayTeam
  );

  continue;
} 
if (placeholder) {

  const existingExternalId = await client.query(
    `
      SELECT id
      FROM matches
      WHERE external_id = $1
        AND id <> $2
    `,
    [
      externalId,
      placeholder.id
    ]
  );

  if ((existingExternalId.rowCount ?? 0) > 0) {
    console.warn(
      "SKIPPED_DUPLICATE_EXTERNAL_ID_PLACEHOLDER",
      externalId,
      match.homeTeam,
      match.awayTeam
    );

    continue;
  }

  try {
    await client.query(
      `UPDATE matches SET external_id = $1,
         home_team = $2,
         away_team = $3,
         group_name = $4,
         played_at = $5,
         venue = $6,
         home_score = $7,
         away_score = $8,
         status = $9,
         updated_at = NOW()
       WHERE id = $10`,
      [
        externalId,
        match.homeTeam,
        match.awayTeam,
        match.groupName,
        match.playedAt,
        match.venue,
        match.homeScore,
        match.awayScore,
        match.status,
        placeholder.id
      ]
    );
  } catch (error) {
    console.error(
      "CONFLICT",
      {
        externalId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        playedAt: match.playedAt,
        placeholderId: placeholder.id
      }
    );
    throw error;
  }

  continue;
}

      const savedResult = await client.query(
        `INSERT INTO matches (
           competition_id, external_id, home_team, away_team, group_name, played_at, venue,
           home_score, away_score, status, source
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'fpf')
         ON CONFLICT (external_id) DO UPDATE SET
           competition_id = EXCLUDED.competition_id,
           home_team = EXCLUDED.home_team,
           away_team = EXCLUDED.away_team,
           group_name = EXCLUDED.group_name,
           played_at = EXCLUDED.played_at,
           venue = EXCLUDED.venue,
           home_score = EXCLUDED.home_score,
           away_score = EXCLUDED.away_score,
           status = EXCLUDED.status,
           updated_at = NOW()
RETURNING id`,
        [localCompetitionId, externalId, match.homeTeam, match.awayTeam, match.groupName,
          match.playedAt, match.venue, match.homeScore, match.awayScore, match.status]
      );
const matchId = Number(
  savedResult.rows[0]?.id
);

await saveMatchSource(
  client,
  matchId,
  source,
  sourcePriority,
  null,
  match.homeScore,
  match.awayScore
);

const resolution =
  await resolveMatch(matchId);

console.log(
  "Resolution:",
  resolution
);
if (resolution) {
  await client.query(
    `
      UPDATE matches
SET
  official_source = $2,
  home_score = $3,
  away_score = $4,
  source = $5,
  verification_status = $6,
  conflict_detected = $7
WHERE id = $1
    `,
    [
  matchId,

  resolution.officialSource,
  resolution.homeScore,
  resolution.awayScore,
  resolution.officialSource,

  resolution.conflictDetected
    ? "conflict"
    : "official",

  resolution.conflictDetected
]
  );
}
    }
    await client.query("COMMIT");
    return { localCompetitionId, saved: matches.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function syncAfvrResults(
  associationId: number,
  competition: FpfCompetition,
  matches: FpfMatch[]
): Promise<{ localCompetitionId: number; saved: number }> {

  return syncExternalResults(
    associationId,
    competition,
    matches,
    ResultSource.AFVR,
    SOURCE_PRIORITY.afvr
  );
}

export async function syncFpfResults(
  associationId: number,
  competition: FpfCompetition,
  matches: FpfMatch[]
): Promise<{ localCompetitionId: number; saved: number }> {

  return syncExternalResults(
    associationId,
    competition,
    matches,
    ResultSource.FPF,
    SOURCE_PRIORITY.fpf
  );
}
export async function getDashboardSummary() {
  const result = await pool.query(`
    SELECT
  id,
  competition_id,
  home_team,
  away_team,
  played_at,
  home_score,
  away_score,
  status,
  source,
  conflict_detected,
  official_source,
  verification_status,
  conflict_reasons
FROM matches
WHERE
  home_team IS NOT NULL
  AND away_team IS NOT NULL
  AND TRIM(home_team) <> ''
  AND TRIM(away_team) <> ''
  AND LOWER(TRIM(home_team)) NOT LIKE '%não iniciado%'
  AND LOWER(TRIM(away_team)) NOT LIKE '%não iniciado%'
  AND LOWER(TRIM(home_team)) NOT LIKE '%nao iniciado%'
  AND LOWER(TRIM(away_team)) NOT LIKE '%nao iniciado%'
ORDER BY played_at DESC NULLS LAST
LIMIT 5000
  `);

  return result.rows;
}

