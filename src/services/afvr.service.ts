import {
  fetchFpfCompetitionMatches,
  type FpfMatch
} from "./fpf.service";

import type {
  FpfSyncDTO
} from "../validators/result.validator";

export type AfvrMatch = FpfMatch;

export async function fetchAfvrResults(
  input: FpfSyncDTO
): Promise<AfvrMatch[]> {

  const result =
    await fetchFpfCompetitionMatches(input);

  return result.matches;
}