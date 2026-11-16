import {
  classifyArticle
} from "../services/article-classifier.service";

import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

import {
  extractMatchCandidates
} from "../services/club-parser.service";

import {
  saveClubArticle
} from "../repositories/club-article.repository";

async function run() {

  const html =
    await fetchWebsiteContent(
  "https://gdchaves.pt"
);

  const articles =
    extractMatchCandidates(html);

  console.log(
    `Artigos encontrados: ${articles.length}`
  );

  for (const article of articles) {

    const category =
      classifyArticle(
        article.title
      );

    await saveClubArticle(
  1,
  article.title,
  article.text,
  article.url,
  category
);


    console.log(
      `✓ [${category}] ${article.title}`
    );
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });