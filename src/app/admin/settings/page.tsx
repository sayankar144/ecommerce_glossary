'use client';

import { useEffect, useState } from 'react';
import { getStoreSettingsPublic, updateStoreSettingsAdmin, StoreSettings } from '@/services/settings.service';
import { 
  Settings2, Save, Globe, Paintbrush, Search, 
  Mail, Phone, ShieldAlert, Loader2, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'RetailOS',
    contactEmail: '',
    contactPhone: '',
    currency: 'INR',
    currencySymbol: '₹',
    logoUrl: '',
    faviconUrl: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'seo'>('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    try {
      const res = await getStoreSettingsPublic();
      if (res) {
        setSettings(prev => ({
          ...prev,
          ...res,
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const activeToken = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';
      const updated = await updateStoreSettingsAdmin(activeToken, settings);
      setSettings(updated);
      setSuccessMsg('Store settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update store settings');
    } finally {
      setIsSaving(false);
    }
  }

  function handleFieldChange(key: keyof StoreSettings, val: any) {
    setSettings(prev => ({
      ...prev,
      [key]: val,
    }));
  }

  const tabs = [
    { id: 'general', name: 'General Information', icon: Settings2 },
    { id: 'branding', name: 'Branding & Assets', icon: Paintbrush },
    { id: 'seo', name: 'SEO & Meta Config', icon: Globe },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-500 animate-pulse" size={24} /> Store Settings
          </h1>
          <p className="text-slate-500 text-sm">Configure your checkout currencies, support details, and SEO brand identities.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all relative outline-none ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <ShieldAlert size={18} />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <span>Retrieving core configurations...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Store Name</label>
                  <input
                    type="text"
                    required
                    value={settings.storeName || ''}
                    onChange={(e) => handleFieldChange('storeName', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="Enter store name..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Support Email Address</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ''}
                    onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. support@store.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Support Phone Number</label>
                  <input
                    type="text"
                    value={settings.contactPhone || ''}
                    onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. +91 93302 30474"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Currency (ISO)</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={settings.currency || ''}
                      onChange={(e) => handleFieldChange('currency', e.target.value.toUpperCase())}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-center font-mono font-bold"
                      placeholder="e.g. INR"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">Currency Symbol</label>
                    <input
                      type="text"
                      value={settings.currencySymbol || ''}
                      onChange={(e) => handleFieldChange('currencySymbol', e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none text-center font-bold"
                      placeholder="e.g. ₹"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Brand Logo URL</label>
                  <input
                    type="url"
                    value={settings.logoUrl || ''}
                    onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-[10px] text-slate-500">Provide an absolute URL pointing to your store logo asset.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Favicon Asset URL</label>
                  <input
                    type="url"
                    value={settings.faviconUrl || ''}
                    onChange={(e) => handleFieldChange('faviconUrl', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="https://example.com/favicon.ico"
                  />
                  <p className="text-[10px] text-slate-500">Must point to a standard icon or square layout PNG image.</p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">Global SEO Title Page</label>
                  <input
                    type="text"
                    value={settings.seoTitle || ''}
                    onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. RetailOS — Best Online Fashion & Grocery store"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">SEO Meta Description</label>
                  <textarea
                    rows={4}
                    value={settings.seoDescription || ''}
                    onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none resize-none leading-relaxed text-sm"
                    placeholder="Enter meta description for search engine indexers..."
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="border-t border-white/10 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
