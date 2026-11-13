import {
  createCompetitionSchema,
  patchCompetitionSchema,
  updateCompetitionSchema
} from "../../src/validators/competition.validator";

describe(
  "Competition Validator",
  () => {
    const validCompetition = {
      name: "Campeonato Distrital",
      season: "2026/2027",
      sport: "football" as const,
      active: true
    };

    describe(
      "createCompetitionSchema",
      () => {
        it(
          "aceita um payload válido",
          () => {
            const result =
              createCompetitionSchema.safeParse(
                validCompetition
              );

            expect(result.success).toBe(true);
          }
        );

        it.each([
          "",
          "2026",
          "2026-2027",
          "2026/2026",
          "2026/2028",
          "2027/2025",
          "AAAA/BBBB"
        ])(
          "rejeita época inválida: %s",
          (season) => {
            const result =
              createCompetitionSchema.safeParse({
                ...validCompetition,
                season
              });

            expect(result.success).toBe(false);
          }
        );

        it.each([
          "2025/2026",
          "2026/2027",
          "2027/2028"
        ])(
          "aceita época válida: %s",
          (season) => {
            const result =
              createCompetitionSchema.safeParse({
                ...validCompetition,
                season
              });

            expect(result.success).toBe(true);
          }
        );

        it(
          "rejeita nome vazio",
          () => {
            const result =
              createCompetitionSchema.safeParse({
                ...validCompetition,
                name: ""
              });

            expect(result.success).toBe(false);
          }
        );

        it(
          "rejeita desporto inválido",
          () => {
            const result =
              createCompetitionSchema.safeParse({
                ...validCompetition,
                sport: "basketball"
              });

            expect(result.success).toBe(false);
          }
        );

        it(
          "rejeita active como string",
          () => {
            const result =
              createCompetitionSchema.safeParse({
                ...validCompetition,
                active: "true"
              });

            expect(result.success).toBe(false);
          }
        );

        it(
          "rejeita campos desconhecidos",
          () => {
            const result =
              createCompetitionSchema.safeParse({
                ...validCompetition,
                unknownField: true
              });

            expect(result.success).toBe(false);
          }
        );
      }
    );

    describe(
      "updateCompetitionSchema",
      () => {
        it(
          "aceita payload completo",
          () => {
            const result =
              updateCompetitionSchema.safeParse(
                validCompetition
              );

            expect(result.success).toBe(true);
          }
        );

        it(
          "rejeita payload incompleto",
          () => {
            const result =
              updateCompetitionSchema.safeParse({
                name: "Taça AFVR"
              });

            expect(result.success).toBe(false);
          }
        );
      }
    );

    describe(
      "patchCompetitionSchema",
      () => {
        it(
          "aceita atualização parcial",
          () => {
            const result =
              patchCompetitionSchema.safeParse({
                name: "Taça AFVR"
              });

            expect(result.success).toBe(true);
          }
        );

        it(
          "rejeita PATCH vazio",
          () => {
            const result =
              patchCompetitionSchema.safeParse({});

            expect(result.success).toBe(false);
          }
        );

        it(
          "rejeita valor inválido",
          () => {
            const result =
              patchCompetitionSchema.safeParse({
                sport: "basketball"
              });

            expect(result.success).toBe(false);
          }
        );

        it(
          "rejeita campo desconhecido",
          () => {
            const result =
              patchCompetitionSchema.safeParse({
                unknownField: true
              });

            expect(result.success).toBe(false);
          }
        );
      }
    );
  }
);