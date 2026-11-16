import * as cheerio from "cheerio";

import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt"
    );

  const $ = cheerio.load(html);

  $(".post-title a").each(
    (_i, el) => {

      console.log({
        text: $(el).text().trim(),
        href: $(el).attr("href")
      });

    }
  );
}

run().catch(console.error);