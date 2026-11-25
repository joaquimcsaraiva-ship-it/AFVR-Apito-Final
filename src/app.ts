import express from "express";
import path from "node:path";

import pool from "./config/database";
import authRoutes from "./routes/auth.routes";
import competitionRoutes from "./routes/competition.routes";
import resultRoutes from "./routes/result.routes";
import standingsRoutes from "./routes/standings.routes";

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "AFVR Resultados"
  });
});

app.get("/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ready", service: "AFVR Resultados" });
  } catch {
    res.status(503).json({ status: "unavailable", service: "AFVR Resultados" });
  }
});

app.get(["/dashboard", "/competitions", "/results"], (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.get("/team", (_req, res) => {
  res.sendFile(
    path.join(
      process.cwd(),
      "public",
      "team.html"
    )
  );
});

app.get("/test-search", (_req, res) => {
  res.json({
    ok: true,
    message: "search route test"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/standings", standingsRoutes);
export default app;