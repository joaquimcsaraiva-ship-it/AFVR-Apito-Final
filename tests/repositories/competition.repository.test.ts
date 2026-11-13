const mockQuery = jest.fn();

jest.mock("../../src/config/database", () => ({
  __esModule: true,
  default: {
    query: mockQuery
  }
}));

import * as repository from "../../src/repositories/competition.repository";

describe("competition.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const row = {
    id: 1,
    name: "Liga Teste",
    season: "2026/2027",
    sport: "football",
    active: true,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-01-02")
  };

  it("getAll devolve competições", async () => {
    mockQuery.mockResolvedValue({
      rows: [row]
    });

    const result = await repository.getAll();

    expect(mockQuery).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toEqual(row.created_at);
  });

  it("getById devolve competição", async () => {
    mockQuery.mockResolvedValue({
      rows: [row]
    });

    const result = await repository.getById(1);

    expect(result?.id).toBe(1);
  });

  it("getById devolve null quando não existe", async () => {
    mockQuery.mockResolvedValue({
      rows: []
    });

    const result = await repository.getById(999);

    expect(result).toBeNull();
  });

  it("create devolve registo criado", async () => {
    mockQuery.mockResolvedValue({
      rows: [row]
    });

    const result = await repository.create({
      name: "Liga Teste",
      season: "2026/2027",
      sport: "football",
      active: true
    });

    expect(result.name).toBe("Liga Teste");
  });

  it("update devolve registo atualizado", async () => {
    mockQuery.mockResolvedValue({
      rows: [row]
    });

    const result = await repository.update(1, {
      name: "Liga Teste",
      season: "2026/2027",
      sport: "football",
      active: true
    });

    expect(result?.id).toBe(1);
  });

  it("update devolve null quando não encontra", async () => {
    mockQuery.mockResolvedValue({
      rows: []
    });

    const result = await repository.update(999, {
      name: "Liga Teste",
      season: "2026/2027",
      sport: "football",
      active: true
    });

    expect(result).toBeNull();
  });

  it("remove devolve true", async () => {
    mockQuery.mockResolvedValue({
      rowCount: 1
    });

    const result = await repository.remove(1);

    expect(result).toBe(true);
  });

  it("remove devolve false", async () => {
    mockQuery.mockResolvedValue({
      rowCount: 0
    });

    const result = await repository.remove(999);

    expect(result).toBe(false);
  });
});