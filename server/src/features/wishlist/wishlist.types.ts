import type { AlbumSummary } from '../albums/albums.types.js';

export interface WishlistItem {
  albumId: number;
  createdAt: string;
  album: AlbumSummary;
}
