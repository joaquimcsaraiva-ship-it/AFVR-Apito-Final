import { Router } from "express";

import * as controller
  from "../controllers/competition.controller";

import { validate }
  from "../middleware/validate";

import {
  createCompetitionSchema,
  patchCompetitionSchema,
  updateCompetitionSchema
} from "../validators/competition.validator";
import { requireAdmin } from "../middleware/require-admin";

const router = Router();

router.get(
  "/",
  controller.getAll
);

router.get(
  "/:id",
  controller.getById
);

router.post(
  "/",
  requireAdmin,
  validate(createCompetitionSchema),
  controller.create
);

router.put(
  "/:id",
  requireAdmin,
  validate(updateCompetitionSchema),
  controller.update
);

router.patch(
  "/:id",
  requireAdmin,
  validate(patchCompetitionSchema),
  controller.patch
);

router.delete(
  "/:id",
  requireAdmin,
  controller.remove
);

export default router;
