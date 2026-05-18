import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { CheckoutClient } from './CheckoutClient';

export const metadata = {
  title: 'Checkout | BlueHeaven',
  description: 'Complete your purchase with secure checkout.',
};

export default function CheckoutPage() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
        <CheckoutClient />
      </main>
      <SiteFooter />
    </div>
  );
}
