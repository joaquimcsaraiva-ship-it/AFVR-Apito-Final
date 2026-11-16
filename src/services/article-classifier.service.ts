export type ArticleCategory =
  | "match_results"
  | "match_preview"
  | "standings"
  | "official_notice"
  | "injury"
  | "general";

export function classifyArticle(
  title: string
): ArticleCategory {

  const normalized =
    title.toLowerCase();

  if (
    normalized.includes("resultados") ||
    normalized.includes("resultado")
  ) {
    return "match_results";
  }

  if (
    normalized.includes("classificação")
  ) {
    return "standings";
  }

  if (
    normalized.includes("jornada") ||
    normalized.includes("recebe") ||
    normalized.includes("desloca-se")
  ) {
    return "match_preview";
  }

  if (
    normalized.includes("comunicado") ||
    normalized.includes("nota de pesar")
  ) {
    return "official_notice";
  }

  if (
    normalized.includes("rotura") ||
    normalized.includes("lesão")
  ) {
    return "injury";
  }

  return "general";
}