import { apiFetch } from '@/lib/api';

export type LoginInput = { email: string; password: string };

export async function loginCustomer(body: LoginInput, init?: RequestInit) {
  return apiFetch<{
    customer: { id: string; email: string; fullName: string; phoneNumber: string };
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }>('/auth/customer/login', { method: 'POST', body: JSON.stringify(body), ...init });
}

export type RegisterInput = { fullName: string; email: string; phoneNumber: string; password: string };

export async function registerCustomer(body: RegisterInput, init?: RequestInit) {
  return apiFetch<{
    customer: { id: string; email: string; fullName: string; phoneNumber: string };
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }>('/auth/customer/register', { method: 'POST', body: JSON.stringify(body), ...init });
}

export async function loginStaff(body: LoginInput, init?: RequestInit) {
  return apiFetch<{
    user: { id: string; email: string; role: string };
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }>('/auth/staff/login', { method: 'POST', body: JSON.stringify(body), ...init });
}

export async function refreshTokens(refreshToken: string, init?: RequestInit) {
  return apiFetch<{ accessToken: string; refreshToken: string; expiresAt: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
    ...init,
  });
}

export type Customer = {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  status: string;
  createdAt: string | null;
};

export async function listCustomersAdmin(token: string, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return apiFetch<{ items: Customer[]; meta: any }>(`/admin/customers${qs}`, { token });
}
