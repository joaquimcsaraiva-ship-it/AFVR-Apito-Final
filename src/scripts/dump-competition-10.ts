import { listByCompetition } from "../repositories/result.repository";

async function run() {
  const matches = await listByCompetition(10);

  console.table(
    matches.filter(
      m =>
        m.homeTeam.includes("Mondinense") ||
        m.awayTeam.includes("Mondinense") ||
        m.homeTeam.includes("Ade Geração") ||
        m.awayTeam.includes("Ade Geração")
    )
  );
}

run().catch(console.error);