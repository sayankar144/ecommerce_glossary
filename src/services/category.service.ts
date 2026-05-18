import { apiFetch } from '@/lib/api';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  sortOrder: number;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getCategoriesAdmin(token: string) {
  return apiFetch<Category[]>('/admin/categories', { token });
}

export async function createCategoryAdmin(token: string, body: Partial<Category>) {
  return apiFetch<Category>('/admin/categories', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export async function updateCategoryAdmin(token: string, id: string, body: Partial<Category>) {
  return apiFetch<Category>(`/admin/categories/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteCategoryAdmin(token: string, id: string) {
  return apiFetch<{ success: true }>(`/admin/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getCategoriesPublic() {
  return apiFetch<Category[]>('/categories');
}
