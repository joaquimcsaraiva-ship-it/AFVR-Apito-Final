import { fpfSyncSchema } from "../../src/validators/result.validator";

describe("result validator", () => {
  it("accepts a valid FPF sync payload", () => {
    const result = fpfSyncSchema.parse({
      associationId: 236,
      seasonId: 106,
      fpfCompetitionId: 1
    });

    expect(result.fpfCompetitionId).toBe(1);
  });
});