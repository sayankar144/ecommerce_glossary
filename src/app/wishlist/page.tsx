import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { WishlistClient } from './WishlistClient';

export default function WishlistPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <div className="flex flex-col gap-8">
          <div className="border-b border-slate-100 pb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
            <p className="text-slate-500 mt-2">Saved items you want to buy later.</p>
          </div>
          <WishlistClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
