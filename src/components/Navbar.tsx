'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCategoriesAdmin } from '@/services/category.service';
import { ShoppingCart, User, LogOut, Menu, X, Sparkles, Search, ChevronDown, ShoppingBag, Heart } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export function Navbar() {
  const router = useRouter();
  const { cartCount, wishlistCount, cartTotal } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Load categories from database
    import('@/services/category.service').then(m => {
      m.getCategoriesPublic().then(res => {
        setAllCategories(res);
        setCategories(res.slice(0, 8)); // Top categories for the bar
      }).catch(() => {});
    });
    
    // Load user
    const savedUser = localStorage.getItem('retailos_customer_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('retailos_customer_token');
    localStorage.removeItem('retailos_customer_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-white border-b border-slate-100 py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="h-10 w-10 bg-[#689f38] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 hidden sm:block">
              Blue<span className="text-[#689f38]">Heaven</span>
            </span>
          </Link>


          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-6">

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="p-2 text-slate-600 hover:text-[#689f38] transition-colors flex items-center gap-1.5 group">
                  <User size={24} />
                  <span className="text-xs font-bold text-slate-700 hidden md:block group-hover:text-[#689f38] transition-colors max-w-[100px] truncate">{user.fullName || 'Profile'}</span>
                </Link>
                <button onClick={handleLogout} className="hidden sm:block text-xs font-bold text-slate-500 hover:text-red-500 transition-colors uppercase">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-[#689f38] transition-colors px-2">
                Login
              </Link>
            )}
            
            <Link href="/wishlist" className="p-2.5 text-slate-600 hover:text-[#e53935] transition-colors relative group hidden sm:block">
              <Heart size={22} className="group-hover:scale-110 transition-transform" />
              <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-[#689f38] text-[8px] font-bold text-white rounded-full flex items-center justify-center border border-white">{wishlistCount}</span>
            </Link>

            <Link href="/cart" className="flex items-center gap-2 bg-[#f4f4f4] hover:bg-slate-200 p-2 px-3 rounded-md transition-colors relative group">
              <div className="relative">
                <ShoppingCart size={24} className="text-[#e53935] group-hover:scale-110 transition-transform" />
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-[#689f38] text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[10px] text-slate-500 font-bold">My Basket</span>
                <span className="text-xs font-bold text-slate-900">₹{(cartTotal || 0).toFixed(2)}</span>
              </div>
            </Link>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Secondary Nav - Categories */}
        <div className="hidden md:flex items-center gap-6 mt-3 pb-1">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-[#689f38] text-white px-4 py-1.5 rounded-sm text-sm font-bold uppercase tracking-wide">
              Shop by Category <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-100 shadow-xl rounded-md py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
               <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {allCategories.map(cat => (
                    <Link 
                      key={cat.id} 
                      href={`/shop?category=${cat.id}`}
                      className="block px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#689f38] border-b border-slate-50 last:border-none"
                    >
                      {cat.name}
                    </Link>
                  ))}
               </div>
               <Link href="/shop" className="block px-4 py-2.5 text-[13px] font-bold text-[#689f38] bg-slate-50 text-center uppercase tracking-wider">
                  View All Categories
               </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/shop?category=${cat.id}`}
                className="text-[13px] font-medium text-slate-600 hover:text-[#689f38] uppercase tracking-wide"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Search & Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-4 animate-in slide-in-from-top duration-300">
           <div className="space-y-3">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/shop?category=${cat.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm font-bold text-slate-700 hover:text-[#689f38]"
                >
                  {cat.name}
                </Link>
              ))}
              <hr className="border-slate-100" />
              <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-slate-700 hover:text-[#e53935] flex items-center gap-2">
                <Heart size={18} /> Wishlist
              </Link>
              {user && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold text-slate-700 hover:text-[#689f38] flex items-center gap-2">
                  <User size={18} /> My Profile
                </Link>
              )}
              <Link href="/shop" className="block text-sm font-bold text-[#689f38]">View All Catalog</Link>
           </div>
        </div>
      )}
    </nav>
  );
}
