import { resolveMatch } from "../../src/services/conflict-resolution.service";
import * as repository from "../../src/repositories/match-source.repository";
import { ResultSource } from "../../src/types/result-source";

jest.mock(
  "../../src/repositories/match-source.repository"
);

describe("conflict-resolution.service", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("detecta conflito quando os resultados diferem", async () => {

    jest
      .spyOn(repository, "getMatchSources")
      .mockResolvedValue([
        {
          id: 1,
          matchId: 10,
          source: ResultSource.FPF,
          sourcePriority: 90,
          sourceUrl: null,
          homeScore: 3,
          awayScore: 1,
          verified: true
        },
        {
          id: 2,
          matchId: 10,
          source: ResultSource.MANUAL,
          sourcePriority: 20,
          sourceUrl: null,
          homeScore: 2,
          awayScore: 2,
          verified: false
        }
      ]);

    const result = await resolveMatch(10);

    expect(result?.conflictDetected).toBe(true);
    expect(result?.officialSource).toBe(
      ResultSource.FPF
    );
    expect(result?.homeScore).toBe(3);
    expect(result?.awayScore).toBe(1);
  });

  it("não detecta conflito quando os resultados coincidem", async () => {

    jest
      .spyOn(repository, "getMatchSources")
      .mockResolvedValue([
        {
          id: 1,
          matchId: 10,
          source: ResultSource.FPF,
          sourcePriority: 90,
          sourceUrl: null,
          homeScore: 3,
          awayScore: 1,
          verified: true
        },
        {
          id: 2,
          matchId: 10,
          source: ResultSource.MANUAL,
          sourcePriority: 20,
          sourceUrl: null,
          homeScore: 3,
          awayScore: 1,
          verified: false
        }
      ]);

    const result = await resolveMatch(10);

    expect(result?.conflictDetected).toBe(false);
    expect(result?.officialSource).toBe(
      ResultSource.FPF
    );
  });

});