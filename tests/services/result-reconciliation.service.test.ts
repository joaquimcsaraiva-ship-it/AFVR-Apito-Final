import {
  reconcileMatchResults
} from "../../src/services/result-reconciliation.service";

describe("result reconciliation", () => {
  test("sem conflito", () => {
    const result = reconcileMatchResults(
      {
        homeTeam: "GD Chaves",
        awayTeam: "Vila Real",
        homeGoals: 2,
        awayGoals: 1
      },
      {
        homeTeam: "GD Chaves",
        awayTeam: "Vila Real",
        homeGoals: 2,
        awayGoals: 1
      }
    );

    expect(result.hasConflict).toBe(false);
    expect(result.reasons).toHaveLength(0);
  });

  test("conflito de resultado", () => {
    const result = reconcileMatchResults(
      {
        homeTeam: "GD Chaves",
        awayTeam: "Vila Real",
        homeGoals: 2,
        awayGoals: 1
      },
      {
        homeTeam: "GD Chaves",
        awayTeam: "Vila Real",
        homeGoals: 1,
        awayGoals: 1
      }
    );

    expect(result.hasConflict).toBe(true);
    expect(result.reasons).toContain(
      "home_goals_mismatch"
    );
  });

  test("conflito de equipa", () => {
    const result = reconcileMatchResults(
      {
        homeTeam: "GD Chaves",
        awayTeam: "Vila Real",
        homeGoals: 2,
        awayGoals: 1
      },
      {
        homeTeam: "GD Chaves",
        awayTeam: "Mesão Frio",
        homeGoals: 2,
        awayGoals: 1
      }
    );

    expect(result.hasConflict).toBe(true);
    expect(result.reasons).toContain(
      "away_team_mismatch"
    );
  });
});