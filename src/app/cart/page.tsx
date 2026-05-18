import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { CartClient } from './CartClient';

export default async function CartPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-40 pb-24 md:pt-48 md:pb-32">
        <div className="mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#689f38] transition-colors mb-6 group"
          >
            <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-[#689f38] transition-all">
              <ArrowLeft size={16} />
            </div>
            Back to Shop
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Grocery Basket</h1>
            <p className="text-slate-500 font-medium italic">Freshness is just one step away.</p>
          </div>
        </div>
        <CartClient />
      </main>
      <SiteFooter />
    </div>
  );
}
