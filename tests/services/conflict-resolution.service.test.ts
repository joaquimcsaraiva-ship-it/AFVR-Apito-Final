import { resolveMatch } from "../../src/services/conflict-resolution.service";
import { getMatchSources } from "../../src/repositories/match-source.repository";

jest.mock("../../src/repositories/match-source.repository", () => ({
  getMatchSources: jest.fn()
}));

const mockedGetMatchSources =
  getMatchSources as jest.MockedFunction<typeof getMatchSources>;

describe("conflict-resolution.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devolve null sem fontes", async () => {
    mockedGetMatchSources.mockResolvedValue([]);

    const result = await resolveMatch(1);

    expect(result).toBeNull();
  });

  test("uma única fonte sem conflito", async () => {
    mockedGetMatchSources.mockResolvedValue([
      {
        source: "fpf",
        sourcePriority: 100,
        homeScore: 2,
        awayScore: 1
      } as any
    ]);

    const result = await resolveMatch(1);

    expect(result).not.toBeNull();
    expect(result?.conflictDetected).toBe(false);
    expect(result?.officialSource).toBe("fpf");
    expect(result?.homeScore).toBe(2);
    expect(result?.awayScore).toBe(1);
  });

  test("duas fontes iguais sem conflito", async () => {
    mockedGetMatchSources.mockResolvedValue([
      {
        source: "fpf",
        sourcePriority: 100,
        homeScore: 2,
        awayScore: 1
      } as any,
      {
        source: "afvr",
        sourcePriority: 90,
        homeScore: 2,
        awayScore: 1
      } as any
    ]);

    const result = await resolveMatch(1);

    expect(result?.conflictDetected).toBe(false);
    expect(result?.officialSource).toBe("fpf");
  });

  test("duas fontes diferentes geram conflito", async () => {
    mockedGetMatchSources.mockResolvedValue([
      {
        source: "fpf",
        sourcePriority: 100,
        homeScore: 2,
        awayScore: 1
      } as any,
      {
        source: "afvr",
        sourcePriority: 90,
        homeScore: 1,
        awayScore: 1
      } as any
    ]);

    const result = await resolveMatch(1);

    expect(result?.conflictDetected).toBe(true);
    expect(result?.officialSource).toBe("fpf");
  });

  test("manual vence pela prioridade", async () => {
    mockedGetMatchSources.mockResolvedValue([
      {
        source: "manual",
        sourcePriority: 1000,
        homeScore: 3,
        awayScore: 0
      } as any,
      {
        source: "fpf",
        sourcePriority: 100,
        homeScore: 2,
        awayScore: 1
      } as any
    ]);

    const result = await resolveMatch(1);

    expect(result?.officialSource).toBe("manual");
    expect(result?.homeScore).toBe(3);
    expect(result?.awayScore).toBe(0);
  });
});