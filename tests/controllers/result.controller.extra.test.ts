jest.mock("../../src/services/fpf.service", () => ({
  listFpfCompetitions: jest.fn().mockResolvedValue([]),
  fetchFpfCompetitionMatches: jest.fn(),
  fetchFpfMatchesForCompetition: jest.fn().mockResolvedValue({
    matches: [],
    skipped: 0
  })
}));

jest.mock("../../src/repositories/result.repository", () => ({
  syncFpfResults: jest.fn().mockResolvedValue({
    saved: 0
  }),
  saveManualResults: jest.fn(),
  listByCompetition: jest.fn(),
  standingsByCompetition: jest.fn(),
  listConflicts: jest.fn(),
  getConflictDetails: jest.fn()
}));
import * as controller from "../../src/controllers/result.controller";

describe("result.controller extra coverage", () => {
  test("getFpfBulkSyncStatus devolve estado", async () => {
    const json = jest.fn();

    const res = {
      json
    } as any;

    await controller.getFpfBulkSyncStatus(
      {} as any,
      res
    );

    expect(json).toHaveBeenCalled();
  });

  test("syncFpf devolve 400 quando body é inválido", async () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const res = {
      status,
      json
    } as any;

    await controller.syncFpf(
      { body: {} } as any,
      res
    );

    expect(status).toHaveBeenCalledWith(400);
  });

  test("syncAfvr devolve 400 quando body é inválido", async () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const res = {
      status,
      json
    } as any;

    await controller.syncAfvr(
      { body: {} } as any,
      res
    );

    expect(status).toHaveBeenCalledWith(400);
  });

  test("startFpfBulkSync devolve 202", async () => {
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();

  const res = {
    status,
    json
  } as any;

  await controller.startFpfBulkSync(
    {
      body: {}
    } as any,
    res
  );

  expect(status).toHaveBeenCalledWith(202);
  expect(json).toHaveBeenCalled();
});
  test("uploadManual devolve 400 quando body é inválido", async () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const res = {
      status,
      json
    } as any;

    await controller.uploadManual(
      { body: {} } as any,
      res
    );

    expect(status).toHaveBeenCalledWith(400);
  });
});