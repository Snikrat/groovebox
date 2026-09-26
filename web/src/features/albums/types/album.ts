export interface AlbumSearchResult {
  musicbrainzId: string;
  title: string;
  artistName: string;
  firstReleaseDate: string | null;
  coverUrl: string;
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

export interface Track {
  id: number;
  position: number;
  title: string;
  durationMs: number | null;
  musicbrainzRecordingId: string;
}
