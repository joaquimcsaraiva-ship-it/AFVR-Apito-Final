import { Router } from "express";
import * as controller from "../controllers/auth.controller";

const router = Router();
router.get("/session", controller.getSession);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
export default router;
