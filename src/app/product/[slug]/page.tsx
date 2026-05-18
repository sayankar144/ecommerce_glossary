import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/services/product.service';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { getMediaUrl } from '@/lib/api';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductBySlug(slug).catch(() => null);
  
  if (!data) notFound();

  const { product } = data;
  const discount = product.discountAmount > 0 
    ? Math.round((product.discountAmount / (product.originalPrice + product.discountAmount)) * 100) 
    : 0;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#689f38]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#689f38]">Shop</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative">
              {product.images?.[0] ? (
                <img src={getMediaUrl(product.images[0])} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <ShoppingBag size={120} />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-6 left-0 bg-[#e53935] text-white text-xs font-bold px-4 py-1.5 rounded-r-md uppercase shadow-lg">
                   {discount}% OFF
                </div>
              )}
            </div>
            {/* Thumbnails if any */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-lg bg-slate-50 border border-slate-100 overflow-hidden cursor-pointer hover:border-[#689f38] transition-all">
                    <img src={getMediaUrl(img)} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="space-y-1 mb-6">
              <div className="text-xs font-bold text-[#689f38] uppercase tracking-widest">{product.brand || 'FRESH'}</div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">{product.title}</h1>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <div className="text-4xl font-black text-slate-900">₹{product.originalPrice}</div>
              {product.discountAmount > 0 && (
                <div className="text-xl text-slate-400 line-through">₹{product.originalPrice + product.discountAmount}</div>
              )}
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">In Stock</span>
            </div>

            <div className="prose prose-slate mb-10 max-w-none">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Product Description</h3>
              <p className="text-slate-600 leading-relaxed">{product.description || 'No description available for this product.'}</p>
            </div>

            <div className="mt-auto space-y-6">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-500 block">Unit Selection</span>
                    <span className="text-lg font-black text-slate-900">1 Unit (Standard)</span>
                  </div>
                  {/* We reuse the ProductCard logic or similar for the action area */}
               </div>
               
               {/* Simplified Add to Cart specifically for this page */}
               <div className="max-w-xs">
                  <ProductCard product={product} />
               </div>
            </div>
          </div>
        </div>

        {/* Similar Products Placeholder */}
        <section className="pt-16 border-t border-slate-100">
           <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">You might also like</h2>
           <div className="flex items-center justify-center py-12 text-slate-400 font-medium italic bg-slate-50 rounded-xl">
              More fresh picks coming soon...
           </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
