import type { Metadata } from 'next';
import './globals.css';
import { publicEnv } from '@/lib/env';
import { ThemeRoot } from '@/components/ThemeRoot';
import { StoreProvider } from '@/context/StoreContext';
import { ClickTracker } from '@/components/ClickTracker';

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: publicEnv.NEXT_PUBLIC_SITE_NAME,
    template: `%s · ${publicEnv.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: 'RetailOS storefront — configurable per deployment.',
  openGraph: {
    type: 'website',
    url: publicEnv.NEXT_PUBLIC_SITE_URL,
    siteName: publicEnv.NEXT_PUBLIC_SITE_NAME,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme={publicEnv.NEXT_PUBLIC_DEFAULT_THEME}>
      <body>
        <StoreProvider>
          <ClickTracker />
          <ThemeRoot>{children}</ThemeRoot>
        </StoreProvider>
      </body>
    </html>
  );
}
