'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCart, addCartItem, updateItem } from '@/services/cart.service';
import type { Cart } from '@/services/cart.service';
import { publicEnv } from '@/lib/env';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';

export function CartClient() {
  const { refreshCart } = useStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadCart = async () => {
    const token = localStorage.getItem('retailos_customer_token');
    const sessionId = localStorage.getItem('retailos_session_id');
    try {
      const c = await getCart(sessionId, token);
      setCart(c);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your basket?')) return;
    const token = localStorage.getItem('retailos_customer_token');
    const sessionId = localStorage.getItem('retailos_session_id');
    setLoading(true);
    try {
      await (await import('@/services/cart.service')).clearCart(sessionId, token);
      if (cart) setCart({ ...cart, items: [], subtotal: 0 });
      await refreshCart();
    } catch (err) {
      console.error('Clear failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (variantId: string, quantity: number) => {
    const token = localStorage.getItem('retailos_customer_token');
    const sessionId = localStorage.getItem('retailos_session_id');
    setActionLoading(variantId);
    try {
      const updatedCart = await updateItem({ variantId, quantity }, sessionId, token);
      setCart(updatedCart);
      await refreshCart();
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-[#689f38]" size={48} />
        <p className="text-slate-500 font-medium">Checking your basket...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-6">
        <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center text-[#689f38]">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Your basket is empty</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Looks like you haven't added any fresh groceries to your basket yet.</p>
        </div>
        <Link href="/shop" className="bg-[#689f38] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-[#558b2f] transition-all shadow-lg shadow-emerald-100">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
           <h2 className="text-xl font-black text-slate-900">Basket Items ({cart.items.length})</h2>
           <button onClick={handleClearCart} className="text-sm font-bold text-[#e53935] hover:underline">Clear Basket</button>
        </div>
        
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.variantId} className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-100 hover:shadow-md transition-all group">
              <div className="h-24 w-24 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                {item.snapshot.image ? (
                  <img src={getMediaUrl(item.snapshot.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={32} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight mb-1">{item.snapshot.title}</h3>
                    <p className="text-xs font-medium text-slate-400">Unit: {item.snapshot.variantTitle || 'Standard'}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{item.lineTotal}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">₹{item.snapshot.unitPrice} / unit</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <button 
                      onClick={() => handleUpdateQuantity(item.variantId, item.quantity - 1)}
                      disabled={!!actionLoading}
                      className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-black text-slate-900 text-sm">
                      {actionLoading === item.variantId ? <Loader2 size={12} className="animate-spin mx-auto" /> : item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.variantId, item.quantity + 1)}
                      disabled={!!actionLoading}
                      className="p-1.5 hover:bg-white rounded-md text-slate-600 transition-colors disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleUpdateQuantity(item.variantId, 0)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#e53935] transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-28">
           <h3 className="text-xl font-black mb-8 border-b border-slate-800 pb-4">Order Summary</h3>
           
           <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Subtotal</span>
                <span className="text-white">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Delivery Fee</span>
                <span className="text-[#689f38] font-bold tracking-widest uppercase text-xs">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Tax (GST)</span>
                <span className="text-white">₹0</span>
              </div>
           </div>
           
           <div className="border-t border-slate-800 pt-6 mb-8">
              <div className="flex justify-between items-baseline">
                 <span className="text-slate-400 font-bold">Total Amount</span>
                 <span className="text-3xl font-black text-[#689f38]">₹{cart.subtotal}</span>
              </div>
           </div>
           
           <Link href="/checkout" className="flex items-center justify-center gap-3 w-full bg-[#689f38] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#558b2f] transition-all shadow-lg shadow-emerald-950 mb-6">
              Checkout <ArrowRight size={20} />
           </Link>
           
           <div className="flex items-center gap-3 justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={16} className="text-[#689f38]" />
              Secure Checkout Powered by RetailOS
           </div>
        </div>
        
        {/* Promo Code */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
           <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Promo Code</p>
           <div className="flex gap-2">
              <input type="text" placeholder="Enter code" className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-200" />
              <button className="text-[#689f38] font-bold text-sm px-4">Apply</button>
           </div>
        </div>
      </div>
    </div>
  );
}
