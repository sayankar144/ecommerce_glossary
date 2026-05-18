import { apiFetch } from '@/lib/api';

export type WishlistItem = {
  productId: string;
  addedAt: string;
  product?: any;
};

export async function getWishlist(token: string) {
  const data = await apiFetch<any>('/wishlist', { token });
  return data.products || [];
}

export async function addToWishlist(productId: string, token: string) {
  return apiFetch<{ success: true }>('/wishlist/add', {
    method: 'POST',
    token,
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromWishlist(productId: string, token: string) {
  return apiFetch<{ success: true }>(`/wishlist/remove/${productId}`, {
    method: 'DELETE',
    token,
  });
}
