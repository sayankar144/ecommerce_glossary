'use client';

import { ProfileClient } from './ProfileClient';
import { Navbar } from '@/components/Navbar';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <Navbar />
      <ProfileClient />
    </main>
  );
}
