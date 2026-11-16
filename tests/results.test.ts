import request from "supertest";
import app from "../src/app";

describe("Resultados API", () => {
  test("GET /health responde", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET /api/competitions responde", async () => {
    const response = await request(app).get("/api/competitions");

    expect(response.status).toBe(200);
  });
});