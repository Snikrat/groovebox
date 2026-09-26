import type { AlbumSummary } from '../albums/albums.types.js';

export type NotificationType = 'follow' | 'like' | 'comment';

export interface NotificationActor {
  username: string;
  name: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
  actor: NotificationActor;
  /** Só presente para "like" e "comment". */
  album: AlbumSummary | null;
}
