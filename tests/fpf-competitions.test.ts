import request from "supertest";
import app from "../src/app";
import pool from "../src/config/database";

describe("FPF Competitions API", () => {
  test("GET /api/results/fpf/competitions responde", async () => {
    const response = await request(app)
      .get("/api/results/fpf/competitions");

    expect([200, 400]).toContain(response.status);
  });
});

afterAll(async () => {
  await pool.end();
});