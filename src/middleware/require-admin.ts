import type { Request, Response, NextFunction } from "express";
import { isValidAdminToken, readAdminToken } from "../services/auth.service";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = readAdminToken(req.headers.cookie);
  if (!token || !isValidAdminToken(token)) {
    res.status(401).json({ message: "Inicie sessão de administração para executar esta operação." });
    return;
  }
  next();
}
