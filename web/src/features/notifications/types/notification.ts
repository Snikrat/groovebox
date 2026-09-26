import type { AlbumSummary } from '../../albums/types/album';

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
  album: AlbumSummary | null;
}

export interface NotificationPage {
  items: Notification[];
  hasMore: boolean;
}
