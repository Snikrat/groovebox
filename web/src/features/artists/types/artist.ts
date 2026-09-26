export interface DiscographyAlbum {
  musicbrainzId: string;
  title: string;
  firstReleaseDate: string | null;
  coverUrl: string;
}

export interface Artist {
  musicbrainzId: string;
  name: string;
  albums: DiscographyAlbum[];
}
