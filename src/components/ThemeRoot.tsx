'use client';

import { publicEnv } from '@/lib/env';

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50" data-theme={publicEnv.NEXT_PUBLIC_DEFAULT_THEME}>
      {children}
    </div>
  );
}
