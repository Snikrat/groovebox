import { api } from '../../../shared/services/api';
import type { Stats } from '../types/stats';

export async function getStats(): Promise<Stats> {
  const { data } = await api.get<Stats>('/stats');
  return data;
}
