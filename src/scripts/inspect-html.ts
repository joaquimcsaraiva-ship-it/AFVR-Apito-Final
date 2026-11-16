import { fetchWebsiteContent }
  from "../services/club-fetch.service";

import * as cheerio from "cheerio";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt"
    );

  const $ = cheerio.load(html);

  console.log("h1:", $("h1").length);
  console.log("h2:", $("h2").length);
  console.log("article:", $("article").length);
  console.log("div:", $("div").length);

  $("h1,h2,h3")
    .slice(0, 20)
    .each((i, el) => {
      console.log(
        `[${i}]`,
        $(el).text().trim()
      );
    });
}

run().catch(console.error);