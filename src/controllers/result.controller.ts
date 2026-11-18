import { rebuildStandings }
  from "../services/standings.service";
import type { Request, Response } from "express";
import {
  fetchAfvrResults
} from "../services/afvr.service";
import * as repository from "../repositories/result.repository";
import {
  fetchFpfCompetitionMatches,
  fetchFpfMatchesForCompetition,
  listFpfCompetitions
} from "../services/fpf.service";
import {
  fpfCompetitionsQuerySchema,
  fpfSyncSchema,
  manualResultSchema,
  resultUploadSchema
} from "../validators/result.validator";

interface FpfBulkSyncStatus {
  state: "idle" | "running" | "completed" | "failed";
  associationId?: number;
  seasonId?: number;
  total: number;
  completed: number;
  competitionsSynced: number;
  matchesSaved: number;
  failed: number;
  currentCompetition?: string;
  errors: string[];
}

let fpfBulkSync: FpfBulkSyncStatus = {
  state: "idle", total: 0, completed: 0, competitionsSynced: 0,
  matchesSaved: 0, failed: 0, errors: []
};

function sendValidationError(res: Response, message: string): void {
  res.status(400).json({ message });
}

export async function getByCompetition(req: Request, res: Response): Promise<void> {
  const competitionId = Number(req.query.competitionId);
  if (!Number.isInteger(competitionId) || competitionId <= 0) {
    sendValidationError(res, "Indique uma competição válida.");
    return;
  }
  res.json(await repository.listByCompetition(competitionId));
}

export async function getStandings(
  req: Request,
  res: Response
): Promise<void> {

  const competitionId = Number(req.query.competitionId);

  if (!Number.isInteger(competitionId) || competitionId <= 0) {
    sendValidationError(
      res,
      "Indique uma competição válida."
    );
    return;
  }

  const standings =
    await repository.standingsByCompetition(
      competitionId
    );

  if (standings.length === 0) {
    res.json({
      standings: [],
      hasPlayedMatches: false,
      message:
        "Ainda não existem jogos concluídos nesta competição."
    });

    return;
  }

  res.json({
    standings,
    hasPlayedMatches: true
  });
}


export async function getFpfCompetitions(req: Request, res: Response): Promise<void> {
  const parsed = fpfCompetitionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    sendValidationError(res, "Os identificadores da associação e época devem ser números positivos.");
    return;
  }
  try {
    const competitions = await listFpfCompetitions(parsed.data.associationId, parsed.data.seasonId);
    res.json(competitions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível consultar a FPF.";
    res.status(502).json({ message });
  }
}

export async function getConflicts(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const conflicts =
      await repository.listConflicts();

    res.json(conflicts);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível consultar os conflitos.";

    res.status(500).json({ message });
  }
}
export async function getConflictDetails(
  req: Request,
  res: Response
): Promise<void> {

  const matchId = Number(req.params.matchId);

  if (!Number.isInteger(matchId)) {
    res.status(400).json({
      message: "MatchId inválido."
    });
    return;
  }

  const details =
    await repository.getConflictDetails(
      matchId
    );

  if (!details) {
    res.status(404).json({
      message: "Jogo não encontrado."
    });
    return;
  }

  res.json(details);
}
export async function syncFpf(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = fpfSyncSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(
      res,
      "Selecione uma competição válida da FPF."
    );
    return;
  }

  try {
    const {
      competition,
      matches,
      skipped
    } = await fetchFpfCompetitionMatches(
      parsed.data
    );

    const saved =
      await repository.syncFpfResults(
        parsed.data.associationId,
        competition,
        matches
      );

await rebuildStandings();
    res.json({
      ...saved,
      competitionName: competition.name,
      season: competition.season,
      skipped,
      sourceUrl: competition.detailsUrl
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível sincronizar os resultados da FPF.";

    res.status(502).json({ message });
  }
}

export async function syncAfvr(
  req: Request,
  res: Response
): Promise<void> {

  const parsed = fpfSyncSchema.safeParse(
    req.body
  );

  if (!parsed.success) {
    sendValidationError(
      res,
      "Selecione uma competição válida."
    );
    return;
  }

  try {

    const { competition } =
      await fetchFpfCompetitionMatches(
        parsed.data
      );

    const matches =
      await fetchAfvrResults(
        parsed.data
      );

    const saved =
      await repository.syncAfvrResults(
        parsed.data.associationId,
        competition,
        matches
      );

    res.json({
      ...saved,
      competitionName: competition.name,
      season: competition.season
    });

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível sincronizar a AFVR.";

    res.status(502).json({
      message
    });
  }
}

export async function getFpfBulkSyncStatus(_req: Request, res: Response): Promise<void> {
  res.json(fpfBulkSync);
}

export async function startFpfBulkSync(req: Request, res: Response): Promise<void> {
  const parsed = fpfCompetitionsQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, "Os identificadores da associação e época devem ser números positivos.");
    return;
  }
  if (fpfBulkSync.state === "running") {
    res.status(409).json({ message: "Já existe uma sincronização FPF em curso." });
    return;
  }

  try {
    const competitions = await listFpfCompetitions(parsed.data.associationId, parsed.data.seasonId);
    fpfBulkSync = {
      state: "running",
      associationId: parsed.data.associationId,
      seasonId: parsed.data.seasonId,
      total: competitions.length,
      completed: 0,
      competitionsSynced: 0,
      matchesSaved: 0,
      failed: 0,
      errors: []
    };
    void (async () => {
      try {
        for (const competition of competitions) {
          fpfBulkSync.currentCompetition = competition.name;
          try {
            const result = await fetchFpfMatchesForCompetition(competition);
            const saved = await repository.syncFpfResults(parsed.data.associationId, competition, result.matches);
            fpfBulkSync.competitionsSynced++;
            fpfBulkSync.matchesSaved += saved.saved;
            if (result.skipped) fpfBulkSync.errors.push(`${competition.name}: ${result.skipped} jogos não foram interpretados.`);
          } catch (error) {
            fpfBulkSync.failed++;
            const message = error instanceof Error ? error.message : "Erro desconhecido.";
            fpfBulkSync.errors.push(`${competition.name}: ${message}`);
          } finally {
            fpfBulkSync.completed++;
          }
        }
        
await rebuildStandings();

fpfBulkSync.state = "completed";
      } catch (error) {
        fpfBulkSync.state = "failed";
        fpfBulkSync.errors.push(error instanceof Error ? error.message : "Não foi possível sincronizar o catálogo FPF.");
      } finally {
        fpfBulkSync.currentCompetition = undefined;
      }
    })();
    res.status(202).json(fpfBulkSync);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível iniciar a sincronização FPF.";
    res.status(502).json({ message });
  }
}

export async function saveManual(req: Request, res: Response): Promise<void> {
  const parsed = manualResultSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues[0]?.message ?? "Preencha corretamente os dados do jogo.");
    return;
  }
  try {
    const saved = await repository.saveManualResults({
      competitionId: parsed.data.competitionId,
      matches: [parsed.data.match]
    });
    res.status(201).json(saved[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível guardar o resultado.";
    res.status(message.includes("não existe") ? 404 : 500).json({ message });
  }
}

export async function uploadManual(req: Request, res: Response): Promise<void> {
  const parsed = resultUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues[0]?.message ?? "O ficheiro contém linhas inválidas.");
    return;
  }
  try {
    const saved = await repository.saveManualResults(parsed.data);
    res.status(201).json({ saved: saved.length, matches: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível importar os resultados.";
    res.status(message.includes("não existe") ? 404 : 500).json({ message });
  }
}
export async function getDashboard(
  _req: Request,
  res: Response
): Promise<void> {

  const matches =
    await repository.getDashboardSummary();

  const nextMatches =
  matches
    .filter(m => m.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.played_at).getTime() -
        new Date(b.played_at).getTime()
    )
    .slice(0, 5);
const lastResults =
  matches
    .filter(
      m =>
        m.status === "played" &&
        m.home_score !== null &&
        m.away_score !== null
    )
    .sort(
      (a, b) =>
        new Date(b.played_at).getTime() -
        new Date(a.played_at).getTime()
    )
    .slice(0, 5);
  res.json({
    totalMatches: matches.length,
    nextMatches,
    lastResults
  });
}