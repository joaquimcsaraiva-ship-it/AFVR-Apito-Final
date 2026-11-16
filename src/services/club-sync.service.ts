import {
  classifyArticle
} from "./article-classifier.service";

import { listClubSources }
  from "../repositories/club-source.repository";

import { saveClubArticle }
  from "../repositories/club-article.repository";

import { fetchWebsiteContent }
  from "./club-fetch.service";

import { extractMatchCandidates }
  from "./club-parser.service";

export async function syncClubResults() {

  const clubs =
    await listClubSources();

  const websites =
    clubs.filter(
      (club) =>
        club.active &&
        club.websiteUrl
    );

  let savedArticles = 0;

  for (const club of websites) {

    try {

      const html =
        await fetchWebsiteContent(
          club.websiteUrl
        );

      const articles =
        extractMatchCandidates(
          html
        );

      for (const article of articles) {

        const category =
  classifyArticle(
    article.title
  );

if (category === "general") {
  continue;
}

await saveClubArticle(
  club.id,
  article.title,
  article.text,
  null,
  category
);
        savedArticles++;
      }

      console.log(
        `✓ ${club.clubName}: ${articles.length} artigos`
      );

    } catch (error) {

      console.error(
        `Erro em ${club.clubName}`,
        error
      );
    }
  }

  return {
    clubsProcessed:
      websites.length,

    savedArticles
  };
}