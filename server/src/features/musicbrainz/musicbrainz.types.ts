// Apenas os campos da API do MusicBrainz que o MVP utiliza.

export interface MbArtistCredit {
  name: string;
  joinphrase?: string;
  artist: { id: string; name: string };
}

export interface MbGenre {
  name: string;
  count: number;
}

export interface MbUrlRelation {
  type: string;
  'target-type': string;
  url?: { resource: string };
}

export interface MbReleaseGroup {
  id: string;
  title: string;
  'primary-type'?: string | null;
  /** Ex.: "Live", "Compilation", "Soundtrack" — usado para filtrar a discografia principal. */
  'secondary-types'?: string[];
  'first-release-date'?: string;
  /** Presente apenas em resultados de busca (0 a 100). */
  score?: number;
  'artist-credit'?: MbArtistCredit[];
  releases?: MbReleaseSummary[];
  /** Presente com inc=genres. */
  genres?: MbGenre[];
  /** Presente com inc=url-rels. */
  relations?: MbUrlRelation[];
}

export interface MbArtist {
  id: string;
  name: string;
}

export interface MbReleaseSummary {
  id: string;
  title: string;
  status?: string | null;
  date?: string;
}

export interface MbReleaseGroupSearchResponse {
  'release-groups': MbReleaseGroup[];
}

export interface MbTrack {
  position: number;
  title: string;
  length?: number | null;
  recording: { id: string; length?: number | null };
}

export interface MbLabelInfo {
  label?: { name: string };
}

export interface MbRelease {
  id: string;
  media?: { position: number; tracks?: MbTrack[] }[];
  /** Código ISO 3166-1 alpha-2, ex. "US". Vem sempre, sem precisar de inc extra. */
  country?: string | null;
  /** Presente com inc=labels. */
  'label-info'?: MbLabelInfo[];
}
