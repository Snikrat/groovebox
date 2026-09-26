import { api } from '../../../shared/services/api';
import type { WishlistItem } from '../types/wishlist';

export async function listWishlist(): Promise<WishlistItem[]> {
  const { data } = await api.get<WishlistItem[]>('/wishlist');
  return data;
}

export async function addToWishlist(albumId: number): Promise<void> {
  await api.post(`/wishlist/${albumId}`);
}

export async function removeFromWishlist(albumId: number): Promise<void> {
  await api.delete(`/wishlist/${albumId}`);
}
