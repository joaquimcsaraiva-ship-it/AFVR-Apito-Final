import * as repository from "../../src/repositories/competition.repository";
import * as service from "../../src/services/competition.service";

jest.mock("../../src/repositories/competition.repository");

describe("competition.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAll deve chamar o repositório", async () => {
    const data = [{ id: 1, name: "Liga Teste" }];

    (repository.getAll as jest.Mock)
      .mockResolvedValue(data);

    const result = await service.getAll();

    expect(repository.getAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(data);
  });

  it("getById deve chamar o repositório", async () => {
    const data = { id: 1, name: "Liga Teste" };

    (repository.getById as jest.Mock)
      .mockResolvedValue(data);

    const result = await service.getById(1);

    expect(repository.getById)
      .toHaveBeenCalledWith(1);

    expect(result).toEqual(data);
  });

  it("create deve chamar o repositório", async () => {
    const payload = {
      name: "Nova Competição"
    };

    (repository.create as jest.Mock)
      .mockResolvedValue(payload);

    await service.create(payload as any);

    expect(repository.create)
      .toHaveBeenCalledWith(payload);
  });

  it("update deve chamar o repositório", async () => {
    const payload = {
      name: "Competição Atualizada"
    };

    (repository.update as jest.Mock)
      .mockResolvedValue(payload);

    await service.update(1, payload as any);

    expect(repository.update)
      .toHaveBeenCalledWith(1, payload);
  });

  it("patch deve chamar o repositório", async () => {
    const payload = {
      name: "Patch"
    };

    (repository.patch as jest.Mock)
      .mockResolvedValue(payload);

    await service.patch(1, payload as any);

    expect(repository.patch)
      .toHaveBeenCalledWith(1, payload);
  });

  it("remove deve chamar o repositório", async () => {
    (repository.remove as jest.Mock)
      .mockResolvedValue(undefined);

    await service.remove(1);

    expect(repository.remove)
      .toHaveBeenCalledWith(1);
  });
});