'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '@/services/wishlist.service';
import { addCartItem } from '@/services/cart.service';
import { getMediaUrl } from '@/lib/api';
import { useStore } from '@/context/StoreContext';

export function WishlistClient() {
  const { refreshWishlist } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    const token = localStorage.getItem('retailos_customer_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await getWishlist(token);
      setItems(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    const token = localStorage.getItem('retailos_customer_token');
    if (!token) return;

    setActionLoading(productId);
    try {
      await removeFromWishlist(productId, token);
      setItems(prev => prev.filter(i => i.id !== productId));
      await refreshWishlist();
    } catch (err) {
      console.error('Remove failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem('retailos_customer_token');
    let sessionId = localStorage.getItem('retailos_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(7);
      localStorage.setItem('retailos_session_id', sessionId);
    }

    setActionLoading(`cart-${productId}`);
    try {
      if (!productId) throw new Error('Product ID is missing');
      await addCartItem({ productId, quantity: 1 }, sessionId, token);
      // Optional: remove from wishlist after adding to cart
      // await removeFromWishlist(productId, token);
      // setItems(prev => prev.filter(i => i.productId !== productId));
      alert('Added to cart!');
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[#689f38]" size={40} />
        <p className="text-slate-500 font-medium">Loading your wishlist...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Start adding items you love to your wishlist and they will appear here.</p>
        </div>
        <Link href="/shop" className="bg-[#689f38] text-white px-8 py-3 rounded-md font-bold uppercase tracking-wider hover:bg-[#558b2f] transition-all flex items-center gap-2">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((product) => (
        <div key={product.id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-all group">
          <div className="h-24 w-24 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
            {product.images?.[0] ? (
              <img src={getMediaUrl(product.images[0])} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-200">
                <ShoppingBag size={32} />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-1">
              <Link href={`/product/${product.slug}`} className="font-bold text-slate-800 hover:text-[#689f38] transition-colors line-clamp-1">
                {product.title || 'Unknown Product'}
              </Link>
              <div className="text-lg font-black text-slate-900">₹{product.originalPrice || 0}</div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAddToCart(product.id)}
                disabled={!!actionLoading}
                className="flex-1 bg-[#689f38] text-white py-1.5 rounded font-bold text-xs uppercase tracking-wider hover:bg-[#558b2f] transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {actionLoading === `cart-${product.id}` ? <Loader2 className="animate-spin" size={12} /> : 'Add to Cart'}
              </button>
              <button 
                onClick={() => handleRemove(product.id)}
                disabled={!!actionLoading}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                title="Remove from wishlist"
              >
                {actionLoading === product.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
