import { listProducts } from '@/services/product.service';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { getCategoriesPublic } from '@/services/category.service';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categoryId = params.category;
  const query = params.q;

  const [productsData, categories] = await Promise.all([
    listProducts({ 
      limit: '24', 
      categoryId: categoryId || '', 
      q: query || '' 
    }),
    getCategoriesPublic().catch(() => []),
  ]);

  const currentCategory = categoryId 
    ? categories.find(c => c.id === categoryId) 
    : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-40 pb-24 md:pt-48 md:pb-32">
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {currentCategory ? currentCategory.name : query ? `Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-slate-500 font-medium italic">
            {currentCategory?.description || 'Browse our fresh selection of premium groceries.'}
          </p>
        </div>

        {productsData.items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {productsData.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">No products found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
