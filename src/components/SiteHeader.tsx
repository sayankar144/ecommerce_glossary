import Link from 'next/link';
import { publicEnv } from '@/lib/env';

export function SiteHeader({ navItems }: { navItems: { label: string; href: string }[] }) {
  const items =
    navItems?.length > 0
      ? navItems
      : [
          { label: 'Shop', href: '/shop' },
          { label: 'Cart', href: '/cart' },
          { label: 'Admin', href: '/admin' },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {publicEnv.NEXT_PUBLIC_SITE_NAME}
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="hover:text-white">
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
