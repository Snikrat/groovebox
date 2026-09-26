import { getArtistWithDiscography } from '../artists/artists.service.js';
import { listKnownAlbumMbids, listRecentlyReviewedArtistMbids } from './discover.repository.js';
import type { NewRelease } from './discover.types.js';

const RECENT_WINDOW_DAYS = 365;
const RESULT_LIMIT = 8;

/**
 * Álbuns recentes dos artistas que o usuário mais avaliou, que ele ainda não tem na
 * biblioteca. Reaproveita o cache de discografia por artista (10 min) do artists.service —
 * sem isso, um usuário com vários artistas levaria vários segundos a cada visita
 * (o MusicBrainz permite só 1 requisição por segundo).
 */
export async function listNewReleasesForUser(userId: number): Promise<NewRelease[]> {
  const [artistMbids, knownMbids] = await Promise.all([
    listRecentlyReviewedArtistMbids(userId),
    listKnownAlbumMbids(userId),
  ]);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_WINDOW_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const discographies = await Promise.all(artistMbids.map((mbid) => getArtistWithDiscography(mbid)));

  const releases: NewRelease[] = [];
  for (const artist of discographies) {
    for (const album of artist.albums) {
      if (!album.firstReleaseDate || album.firstReleaseDate < cutoffIso) continue;
      if (knownMbids.has(album.musicbrainzId)) continue;
      releases.push({ ...album, artistName: artist.name });
    }
  }

  return releases.sort((a, b) => (b.firstReleaseDate ?? '').localeCompare(a.firstReleaseDate ?? '')).slice(0, RESULT_LIMIT);
}
