'use client';

import { useEffect, useState } from 'react';
import { getCategoriesAdmin, createCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin, Category } from '@/services/category.service';
import { 
  Plus, Edit2, Trash2, Folder, Search, X, Check, 
  ChevronRight, FolderPlus, Loader2, Settings2 
} from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', parentId: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategoriesAdmin(token);
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategoryAdmin(token, editingCategory.id, {
          ...formData,
          parentId: formData.parentId || null,
        });
      } else {
        await createCategoryAdmin(token, {
          ...formData,
          parentId: formData.parentId || null,
        });
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', parentId: '' });
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategoryAdmin(token, id);
      loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-slate-500">Organize your products into logical collections.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '', parentId: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="glass-morphism overflow-hidden rounded-3xl">
        <div className="border-b border-white/5 bg-white/5 px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-slate-950/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500/50 focus:bg-white/5"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-sm font-medium">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Folder size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">No categories found. Start by adding one!</p>
            </div>
          ) : filteredCategories.map((category) => (
            <div key={category.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-950 rounded-xl flex items-center justify-center text-blue-500 border border-white/10">
                  <Folder size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{category.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{category.slug}</span>
                    {category.parentId && (
                      <>
                        <ChevronRight size={12} className="text-slate-700" />
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400 font-bold">
                          {categories.find(c => c.id === category.parentId)?.name || 'Parent'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({ 
                      name: category.name, 
                      slug: category.slug, 
                      description: category.description || '', 
                      parentId: category.parentId || '' 
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PREMIUM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Organize your store catalog</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar bg-slate-900">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category Name</label>
                <input 
                  required autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Electronics, Fresh Fruits..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Slug (URL Name)</label>
                  <input 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="electronics-gear"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Parent Category</label>
                  <select 
                    value={formData.parentId}
                    onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe this collection..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-white">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                   <Check size={20} /> {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
