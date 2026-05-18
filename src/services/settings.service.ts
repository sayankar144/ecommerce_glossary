import { apiFetch } from '@/lib/api';

export type StoreSettings = {
  storeName?: string;
  contactEmail?: string;
  contactPhone?: string;
  currency?: string;
  currencySymbol?: string;
  logoUrl?: string;
  faviconUrl?: string;
  socialLinks?: Record<string, string>;
  seoTitle?: string;
  seoDescription?: string;
};

export async function getStoreSettingsPublic() {
  return apiFetch<StoreSettings>('/settings/store');
}

export async function updateStoreSettingsAdmin(token: string, body: StoreSettings) {
  return apiFetch<StoreSettings>('/admin/settings', {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}
