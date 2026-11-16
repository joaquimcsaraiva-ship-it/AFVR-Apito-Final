import * as cheerio from "cheerio";

import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt/gd-chaves-recebe-o-fc-penafiel-na-10-a-jornada/"
    );

  const $ = cheerio.load(html);

  $("p").each(
    (_i, el) => {

      const text =
        $(el)
          .text()
          .trim();

      if (text.length > 20) {
        console.log(text);
      }
    }
  );
}

run().catch(console.error);