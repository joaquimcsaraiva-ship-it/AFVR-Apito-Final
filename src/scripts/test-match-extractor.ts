import {
  extractScores
} from "../services/match-extractor.service";

const tests = [
  "GD Chaves venceu por 2-1.",
  "Resultado final: 3-0.",
  "Empate 1-1 diante do adversário.",
  "Vitória por 4-2."
];

for (const text of tests) {

  const scores =
    extractScores(text);

  console.log(text);

  console.log(scores);

  console.log("-----");
}