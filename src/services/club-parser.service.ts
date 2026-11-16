import * as cheerio from "cheerio";

export interface MatchCandidate {
  title: string;
  text: string;
  url: string | null;
}

export function extractMatchCandidates(
  html: string
): MatchCandidate[] {

  const $ = cheerio.load(html);

  const candidates: MatchCandidate[] = [];

  $("h3 a").each((_index, element) => {

    const title = $(element)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const url =
      $(element).attr("href") ?? null;

    if (!url) {
      return;
    }

    if (
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
    ) {
      return;
    }

    if (title.length < 15) {
      return;
    }

    const blockedTerms = [
      "carrinho",
      "finalizar compra",
      "log in",
      "registar",
      "patrocinadores",
      "vantagens parceiros",
      "política de privacidade",
      "termos e condições",
      "brand 22",
      "ver todos os jogadores"
    ];

    const normalized =
      title.toLowerCase();

    if (
      blockedTerms.some(
        term => normalized.includes(term)
      )
    ) {
      return;
    }

    candidates.push({
      title,
      text: title,
      url
    });
  });

  return candidates;
}