import type { AlbumSummary } from '../../albums/types/album';

export interface Review {
  id: number;
  albumId: number;
  rating: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithAlbum extends Review {
  album: AlbumSummary;
}

export interface ReviewInput {
  rating: number;
  review: string | null;
}
