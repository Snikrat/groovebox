import type { AlbumSummary } from '../albums/albums.types.js';

export interface Listen {
  id: number;
  albumId: number;
  /** Data no formato AAAA-MM-DD, sem hora. */
  listenedOn: string;
  createdAt: string;
}

export interface ListenWithAlbum extends Listen {
  album: AlbumSummary;
  /** Nota que o usuário deu ao álbum, se já o avaliou. */
  rating: number | null;
  /** true quando esta não foi a primeira audição registrada do álbum. */
  isRelisten: boolean;
}

export interface ListenPage {
  items: ListenWithAlbum[];
  hasMore: boolean;
}
