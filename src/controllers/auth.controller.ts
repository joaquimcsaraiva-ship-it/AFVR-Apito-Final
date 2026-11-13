import type { Request, Response } from "express";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  createAdminToken,
  isValidAdminToken,
  readAdminToken,
  verifyAdminCredentials
} from "../services/auth.service";

const attempts = new Map<string, { count: number; startedAt: number }>();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function cookieOptions(req: Request): string {
  return `Path=/; HttpOnly; SameSite=Strict${req.secure ? "; Secure" : ""}`;
}

export function getSession(req: Request, res: Response): void {
  const token = readAdminToken(req.headers.cookie);
  res.json({ authenticated: Boolean(token && isValidAdminToken(token)) });
}

export function login(req: Request, res: Response): void {
  const address = req.ip ?? "unknown";
  const current = attempts.get(address);
  const now = Date.now();
  if (current && now - current.startedAt < ATTEMPT_WINDOW_MS && current.count >= MAX_ATTEMPTS) {
    res.status(429).json({ message: "Demasiadas tentativas. Aguarde 15 minutos e tente novamente." });
    return;
  }

  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (username.length > 80 || password.length > 200) {
    res.status(400).json({ message: "Utilizador ou palavra-passe inválidos." });
    return;
  }
  if (!verifyAdminCredentials(username, password)) {
    const next = current && now - current.startedAt < ATTEMPT_WINDOW_MS
      ? { ...current, count: current.count + 1 }
      : { count: 1, startedAt: now };
    attempts.set(address, next);
    res.status(401).json({ message: "Utilizador ou palavra-passe incorretos." });
    return;
  }

  attempts.delete(address);
  try {
    const token = createAdminToken(username);
    res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=${encodeURIComponent(token)}; ${cookieOptions(req)}; Max-Age=${ADMIN_SESSION_SECONDS}`);
    res.json({ authenticated: true, username });
  } catch (error) {
    res.status(503).json({ message: error instanceof Error ? error.message : "Não foi possível iniciar sessão." });
  }
}

export function logout(req: Request, res: Response): void {
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=; ${cookieOptions(req)}; Max-Age=0`);
  res.json({ authenticated: false });
}
