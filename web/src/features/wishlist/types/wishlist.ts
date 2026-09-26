import type { AlbumSummary } from '../../albums/types/album';

export interface WishlistItem {
  albumId: number;
  createdAt: string;
  album: AlbumSummary;
}
