import { Router } from "express";

import * as controller from "../controllers/result.controller";
import { requireAdmin } from "../middleware/require-admin";

const router = Router();
router.get(
  "/conflicts",
  requireAdmin,
  controller.getConflicts
);

router.get("/", controller.getByCompetition);
router.get("/standings", controller.getStandings);

router.get("/fpf/competitions", controller.getFpfCompetitions);

router.post("/fpf/sync", requireAdmin, controller.syncFpf);
router.post("/afvr/sync", requireAdmin, controller.syncAfvr);

router.get("/fpf/sync-all/status", requireAdmin, controller.getFpfBulkSyncStatus);
router.post("/fpf/sync-all", requireAdmin, controller.startFpfBulkSync);

router.post("/manual", requireAdmin, controller.saveManual);
router.post("/upload", requireAdmin, controller.uploadManual);

export default router;
