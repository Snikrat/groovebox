import type { AlbumSummary } from '../albums/albums.types.js';
import type { DiscographyAlbum } from '../artists/artists.types.js';

export interface PopularAlbum {
  album: AlbumSummary;
  recentCount: number;
  totalCount: number;
}

/** Ainda não necessariamente importado para o banco local — vem direto da discografia do artista. */
export interface NewRelease extends DiscographyAlbum {
  artistName: string;
}
