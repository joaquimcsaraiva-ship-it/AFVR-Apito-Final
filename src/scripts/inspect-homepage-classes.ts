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

  $("h1,h2,h3,h4").each(
    (_i, el) => {

      console.log(
        $(el).prop("tagName"),
        $(el).attr("class"),
        $(el).text().trim()
      );
    }
  );
}

run().catch(console.error);