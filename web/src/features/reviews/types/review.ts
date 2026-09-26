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

export interface ReviewAuthor {
  username: string;
  name: string;
}

/** Avaliação de outra pessoa, com dados sociais: usada no feed e em "Outras avaliações" do álbum. */
export interface PublicReview extends Review {
  author: ReviewAuthor;
  album: AlbumSummary;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
}

export interface ReviewComment {
  id: number;
  reviewId: number;
  text: string;
  createdAt: string;
  author: ReviewAuthor;
}
