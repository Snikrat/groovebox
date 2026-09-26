import type { AlbumSummary } from '../albums/albums.types.js';

export interface PopularAlbum {
  album: AlbumSummary;
  recentCount: number;
  totalCount: number;
}
