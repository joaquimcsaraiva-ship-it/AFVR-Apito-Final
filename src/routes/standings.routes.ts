import { Router } from "express";

import * as controller
  from "../controllers/standings.controller";

const router = Router();

router.get(
  "/:competitionId",
  controller.getByCompetitionId
);

export default router;