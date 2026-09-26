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

export interface Album extends AlbumSummary {
  artistMusicbrainzId: string | null;
  primaryType: string | null;
  averageRating: number | null;
  ratingsCount: number;
}

export interface NewAlbum {
  musicbrainzId: string;
  title: string;
  artistName: string;
  artistMusicbrainzId: string | null;
  firstReleaseDate: string | null;
  primaryType: string | null;
  coverUrl: string | null;
}

export interface Track {
  id: number;
  position: number;
  title: string;
  durationMs: number | null;
  musicbrainzRecordingId: string;
}
