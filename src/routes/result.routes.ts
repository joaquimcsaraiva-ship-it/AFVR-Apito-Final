import { Router } from "express";

import * as controller from "../controllers/result.controller";
import { requireAdmin } from "../middleware/require-admin";
import { syncClubResults }
from "../services/club-sync.service";
const router = Router();
router.get(
  "/conflicts",
  requireAdmin,
  controller.getConflicts
);
router.get(
  "/conflicts/:matchId",
  requireAdmin,
  controller.getConflictDetails
);
router.get(
  "/dashboard",
  controller.getDashboard
);
router.get(
  "/search",
  (_req, res) => {
    res.json({
      route: "search",
      ok: true
    });
  }
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
router.post(
  "/clubs/sync",
  requireAdmin,
  async (_req, res) => {
    const result = await syncClubResults();
    res.json(result);
  }
);
export default router;
