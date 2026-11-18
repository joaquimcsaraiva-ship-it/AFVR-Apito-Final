import type { Request, Response } from "express";

import * as standingsService
  from "../services/standings-query.service";

export async function getByCompetitionId(
  req: Request,
  res: Response
) {
  const competitionId = Number(req.params.competitionId);

  if (Number.isNaN(competitionId)) {
    return res.status(400).json({
      message: "competitionId inválido"
    });
  }

  const standings =
    await standingsService.getByCompetitionId(
      competitionId
    );

  return res.json(standings);
}