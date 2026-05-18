'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Plus, Minus, Loader2 } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';
import { addCartItem } from '@/services/cart.service';
import { addToWishlist, removeFromWishlist } from '@/services/wishlist.service';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { refreshCart, refreshWishlist, isWishlisted: checkWishlist } = useStore();
  const [quantity, setQuantity] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync with global wishlist state
  useEffect(() => {
    setIsWishlisted(checkWishlist(product.id));
  }, [product.id, checkWishlist]);

  const getAuth = () => {
    const token = localStorage.getItem('retailos_customer_token');
    let sessionId = localStorage.getItem('retailos_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(7);
      localStorage.setItem('retailos_session_id', sessionId);
    }
    return { token, sessionId };
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, sessionId } = getAuth();
      await addCartItem({ productId: product.id, quantity: 1 }, sessionId, token);
      setQuantity(1);
      await refreshCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, sessionId } = getAuth();
      await addCartItem({ productId: product.id, quantity: 1 }, sessionId, token);
      setQuantity(prev => prev + 1);
      await refreshCart();
    } catch (err) {
      console.error('Failed to increment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    setLoading(true);
    try {
      const { token, sessionId } = getAuth();
      // Using negative quantity to decrement or a separate update call
      await addCartItem({ productId: product.id, quantity: -1 }, sessionId, token);
      setQuantity(prev => Math.max(0, prev - 1));
      await refreshCart();
    } catch (err) {
      console.error('Failed to decrement:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { token } = getAuth();
    if (!token) {
      alert('Please login to use wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id, token);
        setIsWishlisted(false);
      } else {
        await addToWishlist(product.id, token);
        setIsWishlisted(true);
      }
      await refreshWishlist();
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const discount = product.discountAmount > 0 
    ? Math.round((product.discountAmount / (product.originalPrice + product.discountAmount)) * 100) 
    : 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-lg p-3 hover:shadow-xl transition-all flex flex-col h-full relative">
      {/* Wishlist Icon */}
      <button 
        onClick={toggleWishlist}
        disabled={loading}
        className={`absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center shadow-sm border transition-all ${
          isWishlisted ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-400 hover:text-red-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />}
      </button>

      {/* Image Link */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square mb-3 overflow-hidden rounded-md bg-slate-50">
        {product.images?.[0] ? (
          <img src={getMediaUrl(product.images[0])} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={48} />
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 left-0 bg-[#e53935] text-white text-[10px] font-bold px-2 py-0.5 rounded-r-sm uppercase">
             {discount}% OFF
          </div>
        )}
      </Link>
      
      {/* Product Info */}
      <div className="flex-1 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.brand || 'FRESH'}</div>
        <Link href={`/product/${product.slug}`} className="block font-medium text-slate-800 text-sm line-clamp-2 min-h-[40px] hover:text-[#689f38] transition-colors">
          {product.title}
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
          <span className="bg-slate-100 px-1.5 py-0.5 rounded">1 unit</span>
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="mt-4 pt-3 border-t border-slate-50 bg-slate-50/50 -mx-3 -mb-3 p-3 rounded-b-lg">
         <div className="flex items-baseline gap-2 mb-2">
            <div className="text-lg font-black text-slate-900">₹{product.originalPrice || 0}</div>
            {product.discountAmount > 0 && (
              <div className="text-xs text-slate-400 line-through">₹{(product.originalPrice || 0) + (product.discountAmount || 0)}</div>
            )}
         </div>

         {quantity === 0 ? (
           <button 
             onClick={handleAdd}
             disabled={loading}
             className="w-full bg-white border border-[#689f38] text-[#689f38] hover:bg-[#689f38] hover:text-white py-1.5 rounded text-sm font-bold transition-all uppercase tracking-wider active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
           >
              {loading && <Loader2 className="animate-spin" size={14} />}
              Add
           </button>
         ) : (
           <div className="flex items-center justify-between bg-[#689f38] text-white rounded overflow-hidden">
              <button 
                onClick={handleDecrement}
                disabled={loading}
                className="p-2 hover:bg-[#558b2f] transition-colors disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm flex items-center gap-2">
                {loading && <Loader2 className="animate-spin" size={12} />}
                {quantity}
              </span>
              <button 
                onClick={handleIncrement}
                disabled={loading}
                className="p-2 hover:bg-[#558b2f] transition-colors disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
           </div>
         )}
      </div>
    </div>
  );
}
