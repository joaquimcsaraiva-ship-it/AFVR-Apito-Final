import * as controller from "../../src/controllers/competition.controller";
import * as service from "../../src/services/competition.service";

jest.mock("../../src/services/competition.service");

const createResponse = () => {
  const res: any = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);

  return res;
};

describe("competition.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAll devolve competições", async () => {
    const res = createResponse();

    (service.getAll as jest.Mock)
      .mockResolvedValue([{ id: 1 }]);

    await controller.getAll({} as any, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("getById devolve 400 para id inválido", async () => {
    const res = createResponse();

    await controller.getById(
      { params: { id: "abc" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getById devolve 404 quando não existe", async () => {
    const res = createResponse();

    (service.getById as jest.Mock)
      .mockResolvedValue(null);

    await controller.getById(
      { params: { id: "1" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("getById devolve competição", async () => {
    const res = createResponse();

    (service.getById as jest.Mock)
      .mockResolvedValue({ id: 1 });

    await controller.getById(
      { params: { id: "1" } } as any,
      res
    );

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  it("create devolve 201", async () => {
    const res = createResponse();

    (service.create as jest.Mock)
      .mockResolvedValue({ id: 1 });

    await controller.create(
      { body: {} } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("remove devolve 204", async () => {
    const res = createResponse();

    (service.remove as jest.Mock)
      .mockResolvedValue(true);

    await controller.remove(
      { params: { id: "1" } } as any,
      res
    );

    expect(res.status).toHaveBeenCalledWith(204);
  });
});