import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

import {
  extractArticleBody
} from "../services/article-body.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt/gd-chaves-recebe-o-fc-penafiel-na-10-a-jornada/"
    );

  const content =
    extractArticleBody(html);

  console.log(content);
}

run().catch(console.error);