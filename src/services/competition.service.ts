import * as repository
  from "../repositories/competition.repository";

import type {
  CreateCompetitionDTO,
  PatchCompetitionDTO,
  UpdateCompetitionDTO
} from "../validators/competition.validator";

export function getAll() {
  return repository.getAll();
}

export function getById(
  id: number
) {
  return repository.getById(id);
}

export function create(
  data: CreateCompetitionDTO
) {
  return repository.create(data);
}

export function update(
  id: number,
  data: UpdateCompetitionDTO
) {
  return repository.update(id, data);
}

export function patch(
  id: number,
  data: PatchCompetitionDTO
) {
  return repository.patch(id, data);
}

export function remove(
  id: number
) {
  return repository.remove(id);
}