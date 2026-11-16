import request from "supertest";
import app from "../src/app";
import pool from "../src/config/database";

describe("Result Controller Validation", () => {
  test("GET /api/results sem competitionId devolve 400", async () => {
    const response = await request(app)
      .get("/api/results");

    expect(response.status).toBe(400);
  });

  test("GET /api/results com competitionId inválido devolve 400", async () => {
    const response = await request(app)
      .get("/api/results")
      .query({
        competitionId: -1
      });

    expect(response.status).toBe(400);
  });

  test("GET /api/results/standings sem competitionId devolve 400", async () => {
    const response = await request(app)
      .get("/api/results/standings");

    expect(response.status).toBe(400);
  });

  test("GET /api/results/standings com competitionId inválido devolve 400", async () => {
    const response = await request(app)
      .get("/api/results/standings")
      .query({
        competitionId: -1
      });

    expect(response.status).toBe(400);
  });

  test("GET /api/results/fpf/competitions responde", async () => {
  const response = await request(app)
    .get("/api/results/fpf/competitions");

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
  test("GET /api/results/conflicts sem autenticação devolve erro", async () => {
    const response = await request(app)
      .get("/api/results/conflicts");

    expect([401, 403]).toContain(response.status);
  });

  test("GET /api/results/conflicts/abc devolve erro", async () => {
    const response = await request(app)
      .get("/api/results/conflicts/abc");

    expect([400, 401, 403]).toContain(response.status);
  });
});

afterAll(async () => {
  await pool.end();
});