import pool from "../../src/config/database";
import { rebuildStandings } from "../../src/services/standings.service";

jest.mock("../../src/config/database", () => ({
  __esModule: true,
  default: {
    connect: jest.fn()
  }
}));

describe("standings.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("ignora jogo sem serie numa competicao que possui series", async () => {
    const insertedStandings: unknown[][] = [];

    const query = jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql === "BEGIN") {
        return { rows: [] };
      }

      if (sql.includes("TRUNCATE TABLE standings")) {
        return { rows: [] };
      }

      if (
        sql.includes("FROM matches") &&
        sql.includes("status = 'played'")
      ) {
        return {
          rows: [
            {
              competition_id: 10,
              group_name: "Zona Norte",
              home_team: "Equipa Norte A",
              away_team: "Equipa Norte B",
              home_score: 2,
              away_score: 1
            },
            {
              competition_id: 10,
              group_name: "Zona Centro",
              home_team: "Equipa Centro A",
              away_team: "Equipa Centro B",
              home_score: 1,
              away_score: 1
            },
            {
              competition_id: 10,
              group_name: "Zona Sul",
              home_team: "Equipa Sul A",
              away_team: "Equipa Sul B",
              home_score: 0,
              away_score: 3
            },
            {
              competition_id: 10,
              group_name: null,
              home_team: "Equipa Sem Serie A",
              away_team: "Equipa Sem Serie B",
              home_score: 4,
              away_score: 2
            }
          ]
        };
      }

      if (sql.includes("INSERT INTO standings")) {
        insertedStandings.push(params ?? []);
        return { rows: [] };
      }

      if (sql === "COMMIT" || sql === "ROLLBACK") {
        return { rows: [] };
      }

      return { rows: [] };
    });

    const release = jest.fn();

    (pool.connect as jest.Mock).mockResolvedValue({
      query,
      release
    });

    const warn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    await rebuildStandings();

    const groupNames = insertedStandings.map(
      params => params[1]
    );

    const teamNames = insertedStandings.map(
      params => params[2]
    );

    expect(groupNames).toContain("Zona Norte");
    expect(groupNames).toContain("Zona Centro");
    expect(groupNames).toContain("Zona Sul");

    expect(groupNames).not.toContain("");
    expect(groupNames).not.toContain(null);

    expect(teamNames).not.toContain("Equipa Sem Serie A");
    expect(teamNames).not.toContain("Equipa Sem Serie B");

    expect(warn).toHaveBeenCalledWith(
      "STANDINGS_SKIP_MATCH_WITHOUT_GROUP",
      expect.objectContaining({
        competitionId: 10,
        homeTeam: "Equipa Sem Serie A",
        awayTeam: "Equipa Sem Serie B"
      })
    );

    expect(query).toHaveBeenCalledWith("COMMIT");
    expect(release).toHaveBeenCalled();

    warn.mockRestore();
  });
});
      