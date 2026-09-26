import { config } from '../../config.js';
import { HttpError } from '../../shared/httpError.js';
import type { MbArtist, MbRelease, MbReleaseGroup, MbReleaseGroupSearchResponse } from './musicbrainz.types.js';

const BASE_URL = 'https://musicbrainz.org/ws/2';

// A política do MusicBrainz permite no máximo 1 requisição por segundo por aplicação.
// Todas as chamadas passam por esta fila, que as executa em sequência respeitando o intervalo.
const MIN_INTERVAL_MS = 1100;
const RETRY_DELAY_MS = 2000;
let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    return task();
  });
  queue = run.catch(() => undefined);
  return run;
}

async function request(url: URL): Promise<Response> {
  try {
    return await fetch(url, {
      headers: { 'User-Agent': config.musicBrainzUserAgent, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new HttpError(502, 'Não foi possível conectar ao MusicBrainz.');
  }
}

function get<T>(path: string, params: Record<string, string>, notFoundMessage = 'Recurso não encontrado.'): Promise<T> {
  return enqueue(async () => {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [key, value] of Object.entries({ ...params, fmt: 'json' })) {
      url.searchParams.set(key, value);
    }

    let response = await request(url);
    // 503 = limite de requisições atingido; tenta mais uma vez após uma pausa.
    if (response.status === 503) {
      await sleep(RETRY_DELAY_MS);
      lastRequestAt = Date.now();
      response = await request(url);
    }

    // Para MBIDs inexistentes o MusicBrainz pode responder 400 ou 404.
    if (response.status === 404 || response.status === 400) throw new HttpError(404, notFoundMessage);
    if (response.status === 503) {
      throw new HttpError(503, 'O MusicBrainz está ocupado no momento. Tente novamente em instantes.');
    }
    if (!response.ok) throw new HttpError(502, 'Falha ao consultar o MusicBrainz.');

    return (await response.json()) as T;
  });
}

// Escapa caracteres especiais da sintaxe Lucene usada na busca do MusicBrainz.
function escapeLucene(term: string): string {
  return term.replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

async function searchReleaseGroupsByQuery(query: string): Promise<MbReleaseGroup[]> {
  const data = await get<MbReleaseGroupSearchResponse>('/release-group', { query, limit: '100' });
  return data['release-groups'];
}

// A busca do MusicBrainz não considera popularidade: dezenas de álbuns chamados "Nightmare"
// empatam com o mesmo score. Usamos o número de edições oficiais como indicador de relevância.
function relevance(group: MbReleaseGroup): number {
  const officialReleases = (group.releases ?? []).filter((release) => release.status === 'Official').length;
  return (group.score ?? 0) * Math.log(1 + officialReleases);
}

/**
 * Busca álbuns por título e por artista (duas consultas) e mescla os resultados,
 * ordenando por relevância.
 */
export async function searchReleaseGroups(term: string): Promise<MbReleaseGroup[]> {
  const escaped = escapeLucene(term);
  const [byTitle, byArtist] = await Promise.all([
    searchReleaseGroupsByQuery(`(${escaped}) AND primarytype:album`),
    searchReleaseGroupsByQuery(`artist:"${escaped}" AND primarytype:album AND status:official`),
  ]);

  const merged = new Map<string, MbReleaseGroup>();
  for (const group of [...byTitle, ...byArtist]) {
    const current = merged.get(group.id);
    if (!current || relevance(group) > relevance(current)) merged.set(group.id, group);
  }

  return [...merged.values()].sort((a, b) => relevance(b) - relevance(a));
}

export function getReleaseGroup(mbid: string): Promise<MbReleaseGroup> {
  return get<MbReleaseGroup>(
    `/release-group/${mbid}`,
    { inc: 'artist-credits+releases+genres+url-rels' },
    'Álbum não encontrado.',
  );
}

export function getRelease(mbid: string): Promise<MbRelease> {
  return get<MbRelease>(`/release/${mbid}`, { inc: 'recordings+labels' }, 'Álbum não encontrado.');
}

export function getArtist(mbid: string): Promise<MbArtist> {
  return get<MbArtist>(`/artist/${mbid}`, {}, 'Artista não encontrado.');
}

/** Lista os release-groups do tipo "álbum" de um artista (até 100), sem filtrar edições. */
export async function browseReleaseGroupsByArtist(artistMbid: string): Promise<MbReleaseGroup[]> {
  const data = await get<MbReleaseGroupSearchResponse>('/release-group', {
    artist: artistMbid,
    type: 'album',
    limit: '100',
  });
  return data['release-groups'];
}
