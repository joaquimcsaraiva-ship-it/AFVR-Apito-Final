import * as cheerio from "cheerio";

export function extractArticleBody(
  html: string
): string {

  const $ = cheerio.load(html);

  const paragraphs: string[] = [];

  $("p").each((_index, element) => {

    const text =
      $(element)
        .text()
        .replace(/\s+/g, " ")
        .trim();

    if (text.length > 20) {
      paragraphs.push(text);
    }
  });

  return paragraphs.join("\n\n");
}