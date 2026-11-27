import * as controller from "../../src/controllers/result.controller";
import * as repository from "../../src/repositories/result.repository";

jest.mock("../../src/repositories/result.repository");

const createResponse = () => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);

  return res;
};

describe("result.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getByCompetition", () => {
    it("deve devolver 400 para competição inválida", async () => {
      const res = createResponse();

      await controller.getByCompetition(
        { query: {} } as any,
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("deve devolver resultados", async () => {
      const res = createResponse();

      (repository.listByCompetition as jest.Mock)
        .mockResolvedValue([{ id: 1 }]);

      await controller.getByCompetition(
        { query: { competitionId: "1" } } as any,
        res
      );

      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
  });

  describe("getStandings", () => {
    it("deve devolver 400 para competição inválida", async () => {
      const res = createResponse();

      await controller.getStandings(
        { query: {} } as any,
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("deve devolver classificações", async () => {
      const res = createResponse();

      (repository.standingsByCompetition as jest.Mock)
        .mockResolvedValue([{ team: "A" }]);

      await controller.getStandings(
        { query: { competitionId: "1" } } as any,
        res
      );

      expect(res.json).toHaveBeenCalledWith({
        standings: [{ team: "A" }],
        hasPlayedMatches: true
      });
    });
  });
});