import { apiFetch } from '@/lib/api';

export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  createdAt: string;
};

export async function getCustomerProfile(token: string) {
  return apiFetch<CustomerProfile>('/account/profile', { token });
}

export async function updateCustomerProfile(token: string, body: { fullName?: string; phoneNumber?: string; email?: string }) {
  return apiFetch<CustomerProfile>('/account/profile', {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}
