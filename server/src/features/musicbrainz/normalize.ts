import type { MbArtistCredit, MbRelease, MbReleaseGroup, MbReleaseSummary } from './musicbrainz.types.js';

export interface NormalizedTrack {
  musicbrainzRecordingId: string;
  position: number;
  title: string;
  durationMs: number | null;
}

export interface ExternalLink {
  label: string;
  url: string;
}

const MAX_GENRES = 5;

// Só os tipos de relação úteis numa página de álbum — o MusicBrainz tem dezenas de outros
// (ex. "review", "other databases") que são ruído demais para mostrar direto.
const EXTERNAL_LINK_LABELS: Record<string, string> = {
  'official homepage': 'Site oficial',
  discogs: 'Discogs',
  wikidata: 'Wikidata',
  allmusic: 'AllMusic',
  bandcamp: 'Bandcamp',
  youtube: 'YouTube',
  streaming: 'Ouvir online',
  'free streaming': 'Ouvir online',
};

export function artistNameFrom(credits: MbArtistCredit[] = []): string {
  const name = credits.map((credit) => `${credit.name}${credit.joinphrase ?? ''}`).join('').trim();
  return name || 'Artista desconhecido';
}

export function artistIdFrom(credits: MbArtistCredit[] = []): string | null {
  return credits[0]?.artist.id ?? null;
}

export function releaseDateFrom(group: MbReleaseGroup): string | null {
  return group['first-release-date'] || null;
}

// Para o MVP usamos uma única edição como representante do álbum:
// a release oficial mais antiga (normalmente a edição original).
export function pickRepresentativeRelease(releases: MbReleaseSummary[] = []): MbReleaseSummary | null {
  const official = releases.filter((release) => release.status === 'Official');
  const candidates = official.length > 0 ? official : releases;
  const byDate = [...candidates].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  return byDate[0] ?? null;
}

/** Os gêneros mais votados do release-group, do mais para o menos citado. */
export function genresFrom(group: MbReleaseGroup): string[] {
  return [...(group.genres ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_GENRES)
    .map((genre) => genre.name);
}

/** Links externos úteis (site oficial, Discogs, Wikidata...), sem duplicar por rótulo. */
export function externalLinksFrom(group: MbReleaseGroup): ExternalLink[] {
  const links = new Map<string, string>();

  for (const relation of group.relations ?? []) {
    const label = EXTERNAL_LINK_LABELS[relation.type];
    if (label && relation.url?.resource && !links.has(label)) {
      links.set(label, relation.url.resource);
    }
  }

  return [...links.entries()].map(([label, url]) => ({ label, url }));
}

/** Nome(s) do(s) selo(s) da release, sem repetir. */
export function labelNameFrom(release: MbRelease): string | null {
  const names = [...new Set((release['label-info'] ?? []).map((info) => info.label?.name).filter(Boolean))];
  return names.length > 0 ? names.join(', ') : null;
}

// Achata todos os discos/lados em uma única lista numerada sequencialmente.
export function tracksFrom(release: MbRelease): NormalizedTrack[] {
  const media = [...(release.media ?? [])].sort((a, b) => a.position - b.position);
  const tracks = media.flatMap((medium) => [...(medium.tracks ?? [])].sort((a, b) => a.position - b.position));

  return tracks.map((track, index) => ({
    musicbrainzRecordingId: track.recording.id,
    position: index + 1,
    title: track.title,
    durationMs: track.length ?? track.recording.length ?? null,
  }));
}
