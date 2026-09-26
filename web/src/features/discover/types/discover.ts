import type { AlbumSummary } from '../../albums/types/album';

export interface PopularAlbum {
  album: AlbumSummary;
  recentCount: number;
  totalCount: number;
}
