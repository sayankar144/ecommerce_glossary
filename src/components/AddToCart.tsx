'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCartItem, newSession } from '@/services/cart.service';

export function AddToCart({ defaultVariantId }: { defaultVariantId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onAdd() {
    if (!defaultVariantId) return;
    setBusy(true);
    try {
      let sessionId = window.localStorage.getItem('retailos_session_id');
      if (!sessionId) {
        const s = await newSession();
        sessionId = s.sessionId;
        window.localStorage.setItem('retailos_session_id', sessionId);
      }
      await addCartItem({ variantId: defaultVariantId, quantity: 1 }, sessionId);
      router.push('/cart');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={!defaultVariantId || busy}
      className="mt-8 w-full rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground disabled:opacity-50 lg:w-auto"
    >
      Add to cart
    </button>
  );
}
