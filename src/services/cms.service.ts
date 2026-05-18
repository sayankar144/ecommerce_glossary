import { apiFetch } from '@/lib/api';

export async function getHomepage(init?: RequestInit) {
  return apiFetch<Record<string, unknown>>('/cms/homepage', init);
}

export async function getNavigation(init?: RequestInit) {
  return apiFetch<{ items: Array<{ label: string; href: string }> }>('/cms/navigation', init);
}

export async function getFooter(init?: RequestInit) {
  return apiFetch<Record<string, unknown>>('/cms/footer', init);
}

export async function getPage(slug: string, init?: RequestInit) {
  return apiFetch<Record<string, unknown>>(`/cms/pages/${encodeURIComponent(slug)}`, init);
}
