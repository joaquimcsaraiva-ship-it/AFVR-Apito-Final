import {
  listClubSources,
  type ClubSource
} from "../repositories/club-source.repository";

export interface ClubMatchCandidate {
  club: string;
  sourceUrl: string;
  extractedText: string;
}

export async function listActiveClubSources(): Promise<ClubSource[]> {
  const clubs = await listClubSources();

  return clubs.filter((club) => club.active);
}

export async function syncClubResults() {
  const clubs = await listActiveClubSources();

  return {
    clubsFound: clubs.length,
    processed: 0,
    candidates: []
  };
}