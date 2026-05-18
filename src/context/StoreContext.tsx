'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '@/services/cart.service';
import { getWishlist } from '@/services/wishlist.service';

interface StoreContextType {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  wishlistItems: string[];
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  const refreshCart = async () => {
    const token = localStorage.getItem('retailos_customer_token');
    const sessionId = localStorage.getItem('retailos_session_id');

    if (!token && !sessionId) {
      setCartCount(0);
      setCartTotal(0);
      return;
    }

    try {
      const cart = await getCart(sessionId, token);
      const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
      setCartTotal(cart.subtotal || 0);
    } catch (err) {
      console.error('Cart refresh failed', err);
    }
  };

  const refreshWishlist = async () => {
    const token = localStorage.getItem('retailos_customer_token');
    if (!token) {
      setWishlistCount(0);
      setWishlistItems([]);
      return;
    }
    try {
      const wishlist = await getWishlist(token);
      setWishlistCount(wishlist.length);
      setWishlistItems(wishlist.map((i: any) => i.id));
    } catch (err) {
      console.error('Wishlist refresh failed', err);
    }
  };

  useEffect(() => {
    refreshCart();
    refreshWishlist();
  }, []);

  const isWishlisted = (productId: string) => wishlistItems.includes(productId);

  return (
    <StoreContext.Provider value={{ 
      cartCount, 
      cartTotal,
      wishlistCount, 
      wishlistItems, 
      refreshCart, 
      refreshWishlist,
      isWishlisted 
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
