const mockQuery = jest.fn();

jest.mock("../../src/config/database", () => ({
  __esModule: true,
  default: {
    query: mockQuery
  }
}));

import * as repository from "../../src/repositories/result.repository";

describe("result.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listByCompetition devolve jogos", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          id: 1,
          competition_id: 10,
          home_team: "Casa",
          away_team: "Fora",
          group_name: null,
          played_at: "2026-11-12T10:00:00.000Z",
          venue: "Campo",
          home_score: 2,
          away_score: 1,
          status: "played",
          source: "manual",
          updated_at: "2026-11-12T10:00:00.000Z"
        }
      ]
    });

    const result = await repository.listByCompetition(10);

    expect(result).toHaveLength(1);
    expect(result[0].homeTeam).toBe("Casa");
    expect(result[0].competitionId).toBe(10);
  });

  it("standingsByCompetition calcula vitória", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          home_team: "Casa",
          away_team: "Fora",
          group_name: null,
          home_score: 2,
          away_score: 1,
          status: "played"
        }
      ]
    });

    const standings =
      await repository.standingsByCompetition(1);

    expect(standings).toHaveLength(2);

    const winner = standings.find(
      (item) => item.team === "Casa"
    );

    expect(winner?.points).toBe(3);
    expect(winner?.wins).toBe(1);
  });

  it("standingsByCompetition calcula empate", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          home_team: "Casa",
          away_team: "Fora",
          group_name: null,
          home_score: 1,
          away_score: 1,
          status: "played"
        }
      ]
    });

    const standings =
      await repository.standingsByCompetition(1);

    const home =
      standings.find((item) => item.team === "Casa");

    expect(home?.points).toBe(1);
    expect(home?.draws).toBe(1);
  });

  it("ignora jogos não realizados", async () => {
    mockQuery.mockResolvedValue({
      rows: [
        {
          home_team: "Casa",
          away_team: "Fora",
          group_name: null,
          home_score: null,
          away_score: null,
          status: "scheduled"
        }
      ]
    });

    const standings =
      await repository.standingsByCompetition(1);

    const home =
      standings.find((item) => item.team === "Casa");

    expect(home?.played).toBe(0);
  });
});