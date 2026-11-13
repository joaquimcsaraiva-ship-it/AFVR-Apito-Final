import type {
  Request,
  Response
} from "express";

import * as service
  from "../services/competition.service";

function parseId(
  value: string | string[] | undefined
): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function getAll(
  _req: Request,
  res: Response
): Promise<void> {
  const competitions =
    await service.getAll();

  res.json(competitions);
}

export async function getById(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (id === null) {
    res.status(400).json({
      message: "ID inválido"
    });
    return;
  }

  const competition =
    await service.getById(id);

  if (!competition) {
    res.status(404).json({
      message: "Competição não encontrada"
    });
    return;
  }

  res.json(competition);
}

export async function create(
  req: Request,
  res: Response
): Promise<void> {
  const competition =
    await service.create(req.body);

  res.status(201).json(competition);
}

export async function update(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (id === null) {
    res.status(400).json({
      message: "ID inválido"
    });
    return;
  }

  const competition =
    await service.update(id, req.body);

  if (!competition) {
    res.status(404).json({
      message: "Competição não encontrada"
    });
    return;
  }

  res.json(competition);
}

export async function patch(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (id === null) {
    res.status(400).json({
      message: "ID inválido"
    });
    return;
  }

  const competition =
    await service.patch(id, req.body);

  if (!competition) {
    res.status(404).json({
      message: "Competição não encontrada"
    });
    return;
  }

  res.json(competition);
}

export async function remove(
  req: Request,
  res: Response
): Promise<void> {
  const id = parseId(req.params.id);

  if (id === null) {
    res.status(400).json({
      message: "ID inválido"
    });
    return;
  }

  const removed =
    await service.remove(id);

  if (!removed) {
    res.status(404).json({
      message: "Competição não encontrada"
    });
    return;
  }

  res.status(204).send();
}
