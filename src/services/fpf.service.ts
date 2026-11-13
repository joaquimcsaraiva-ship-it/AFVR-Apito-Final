import { createHash } from "node:crypto";

import type { FpfSyncDTO } from "../validators/result.validator";

const FPF_ORIGIN = "https://centroderesultados-as-prd.azurewebsites.net";
const MONTHS: Record<string, number> = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12
};

export interface FpfCompetition {
  fpfCompetitionId: number;
  seasonId: number;
  season: string;
  name: string;
  sport: "football" | "futsal";
  detailsUrl: string;
}

export interface FpfMatch {
  fpfMatchId: number;
  homeTeam: string;
  awayTeam: string;
  groupName: string | null;
  playedAt: string | null;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "played";
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
    aacute: "á", Aacute: "Á", acirc: "â", Acirc: "Â", atilde: "ã", Atilde: "Ã",
    agrave: "à", Agrave: "À", eacute: "é", Eacute: "É", ecirc: "ê", Ecirc: "Ê",
    iacute: "í", Iacute: "Í", oacute: "ó", Oacute: "Ó", ocirc: "ô", Ocirc: "Ô",
    otilde: "õ", Otilde: "Õ", uacute: "ú", Uacute: "Ú", ccedil: "ç", Ccedil: "Ç"
  };
  return value
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name] ?? entity)
    .replace(/&#(\d+);/g, (_entity, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_entity, code: string) => String.fromCodePoint(parseInt(code, 16)));
}

function textFromHtml(value: string): string {
  return decodeHtml(value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " | ")
    .replace(/<\/(?:span|div|p|li|strong|b|time|td|th|h[1-6])\s*>/gi, " | ")
    .replace(/<[^>]*>/g, " "))
    .replace(/[\t\r\n]+/g, " ")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+/g, " ")
    .trim();
}

function anchorEntries(html: string): Array<{ href: string; markup: string; text: string }> {
  const anchors: Array<{ href: string; markup: string; text: string }> = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi)) {
    const attrs = match[1] ?? "";
    const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = decodeHtml(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "");
    if (href) anchors.push({ href, markup: match[2] ?? "", text: textFromHtml(match[2] ?? "") });
  }
  return anchors;
}

async function fetchFpfPage(url: URL): Promise<string> {
  if (url.origin !== FPF_ORIGIN) {
    throw new Error("O endereço pedido não pertence ao Centro de Resultados da FPF.");
  }
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "text/html", "user-agent": "AFVR-Resultados/1.0" },
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    throw new Error("Não foi possível ligar ao Centro de Resultados da FPF. Verifique o acesso à Internet e tente novamente.");
  }
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("A FPF recusou o acesso automático (403). Para sincronizar diretamente, é necessário um método/API autorizado pela FPF. Entretanto, use o registo manual ou a importação CSV.");
    }
    throw new Error(`A FPF respondeu com o estado ${response.status}.`);
  }
  return response.text();
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index]!);
    }
  }));
  return results;
}

function queryUrl(href: string): URL | null {
  try {
    const url = new URL(href, FPF_ORIGIN);
    return url.origin === FPF_ORIGIN ? url : null;
  } catch {
    return null;
  }
}

export interface FpfSeriesBlock {
  groupName: string | null;
  markup: string;
}

function displayGroupName(value: string | null): string | null {
  if (!value) return null;
  const match = value.trim().match(/^(zona|s[eé]rie|grupo)[\s-]*(.*)$/i);
  if (!match) return value.trim();
  const prefix = match[1]!.toLocaleLowerCase("pt-PT").startsWith("zona")
    ? "Zona"
    : match[1]!.toLocaleLowerCase("pt-PT").startsWith("s") ? "Série" : "Grupo";
  const suffix = match[2]!.replace(/["“”]/g, "").replace(/[\s-]+/g, " ").trim();
  return suffix ? `${prefix} ${suffix.split(" ").map((word) => word.toLocaleUpperCase("pt-PT").length <= 2
    ? word.toLocaleUpperCase("pt-PT")
    : word[0]!.toLocaleUpperCase("pt-PT") + word.slice(1).toLocaleLowerCase("pt-PT")).join(" ")}` : prefix;
}

export function extractFpfSeriesBlocks(html: string): FpfSeriesBlock[] {
  const blocks: FpfSeriesBlock[] = [];
  const openingTags = /<div\b([^>]*)>/gi;
  let opening: RegExpExecArray | null;
  while ((opening = openingTags.exec(html))) {
    const id = opening[1]!.match(/\bid\s*=\s*(?:"htmlSerieId_([^\"]+)"|'htmlSerieId_([^']+)')/i);
    if (!id) continue;

    const contentStart = openingTags.lastIndex;
    const divTags = /<\/?div\b[^>]*>/gi;
    divTags.lastIndex = contentStart;
    let depth = 1;
    let closingIndex = -1;
    let tag: RegExpExecArray | null;
    while ((tag = divTags.exec(html))) {
      if (/^<\s*\//.test(tag[0])) depth--;
      else if (!/\/\s*>$/.test(tag[0])) depth++;
      if (depth === 0) {
        closingIndex = divTags.lastIndex;
        break;
      }
    }
    if (closingIndex < 0) continue;

    const markup = html.slice(opening.index, closingIndex);
    const label = textFromHtml(markup).split("|").map((part) => part.trim())
      .find((part) => /^(?:zona|s[eé]rie|grupo)\b/i.test(part)) ?? null;
    blocks.push({ groupName: displayGroupName(label), markup });
    openingTags.lastIndex = closingIndex;
  }
  return blocks.length ? blocks : [{ groupName: null, markup: html }];
}

export async function listFpfCompetitions(
  associationId: number,
  seasonId: number
): Promise<FpfCompetition[]> {
  const url = new URL("/Competition/GetCompetitionsByAssociation", FPF_ORIGIN);
  url.searchParams.set("associationId", String(associationId));
  url.searchParams.set("seasonId", String(seasonId));
  const html = await fetchFpfPage(url);
  const seasonMatch = html.match(/\b(20\d{2})\s*[-/]\s*(20\d{2})\b/);
  const season = seasonMatch ? `${seasonMatch[1]}/${seasonMatch[2]}` : "";

  const competitions = new Map<number, FpfCompetition>();
  for (const anchor of anchorEntries(html)) {
    const detailsUrl = queryUrl(anchor.href);
    if (!detailsUrl || !/\/Competition\/Details$/i.test(detailsUrl.pathname)) continue;
    const fpfCompetitionId = Number(detailsUrl.searchParams.get("competitionId"));
    const linkedSeasonId = Number(detailsUrl.searchParams.get("seasonId"));
    const name = anchor.text.replace(/\s*\|\s*/g, " ").trim();
    if (!Number.isInteger(fpfCompetitionId) || !Number.isInteger(linkedSeasonId) || !name) continue;
    competitions.set(fpfCompetitionId, {
      fpfCompetitionId,
      seasonId: linkedSeasonId,
      season,
      name,
      sport: /futsal/i.test(name) ? "futsal" : "football",
      detailsUrl: detailsUrl.toString()
    });
  }

  if (!competitions.size) {
    throw new Error("Não foi possível ler competições no catálogo da FPF. Confirme a associação e a época.");
  }
  return [...competitions.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-PT"));
}

function leafTexts(markup: string): Array<{ className: string; text: string }> {
  const leaves: Array<{ className: string; text: string }> = [];
  for (const match of markup.matchAll(/<([a-z][\w:-]*)\b([^>]*)>([^<]*)<\/\1\s*>/gi)) {
    const className = match[2]?.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const text = textFromHtml(match[3] ?? "").replace(/\s*\|\s*/g, " ").trim();
    if (text) leaves.push({ className: (className?.[1] ?? className?.[2] ?? "").toLowerCase(), text });
  }
  return leaves;
}

function parseDate(value: string, season: string): string | null {
  const match = value.match(/\b(\d{1,2})\s+([a-záéíóú]{3,})(?:\s+(20\d{2}))?(?:\s+(\d{1,2}:\d{2}))?/i);
  if (!match) return null;
  const monthKey = match[2]!.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 3).toLowerCase();
  const month = MONTHS[monthKey];
  if (!month) return null;
  const firstYear = Number(season.slice(0, 4));
  const year = Number(match[3] ?? (month >= 8 ? firstYear : firstYear + 1));
  const day = Number(match[1]);
  const time = match[4] ?? "00:00";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${time}:00.000Z`;
}

function parseFixture(anchor: { href: string; markup: string; text: string }, season: string, groupName: string | null): FpfMatch | null {
  const url = queryUrl(anchor.href);
  if (!url) return null;
  const fpfMatchId = Number(url.searchParams.get("matchId"));
  if (!Number.isInteger(fpfMatchId)) return null;

  const leaves = leafTexts(anchor.markup);
  const homeByClass = leaves.find((leaf) => /home|local|mandante|team1|club1/.test(leaf.className));
  const awayByClass = leaves.find((leaf) => /away|visitor|visitante|team2|club2/.test(leaf.className));
  const venueByClass = leaves.find((leaf) => /venue|stadium|field|campo|facility/.test(leaf.className));
  const dateByClass = leaves.find((leaf) => /date|data/.test(leaf.className));
  const timeByClass = leaves.find((leaf) => /time|hora/.test(leaf.className));
  const scoreByClass = leaves.find((leaf) => /score|result|resultado|golo/.test(leaf.className));

  const normalizedText = anchor.text.replace(/\s*\|\s*/g, " ").replace(/\s+/g, " ").trim();
  const scoreText = scoreByClass?.text ?? normalizedText;
  const score = scoreText.match(/\b(\d{1,2})\s*[-–:]\s*(\d{1,2})\b/);
  const segmented = anchor.text.split("|").map((part) => part.trim()).filter(Boolean);
  let scoreIndex = segmented.findIndex((part) => /\b\d{1,2}\s*[-–:]\s*\d{1,2}\b/.test(part));
  if (scoreIndex < 0) {
    scoreIndex = segmented.findIndex((part, index) =>
      /^\d{1,2}$/.test(part) && /^[-–:]$/.test(segmented[index + 1] ?? "") && /^\d{1,2}$/.test(segmented[index + 2] ?? "")
    );
  }
  const datePart = dateByClass?.text ?? segmented.slice(Math.max(scoreIndex + 1, 0)).find((part) => /\b\d{1,2}\s+[a-záéíóú]{3}/i.test(part));
  const dateCandidate = datePart ? `${datePart} ${timeByClass?.text ?? ""}`.trim() : undefined;
  const dateIndex = dateCandidate ? segmented.findIndex((part) => part.includes(dateCandidate)) : -1;
  const homeCandidate = homeByClass?.text ?? (scoreIndex > 0
    ? segmented[scoreIndex - 1]
    : dateIndex > 0
      ? segmented[dateIndex - 1]
      : score?.[1]
        ? scoreText.slice(0, scoreText.indexOf(score[0])).trim()
        : null);
  const nextDataIndex = dateIndex >= 0 && /^\d{1,2}:\d{2}$/.test(segmented[dateIndex + 1] ?? "") ? dateIndex + 2 : dateIndex + 1;
  const awayCandidate = awayByClass?.text ?? (dateIndex >= 0 ? segmented[nextDataIndex] : null);
  const venueCandidate = venueByClass?.text ?? (dateIndex >= 0 && segmented[nextDataIndex + 1] ? segmented[nextDataIndex + 1] : null);

  if (!homeCandidate || !awayCandidate) return null;
  const cleanTeam = (value: string) => value
    .replace(/\b\d{1,2}\s*[-–:]\s*\d{1,2}\b/g, "")
    .replace(/\(\s*\d+\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const homeTeam = cleanTeam(homeCandidate);
  const awayTeam = cleanTeam(awayCandidate);
  if (!homeTeam || !awayTeam || homeTeam.length > 180 || awayTeam.length > 180) return null;

  return {
    fpfMatchId,
    homeTeam,
    awayTeam,
    groupName,
    playedAt: dateCandidate ? parseDate(dateCandidate, season) : null,
    venue: venueCandidate?.trim().slice(0, 250) ?? null,
    homeScore: score ? Number(score[1]) : null,
    awayScore: score ? Number(score[2]) : null,
    status: score ? "played" : "scheduled"
  };
}

export function parseStaticFixtures(html: string, competition: FpfCompetition, groupName: string | null = null): FpfMatch[] {
  const parts = textFromHtml(html).split("|").map((part) => part.trim()).filter(Boolean);
  const matches: FpfMatch[] = [];
  const combinedDatePattern = /^(.*?)\s+(\d{1,2})\s+([a-záéíóú]{3,})(?:\s+(20\d{2}))?$/i;
  const dateOnlyPattern = /^(\d{1,2}\s+[a-záéíóú]{3,}(?:\s+20\d{2})?)$/i;
  const timePattern = /^(\d{1,2}:\d{2})$/;
  const ignoredHeading = /^(?:(?:\d+º?\s*)?encontro|jornada|fase|round|data|hora|campo|jogos|organização|série)\b/i;
  const isTeamName = (value: string) => /\p{L}{2}/u.test(value) &&
    !/^\d{1,2}\s*[-–:]\s*\d{1,2}$/.test(value) && !/^\d{1,2}:\d{2}$/.test(value);
  const normalizeTeam = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "");
  const seen = new Set<string>();

  for (let index = 0; index < parts.length; index++) {
    const token = parts[index]!;
    const combinedDate = token.match(combinedDatePattern);
    const dateOnly = token.match(dateOnlyPattern);
    if (!combinedDate && !dateOnly) continue;

    const homeTeam = (combinedDate ? combinedDate[1] : parts[index - 1])?.trim() ?? "";
    if (!homeTeam || ignoredHeading.test(homeTeam) || !isTeamName(homeTeam)) continue;
    const dateText = combinedDate
      ? `${combinedDate[2]} ${combinedDate[3]} ${combinedDate[4] ?? ""}`.trim()
      : dateOnly![1]!;

    let cursor = index + 1;
    let time = "";
    let awayTeam = parts[cursor] ?? "";
    const timeAndAway = awayTeam.match(/^(\d{1,2}:\d{2})\s+(.+)$/);
    if (timeAndAway) {
      time = timeAndAway[1]!;
      awayTeam = timeAndAway[2]!.trim();
    } else if (timePattern.test(awayTeam)) {
      time = awayTeam;
      cursor++;
      awayTeam = parts[cursor] ?? "";
    }
    if (!awayTeam || ignoredHeading.test(awayTeam) || !isTeamName(awayTeam) || /^(campo|pavilhão|pavilhao|estádio|estadio)\b/i.test(awayTeam)) continue;

    const playedAt = parseDate(`${dateText} ${time}`.trim(), competition.season);
    if (!playedAt) continue;
    const awayIndex = cursor;
    const venuePart = parts[awayIndex + 1]?.trim() ?? "";
    const venue = /^(campo|pavilhão|pavilhao|estádio|estadio|complexo)\b/i.test(venuePart)
      ? venuePart.slice(0, 250)
      : null;
    const identity = [normalizeTeam(homeTeam), normalizeTeam(awayTeam), playedAt.slice(0, 10)].join("|");
    if (seen.has(identity)) continue;
    seen.add(identity);
    const stableKey = [competition.fpfCompetitionId, homeTeam, awayTeam, playedAt ?? ""]
      .join("|").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const fpfMatchId = Number.parseInt(createHash("sha256").update(stableKey).digest("hex").slice(0, 8), 16);
    matches.push({ fpfMatchId, homeTeam, awayTeam, groupName, playedAt, venue, homeScore: null, awayScore: null, status: "scheduled" });
  }
  return matches;
}

export async function fetchFpfMatchesForCompetition(
  competition: FpfCompetition
): Promise<{ competition: FpfCompetition; matches: FpfMatch[]; skipped: number }> {
  if (!competition.season) throw new Error("A FPF não indicou o texto da época nesta página.");

  const html = await fetchFpfPage(new URL(competition.detailsUrl));
  const seriesBlocks = extractFpfSeriesBlocks(html);
  const roundRequests = seriesBlocks.flatMap((series) => anchorEntries(series.markup)
    .map((anchor) => queryUrl(anchor.href))
    .filter((url): url is URL => Boolean(url && /\/Competition\/GetClassificationAndMatchesByFixture$/i.test(url.pathname)))
    .map((url) => ({ url, groupName: series.groupName })));
  const uniqueRequests = [...new Map(roundRequests.map((request) => [request.url.toString(), request])).values()];
  const roundPages = uniqueRequests.length
    ? await mapWithConcurrency(uniqueRequests, 4, async (request) => ({
      groupName: request.groupName,
      html: await fetchFpfPage(request.url)
    }))
    : [];
  const fixtureSources = [
    ...seriesBlocks,
    ...roundPages.map((page) => ({ groupName: page.groupName, markup: page.html }))
  ];
  const fixtures = fixtureSources.flatMap((source) => anchorEntries(source.markup).map((anchor) => ({ ...anchor, groupName: source.groupName }))).filter((anchor) => {
    const url = queryUrl(anchor.href);
    return Boolean(url && /\/Match\/GetMatchInformation$/i.test(url.pathname));
  });
  const byFpfId = new Map<number, FpfMatch>();
  for (const fixture of fixtures) {
    const match = parseFixture(fixture, competition.season, fixture.groupName);
    if (match) byFpfId.set(match.fpfMatchId, match);
  }
  const staticMatches = fixtureSources.flatMap((source) => parseStaticFixtures(source.markup, competition, source.groupName));
  const normalizeTeam = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  for (const match of staticMatches) {
    const alreadyParsed = [...byFpfId.values()].some((existing) =>
      normalizeTeam(existing.homeTeam) === normalizeTeam(match.homeTeam) &&
      normalizeTeam(existing.awayTeam) === normalizeTeam(match.awayTeam) &&
      existing.playedAt?.slice(0, 10) === match.playedAt?.slice(0, 10)
    );
    if (!alreadyParsed) byFpfId.set(match.fpfMatchId, match);
  }
  const matches = [...byFpfId.values()];
  if (!matches.length) {
    throw new Error("A página da FPF abriu, mas o formato dos jogos não pôde ser interpretado. Use a importação CSV ou o registo manual.");
  }
  return { competition, matches, skipped: Math.max(0, fixtures.length - matches.length) };
}

export async function fetchFpfCompetitionMatches(
  input: FpfSyncDTO
): Promise<{ competition: FpfCompetition; matches: FpfMatch[]; skipped: number }> {
  const competitions = await listFpfCompetitions(input.associationId, input.seasonId);
  const competition = competitions.find((item) => item.fpfCompetitionId === input.fpfCompetitionId);
  if (!competition) throw new Error("A competição escolhida não pertence ao catálogo da FPF pedido.");
  return fetchFpfMatchesForCompetition(competition);
}
