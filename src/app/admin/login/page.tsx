'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginStaff } from '@/services/auth.service';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await loginStaff({ email, password });
      
      // Store token and user info
      localStorage.setItem('retailos_staff_token', data.accessToken);
      localStorage.setItem('retailos_staff_user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] p-4 font-sans text-slate-200">
      {/* Background Decorative Elements */}
      <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute top-[20%] right-[10%] h-[30%] w-[30%] rounded-full bg-indigo-600/10 blur-[100px]" />

      {/* Login Card */}
      <div className="animate-in relative w-full max-w-md">
        <div className="glass-morphism rounded-3xl p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="gradient-text text-3xl font-bold tracking-tight">RetailOS</h1>
            <p className="mt-2 text-sm text-slate-400">Admin Control Center</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@retailos.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-blue-400 transition-colors hover:text-blue-300">
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
            >
              <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Blueheaven Software India Private Limited<br />
              Secure Enterprise Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
