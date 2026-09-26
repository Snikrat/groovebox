import type { MbArtistCredit, MbRelease, MbReleaseGroup, MbReleaseSummary } from './musicbrainz.types.js';

export interface NormalizedTrack {
  musicbrainzRecordingId: string;
  position: number;
  title: string;
  durationMs: number | null;
}

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
