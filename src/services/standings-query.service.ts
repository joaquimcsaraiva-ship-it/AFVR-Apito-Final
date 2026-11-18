import * as repository
  from "../repositories/standings.repository";

export function getByCompetitionId(
  competitionId: number
) {
  return repository.getByCompetitionId(
    competitionId
  );
}