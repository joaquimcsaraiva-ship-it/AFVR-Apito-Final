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

  $("a").each((_i, el) => {

    const text =
      $(el).text().trim();

    if (
      text.includes("Penafiel") ||
      text.includes("Leixões") ||
      text.includes("Pelágio")
    ) {

      console.log("--------");

      console.log(
        "TEXT:",
        text
      );

      console.log(
        "CLASS:",
        $(el).attr("class")
      );

      console.log(
        "PARENT:",
        $(el).parent().prop("tagName")
      );

      console.log(
        "HREF:",
        $(el).attr("href")
      );
    }
  });
}

run().catch(console.error);