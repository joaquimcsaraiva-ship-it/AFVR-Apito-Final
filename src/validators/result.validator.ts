import { z } from "zod";

const positiveId = z.coerce.number().int().positive();

export const fpfCompetitionsQuerySchema = z.object({
  associationId: positiveId.default(236),
  seasonId: positiveId.default(106)
});

export const fpfSyncSchema = z.object({
  associationId: positiveId,
  seasonId: positiveId,
  fpfCompetitionId: positiveId
});

const matchInputSchema = z.object({
  homeTeam: z.string().trim().min(1).max(180),
  awayTeam: z.string().trim().min(1).max(180),
  playedAt: z.string().datetime().nullable().optional(),
  venue: z.string().trim().max(250).nullable().optional(),
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional()
}).refine(
  (match) => (match.homeScore == null) === (match.awayScore == null),
  { message: "Indique os dois golos ou deixe ambos vazios." }
);

export const manualResultSchema = z.object({
  competitionId: positiveId,
  match: matchInputSchema
});

export const resultUploadSchema = z.object({
  competitionId: positiveId,
  matches: z.array(matchInputSchema).min(1).max(2000)
});

export type FpfSyncDTO = z.infer<typeof fpfSyncSchema>;
export type ManualResultDTO = z.infer<typeof manualResultSchema>;
export type ResultUploadDTO = z.infer<typeof resultUploadSchema>;
