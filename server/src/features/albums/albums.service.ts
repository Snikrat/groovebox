import { coverUrlFor, findCoverUrl } from '../musicbrainz/coverArt.js';
import { getRelease, getReleaseGroup, searchReleaseGroups } from '../musicbrainz/musicbrainz.client.js';
import {
  artistIdFrom,
  artistNameFrom,
  externalLinksFrom,
  genresFrom,
  labelNameFrom,
  pickRepresentativeRelease,
  releaseDateFrom,
  tracksFrom,
} from '../musicbrainz/normalize.js';
import { findAlbumByMbid, insertAlbumWithTracks, listTracks } from './albums.repository.js';
import type { Album, AlbumSearchPage, AlbumSearchResult, Track } from './albums.types.js';

// Cache simples em memória para não repetir a mesma busca no MusicBrainz.
const SEARCH_TTL_MS = 10 * 60 * 1000;
const SEARCH_CACHE_MAX = 200;
const searchCache = new Map<string, { expiresAt: number; results: AlbumSearchResult[] }>();

export const SEARCH_PAGE_SIZE = 24;

export async function searchAlbums(term: string, offset: number): Promise<AlbumSearchPage> {
  const results = await searchAllAlbums(term);
  return {
    items: results.slice(offset, offset + SEARCH_PAGE_SIZE),
    hasMore: offset + SEARCH_PAGE_SIZE < results.length,
  };
}

// A lista completa fica em cache; as páginas seguintes não consultam o MusicBrainz de novo.
async function searchAllAlbums(term: string): Promise<AlbumSearchResult[]> {
  const key = term.toLowerCase();
  const cached = searchCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.results;

  const groups = await searchReleaseGroups(term);
  const results = groups.map((group) => ({
    musicbrainzId: group.id,
    title: group.title,
    artistName: artistNameFrom(group['artist-credit']),
    firstReleaseDate: releaseDateFrom(group),
    coverUrl: coverUrlFor(group.id, 250),
  }));

  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey !== undefined) searchCache.delete(oldestKey);
  }
  searchCache.set(key, { expiresAt: Date.now() + SEARCH_TTL_MS, results });
  return results;
}

// Evita importar o mesmo álbum duas vezes quando detalhes e faixas são pedidos ao mesmo tempo.
const importsInProgress = new Map<string, Promise<Album>>();

export async function getOrImportAlbum(mbid: string): Promise<Album> {
  const existing = await findAlbumByMbid(mbid);
  if (existing) return existing;

  let pending = importsInProgress.get(mbid);
  if (!pending) {
    pending = importAlbum(mbid).finally(() => importsInProgress.delete(mbid));
    importsInProgress.set(mbid, pending);
  }
  return pending;
}

async function importAlbum(mbid: string): Promise<Album> {
  const group = await getReleaseGroup(mbid);
  const releaseSummary = pickRepresentativeRelease(group.releases);
  const releaseDetail = releaseSummary ? await getRelease(releaseSummary.id) : null;
  const tracks = releaseDetail ? tracksFrom(releaseDetail) : [];
  const coverUrl = await findCoverUrl(mbid);

  await insertAlbumWithTracks(
    {
      musicbrainzId: group.id,
      title: group.title,
      artistName: artistNameFrom(group['artist-credit']),
      artistMusicbrainzId: artistIdFrom(group['artist-credit']),
      firstReleaseDate: releaseDateFrom(group),
      primaryType: group['primary-type'] ?? null,
      coverUrl,
      genres: genresFrom(group),
      label: releaseDetail ? labelNameFrom(releaseDetail) : null,
      country: releaseDetail?.country ?? null,
      externalLinks: externalLinksFrom(group),
    },
    tracks,
  );

  const album = await findAlbumByMbid(mbid);
  if (!album) throw new Error(`Álbum ${mbid} não foi salvo.`);
  return album;
}

export async function getAlbumTracks(mbid: string): Promise<Track[]> {
  const album = await getOrImportAlbum(mbid);
  return listTracks(album.id);
}
