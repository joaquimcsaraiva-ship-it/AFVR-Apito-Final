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

  const links: {
    text: string;
    href: string;
  }[] = [];

  $("a").each((_i, el) => {

    const text =
      $(el).text().trim();

    const href =
      $(el).attr("href");

    if (
      href &&
      text.length > 20
    ) {
      links.push({
        text,
        href
      });
    }
  });

  console.log(
    "Links:",
    links.length
  );

  console.table(
    links.slice(0, 30)
  );
}

run().catch(console.error);