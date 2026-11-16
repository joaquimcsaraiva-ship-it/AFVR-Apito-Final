import { fetchWebsiteContent }
  from "../services/club-fetch.service";

import { extractMatchCandidates }
  from "../services/club-parser.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt"
    );

  const candidates =
    extractMatchCandidates(html);

  console.log(
    "Candidatos:",
    candidates.length
  );

  console.log(
    JSON.stringify(
      candidates.slice(0, 5),
      null,
      2
    )
  );
}

run().catch(console.error);