import { apiFetch } from '@/lib/api';

export type AdminOverview = {
  allTime: { revenue: number; orders: number };
  today: { revenue: number; orders: number };
  thisMonth: { revenue: number; orders: number };
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
};

export async function getAdminOverview(token: string) {
  return apiFetch<AdminOverview>('/admin/analytics/overview', { token });
}

export async function getRevenueAnalytics(token: string, period = '30d') {
  return apiFetch<any[]>(`/admin/analytics/revenue?period=${period}`, { token });
}

export async function getTopProducts(token: string, limit = 10) {
  return apiFetch<any[]>(`/admin/analytics/top-products?limit=${limit}`, { token });
}
