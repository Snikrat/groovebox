export interface AlbumSearchResult {
  musicbrainzId: string;
  title: string;
  artistName: string;
  firstReleaseDate: string | null;
  coverUrl: string;
}

export interface AlbumSearchPage {
  items: AlbumSearchResult[];
  hasMore: boolean;
}

export interface AlbumSummary {
  id: number;
  musicbrainzId: string;
  title: string;
  artistName: string;
  firstReleaseDate: string | null;
  coverUrl: string | null;
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface AdditionalCover {
  label: string;
  url: string;
}

export interface Album extends AlbumSummary {
  artistMusicbrainzId: string | null;
  primaryType: string | null;
  averageRating: number | null;
  ratingsCount: number;
  genres: string[];
  label: string | null;
  /** Código ISO 3166-1 alpha-2 do país de lançamento, ex. "US". */
  country: string | null;
  externalLinks: ExternalLink[];
  /** Soma da duração das faixas; null se nenhuma tiver duração conhecida. */
  totalDurationMs: number | null;
  /** Contracapa e páginas do encarte, se o Cover Art Archive tiver. */
  additionalCovers: AdditionalCover[];
}

export interface Track {
  id: number;
  position: number;
  title: string;
  durationMs: number | null;
  musicbrainzRecordingId: string;
}
