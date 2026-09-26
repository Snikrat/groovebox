import { api } from '../../../shared/services/api';
import type { ListSummary, ListWithItems } from '../types/list';

export async function listMyLists(): Promise<ListSummary[]> {
  const { data } = await api.get<ListSummary[]>('/lists');
  return data;
}

export async function createList(title: string, description: string | null): Promise<ListSummary> {
  const { data } = await api.post<ListSummary>('/lists', { title, description });
  return data;
}

export async function getList(id: number): Promise<ListWithItems> {
  const { data } = await api.get<ListWithItems>(`/lists/${id}`);
  return data;
}

export async function updateList(id: number, title: string, description: string | null): Promise<ListSummary> {
  const { data } = await api.put<ListSummary>(`/lists/${id}`, { title, description });
  return data;
}

export async function deleteList(id: number): Promise<void> {
  await api.delete(`/lists/${id}`);
}

export async function addListItem(id: number, albumId: number): Promise<void> {
  await api.post(`/lists/${id}/items`, { albumId });
}

export async function removeListItem(id: number, albumId: number): Promise<void> {
  await api.delete(`/lists/${id}/items/${albumId}`);
}
