import type { AlbumSummary } from '../../albums/types/album';

export interface Favorite {
  albumId: number;
  createdAt: string;
  /** Nota que o usuário deu ao álbum, se já o avaliou. */
  rating: number | null;
  album: AlbumSummary;
}
