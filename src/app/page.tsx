import Link from 'next/link';
import { listProducts } from '@/services/product.service';
import { Navbar } from '@/components/Navbar';
import { HeroSlider } from '@/components/HeroSlider';
import { SiteFooter } from '@/components/SiteFooter';
import { getMediaUrl } from '@/lib/api';
import { Sparkles, TrendingUp } from 'lucide-react';

import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured] = await Promise.all([
    listProducts({ limit: '10' }),
  ]);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="pt-4 pb-20">
        <HeroSlider />


        {/* Promotional Banners */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
           <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-8 flex items-center justify-between group cursor-pointer overflow-hidden">
                 <div className="max-w-[60%]">
                    <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Bulk Savings!</h3>
                    <p className="text-slate-600 font-medium mb-4">Get extra 10% off on monthly packs</p>
                    <span className="inline-block bg-[#e53935] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase">Shop Now</span>
                 </div>
                 <TrendingUp size={120} className="text-red-500/10 -mr-8 group-hover:scale-110 transition-transform" />
              </div>
              <div className="h-48 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-8 flex items-center justify-between group cursor-pointer overflow-hidden">
                 <div className="max-w-[60%]">
                    <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Organic Picks</h3>
                    <p className="text-slate-600 font-medium mb-4">Straight from the farms to your kitchen</p>
                    <span className="inline-block bg-[#689f38] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase">Explore</span>
                 </div>
                 <Sparkles size={120} className="text-emerald-500/10 -mr-8 group-hover:scale-110 transition-transform" />
              </div>
           </div>
        </section>

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                All Products
              </h2>
              <p className="text-slate-500 font-medium mt-1">Browse our fresh selection of premium groceries.</p>
            </div>
            <Link href="/shop" className="text-sm font-bold text-[#689f38] hover:text-[#558b2f] flex items-center gap-1 transition-colors">
              View All →
            </Link>
          </div>

          {featured && featured.items && featured.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {featured.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <span className="text-xl">📦</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products found</h3>
              <p className="text-slate-500 text-sm">Products might be out of stock or draft status.</p>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
