import { api } from '../../../shared/services/api';
import type { NotificationPage } from '../types/notification';

export async function listNotifications(offset = 0): Promise<NotificationPage> {
  const { data } = await api.get<NotificationPage>('/notifications', { params: { offset } });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
