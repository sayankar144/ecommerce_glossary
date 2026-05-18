import { apiFetch } from '@/lib/api';

export type Cart = {
  id: string;
  items: Array<{
    variantId: string;
    productId: string;
    quantity: number;
    snapshot: {
      title: string;
      sku: string;
      unitPrice: number;
      image?: string | null;
      variantTitle?: string | null;
    };
    lineTotal: number;
  }>;
  currency: string;
  subtotal: number;
};

export async function getCart(sessionId: string | null, token?: string | null, init?: RequestInit) {
  return apiFetch<Cart>('/cart', { sessionId, token, ...init });
}

export async function newSession(init?: RequestInit) {
  return apiFetch<{ sessionId: string }>('/cart/session', init);
}

export async function addCartItem(
  body: { variantId?: string; productId?: string; quantity: number },
  sessionId: string | null,
  token?: string | null,
  init?: RequestInit,
) {
  return apiFetch<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(body),
    sessionId,
    token,
    ...init,
  });
}

export async function updateItem(
  body: { variantId: string; quantity: number },
  sessionId: string | null,
  token?: string | null,
  init?: RequestInit,
) {
  return apiFetch<Cart>('/cart/items', {
    method: 'PATCH',
    body: JSON.stringify(body),
    sessionId,
    token,
    ...init,
  });
}

export async function clearCart(sessionId: string | null, token?: string | null, init?: RequestInit) {
  return apiFetch<{ success: true }>('/cart/clear', {
    method: 'POST',
    sessionId,
    token,
    ...init,
  });
}

export async function mergeCarts(sessionId: string | null, token: string, init?: RequestInit) {
  return apiFetch<Cart>('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
    token,
    ...init,
  });
}
