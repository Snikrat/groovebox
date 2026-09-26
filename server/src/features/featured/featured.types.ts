import type { AlbumSummary } from '../albums/albums.types.js';

export interface FeaturedAlbum {
  position: number;
  album: AlbumSummary;
}
