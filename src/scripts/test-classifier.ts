import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

import {
  extractMatchCandidates
} from "../services/club-parser.service";

import {
  classifyArticle
} from "../services/article-classifier.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt"
    );

  const candidates =
    extractMatchCandidates(html);

  for (const candidate of candidates) {

    console.log(
      `[${classifyArticle(candidate.title)}] ${candidate.title}`
    );
  }
}

run().catch(console.error);