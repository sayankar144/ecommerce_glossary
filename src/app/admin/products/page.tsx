'use client';

import { useEffect, useState } from 'react';
import { listProductsAdmin, createProductAdmin, updateProductAdmin, deleteProductAdmin } from '@/services/product.service';
import { getMediaUrl } from '@/lib/api';
import { getCategoriesAdmin, createCategoryAdmin, Category } from '@/services/category.service';
import { 
  Plus, Edit2, Trash2, Search, X, Check, Package, Filter, 
  ChevronRight, PlusCircle, Loader2, Image as ImageIcon, 
  Tag, Globe, DollarSign, Settings2 
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  const [activeTab, setActiveTab] = useState('basic');
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    originalPrice: '',
    discountAmount: '',
    sku: '',
    description: '',
    categoryIds: [] as string[],
    status: 'in_stock',
    images: [] as string[],
    attributes: [] as { key: string; value: string }[]
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newCatData, setNewCatData] = useState({ name: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        listProductsAdmin(token),
        getCategoriesAdmin(token)
      ]);
      setProducts(prodRes.items);
      setCategories(catRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const attributeObj = formData.attributes.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as any);

      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description || '');
      fd.append('sku', formData.sku || '');
      fd.append('originalPrice', formData.originalPrice || '0');
      fd.append('discountAmount', formData.discountAmount || '0');
      fd.append('status', formData.status);
      fd.append('attributes', JSON.stringify(attributeObj));
      
      formData.categoryIds.forEach(id => fd.append('categoryIds', id));
      selectedFiles.forEach(file => fd.append('images', file));
      // Keep existing images (URLs)
      formData.images.filter(img => img.startsWith('/')).forEach(img => fd.append('images', img));

      if (editingProduct) {
        await updateProductAdmin(token, editingProduct.id, fd as any);
      } else {
        await createProductAdmin(token, fd as any);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  }

  function resetForm() {
    setFormData({ 
      title: '', originalPrice: '', discountAmount: '', sku: '', description: '', 
      categoryIds: [], status: 'in_stock', images: [],
      attributes: []
    });
    setSelectedFiles([]);
    setActiveTab('basic');
    setImageUrlInput('');
  }

  function addImageUrl() {
    if (!imageUrlInput.trim()) return;
    setFormData({ ...formData, images: [...formData.images, imageUrlInput.trim()] });
    setImageUrlInput('');
  }

  function removeImage(index: number) {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  }

  function addAttribute() {
    setFormData({ ...formData, attributes: [...formData.attributes, { key: '', value: '' }] });
  }

  function updateAttribute(index: number, key: string, value: string) {
    const newAttrs = [...formData.attributes];
    newAttrs[index] = { key, value };
    setFormData({ ...formData, attributes: newAttrs });
  }

  function removeAttribute(index: number) {
    const newAttrs = [...formData.attributes];
    newAttrs.splice(index, 1);
    setFormData({ ...formData, attributes: newAttrs });
  }

  async function handleQuickCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newCat = await createCategoryAdmin(token, { name: newCatData.name });
      setCategories([...categories, newCat]);
      setFormData({ ...formData, categoryIds: [...formData.categoryIds, newCat.id] });
      setIsCatModalOpen(false);
      setNewCatData({ name: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create category');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProductAdmin(token, id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RetailOS Inventory</h1>
          <p className="text-slate-500 text-sm">Manage your store products and categories.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* List View */}
      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-slate-950/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading your store data...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No products found. Start by adding one!</div>
          ) : products.map((p) => (
            <div key={p.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-950 rounded-xl flex items-center justify-center text-blue-500 border border-white/10 overflow-hidden">
                  {p.images && p.images[0] ? (
                    <img src={getMediaUrl(p.images[0])} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{p.sku || 'No SKU'}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="font-bold text-white">₹{p.originalPrice || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Original Price</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingProduct(p);
                    // Convert attributes object to array
                    const attributes = Object.entries(p.attributes || {}).map(([key, value]) => ({ key, value: String(value) }));
                    
                    setFormData({
                      title: p.title || '',
                      originalPrice: String(p.originalPrice || ''),
                      discountAmount: String(p.discountAmount || ''),
                      sku: p.sku || '',
                      description: p.description || '',
                      categoryIds: p.categoryIds || [],
                      status: p.status || 'in_stock',
                      images: p.images || [],
                      attributes
                    });
                    setIsModalOpen(true);
                  }} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STABLE MODAL DESIGN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure your product catalog details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-slate-900/50">
              {[
                { id: 'basic', label: 'Basic Info', icon: Package },
                { id: 'pricing', label: 'Pricing', icon: DollarSign },
                { id: 'images', label: 'Images', icon: ImageIcon },
                { id: 'attributes', label: 'Attributes', icon: Tag }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2",
                    activeTab === tab.id ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  )}
                >
                  <tab.icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-900">
              {activeTab === 'basic' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Product Title</label>
                    <input 
                      required autoFocus
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter product name..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">SKU (Stock Keeping Unit)</label>
                      <input 
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        placeholder="SKU-XXX"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Categories</label>
                      <button type="button" onClick={() => setIsCatModalOpen(true)} className="text-xs text-blue-500 font-bold hover:underline">+ New</button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 bg-slate-950 border border-white/10 rounded-xl max-h-40 overflow-y-auto custom-scrollbar">
                      {categories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={formData.categoryIds.includes(cat.id)}
                            onChange={(e) => {
                              const ids = e.target.checked 
                                ? [...formData.categoryIds, cat.id]
                                : formData.categoryIds.filter(id => id !== cat.id);
                              setFormData({...formData, categoryIds: ids});
                            }}
                            className="h-4 w-4 rounded border-white/20 bg-slate-800 text-blue-600 focus:ring-0"
                          />
                          <span className="truncate">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Product details..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Original Price (INR)</label>
                      <div className="relative">
                         <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                         <input 
                          required type="number"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Discount Amount (INR)</label>
                      <input 
                        type="number"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-blue-500">Upload Product Images</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-8 bg-slate-950/50 hover:bg-slate-950 hover:border-blue-500/50 transition-all group">
                      <ImageIcon size={40} className="text-slate-600 group-hover:text-blue-500 mb-3 transition-colors" />
                      <p className="text-xs font-bold text-slate-500 mb-4 tracking-widest uppercase">Select files or drag & drop</p>
                      <input 
                        type="file" multiple accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button type="button" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Browse Files</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Existing Remote Images */}
                    {formData.images.map((url, idx) => (
                      <div key={`exist-${idx}`} className="group relative aspect-square rounded-2xl border border-white/10 bg-slate-950 overflow-hidden">
                        <img src={getMediaUrl(url)} alt="" className="h-full w-full object-cover" />
                        <button 
                          type="button" onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {/* Locally Selected Files */}
                    {selectedFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="group relative aspect-square rounded-2xl border border-blue-500/30 bg-slate-950 overflow-hidden">
                        <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
                        <div className="absolute top-2 left-2 bg-blue-600 text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-lg text-white">New</div>
                        <button 
                          type="button" onClick={() => {
                            const nf = [...selectedFiles];
                            nf.splice(idx, 1);
                            setSelectedFiles(nf);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {activeTab === 'attributes' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Custom Specifications</label>
                    <button 
                      type="button" 
                      onClick={addAttribute}
                      className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1"
                    >
                      <PlusCircle size={14} /> Add Attribute
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.attributes.map((attr, idx) => (
                      <div key={idx} className="flex gap-3 animate-in slide-in-from-right-2">
                        <input 
                          value={attr.key}
                          onChange={(e) => updateAttribute(idx, e.target.value, attr.value)}
                          placeholder="Key (e.g. Color)"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                        />
                        <input 
                          value={attr.value}
                          onChange={(e) => updateAttribute(idx, attr.key, e.target.value)}
                          placeholder="Value (e.g. Red)"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                        />
                        <button 
                          type="button"
                          onClick={() => removeAttribute(idx)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    {formData.attributes.length === 0 && (
                      <div className="py-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
                        No custom attributes defined
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-slate-900 pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-white">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                   <Check size={20} /> {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Quick Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-white/10 p-8 shadow-2xl animate-in">
            <h3 className="text-xl font-bold text-white mb-6">New Category</h3>
            <div className="space-y-4">
              <input 
                required autoFocus
                value={newCatData.name}
                onChange={(e) => setNewCatData({name: e.target.value})}
                placeholder="Category Name"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-4 pt-2">
                <button onClick={() => setIsCatModalOpen(false)} className="text-sm text-slate-500 font-bold hover:text-white">Cancel</button>
                <button onClick={handleQuickCatSubmit} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
