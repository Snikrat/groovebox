import type { AlbumSummary } from '../../albums/types/album';

export interface Listen {
  id: number;
  albumId: number;
  /** Data no formato AAAA-MM-DD, sem hora. */
  listenedOn: string;
  /** Nota dada a esta audição específica, se houver. Independente da nota do álbum. */
  rating: number | null;
  createdAt: string;
}

export interface ListenWithAlbum extends Listen {
  album: AlbumSummary;
  /** Nota atual do álbum (de reviews), para referência — pode diferir da nota desta audição. */
  reviewRating: number | null;
  /** true quando esta não foi a primeira audição registrada do álbum. */
  isRelisten: boolean;
}

export interface ListenPage {
  items: ListenWithAlbum[];
  hasMore: boolean;
}
