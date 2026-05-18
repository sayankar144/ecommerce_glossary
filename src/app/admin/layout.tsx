'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('retailos_staff_token');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsLoaded(true);
    }
  }, [pathname, router]);

  const handleSignOut = () => {
    localStorage.removeItem('retailos_staff_token');
    localStorage.removeItem('retailos_staff_user');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;
  if (!isLoaded) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/10 border-t-blue-500" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-2xl transition-all duration-500 ease-in-out",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="flex h-20 items-center px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <span className="ml-3 text-xl font-black tracking-tighter text-white animate-in fade-in duration-700">
              Retail<span className="text-blue-500">OS</span>
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400" 
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={22} className={cn("shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {isSidebarOpen && (
                  <span className="ml-4 text-sm font-bold tracking-tight animate-in slide-in-from-left-2">{item.name}</span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                )}
                {isActive && isSidebarOpen && (
                  <ChevronRight size={14} className="ml-auto opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <button 
            onClick={handleSignOut}
            className={cn(
              "flex w-full items-center rounded-2xl px-4 py-3.5 text-slate-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-4 text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-500 ease-in-out",
        isSidebarOpen ? "ml-72" : "ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-slate-950/30 px-8 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all active:scale-90"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative hidden lg:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search command... (Ctrl + K)"
                className="h-10 w-80 rounded-xl border border-white/5 bg-white/5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500/50 focus:bg-white/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-slate-950" />
            </button>
            <div className="h-8 w-px bg-white/5 mx-2" />
            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-white tracking-wide uppercase">Super Admin</div>
                <div className="text-[10px] text-slate-500 font-bold">staff@retailos.com</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 p-0.5 ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center font-bold text-blue-400">S</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
