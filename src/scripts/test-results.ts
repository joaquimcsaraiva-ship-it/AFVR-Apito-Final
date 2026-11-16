import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

import {
  extractMatchCandidates
} from "../services/club-parser.service";

async function run() {

  console.log("INICIO");

  const html =
  await fetchWebsiteContent(
    "https://gdchaves.pt"
  );

  console.log(
    "HTML:",
    html.length
  );

  const candidates =
    extractMatchCandidates(html);

  console.log(
    "Candidatos:",
    candidates.length
  );

  for (const candidate of candidates) {
    console.log(
      "-",
      candidate.title
    );
  }

  console.log("FIM");
}

run().catch(console.error);
