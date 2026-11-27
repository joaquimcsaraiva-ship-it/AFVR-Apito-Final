import request from "supertest";
import app from "../src/app";
import pool from "../src/config/database";

describe("Standings API", () => {
  test("GET /api/results/standings responde", async () => {
    const response = await request(app)
      .get("/api/results/standings")
      .query({
        competitionId: 6
      });

    expect([200, 400, 404]).toContain(response.status);
  });

    test("GET /api/results/standings devolve classificacoes quando responde 200", async () => {
    const response = await request(app)
      .get("/api/results/standings")
      .query({
        competitionId: 6
      });

    if (response.status === 200) {
      expect(response.body).toEqual(
        expect.objectContaining({
          standings: expect.any(Array),
          hasPlayedMatches: expect.any(Boolean)
        })
      );
    }
  });
});

afterAll(async () => {
  await pool.end();
});