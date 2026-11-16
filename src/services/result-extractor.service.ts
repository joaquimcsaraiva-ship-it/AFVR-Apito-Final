export function findScorePatterns(
  text: string
): string[] {

  const regex =
    /\b\d+\s*-\s*\d+\b/g;

  return text.match(regex) ?? [];
}