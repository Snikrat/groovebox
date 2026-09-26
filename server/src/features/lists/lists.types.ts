import type { AlbumSummary } from '../albums/albums.types.js';

export interface ListOwner {
  username: string;
  name: string;
}

export interface ListSummary {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface ListWithItems extends ListSummary {
  owner: ListOwner;
  items: AlbumSummary[];
}
