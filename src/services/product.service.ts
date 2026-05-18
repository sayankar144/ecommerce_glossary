import { apiFetch } from '@/lib/api';

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  brand?: string | null;
  sku?: string | null;
  originalPrice: number;
  discountAmount: number;
  status: 'in_stock' | 'out_stock';
  images: string[];
  categoryIds: string[];
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type ProductList = {
  items: Array<{
    id: string;
    title: string;
    slug: string;
    originalPrice: number;
    discountAmount: number;
    images?: string[];
    sku?: string | null;
    status: string;
  }>;
  meta: { total: number; page: number; limit: number; pages: number };
};

export async function listProducts(params?: Record<string, string>, init?: RequestInit) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return apiFetch<ProductList>(`/products${qs}`, init);
}

export async function getProductBySlug(slug: string, init?: RequestInit) {
  return apiFetch<{
    product: Product;
    variants: any[];
  }>(`/products/${encodeURIComponent(slug)}`, init);
}

/* Admin Methods */

export async function listProductsAdmin(token: string, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return apiFetch<ProductList>(`/admin/products${qs}`, { token });
}

export async function createProductAdmin(token: string, body: FormData | Partial<Product>) {
  return apiFetch<Product>('/admin/products', {
    method: 'POST',
    token,
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function updateProductAdmin(token: string, id: string, body: FormData | Partial<Product>) {
  return apiFetch<Product>(`/admin/products/${id}`, {
    method: 'PATCH',
    token,
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function deleteProductAdmin(token: string, id: string) {
  return apiFetch<{ success: true }>(`/admin/products/${id}`, {
    method: 'DELETE',
    token,
  });
}
