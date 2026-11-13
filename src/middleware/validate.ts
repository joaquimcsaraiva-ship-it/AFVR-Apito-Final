import type {
  NextFunction,
  Request,
  Response
} from "express";

import type {
  ZodType
} from "zod";

export function validate(
  schema: ZodType
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const result =
      schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Dados inválidos",

        errors:
          result.error.issues.map(
            (issue) => ({
              field:
                issue.path.join("."),

              message:
                issue.message,

              code:
                issue.code
            })
          )
      });

      return;
    }

    req.body = result.data;

    next();
  };
}