'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerProfile, updateCustomerProfile } from '@/services/account.service';
import { getMyOrders } from '@/services/order.service';
import type { CustomerProfile } from '@/services/account.service';
import type { Order } from '@/services/order.service';
import { Loader2, User, Phone, Mail, Package, CreditCard, ShieldCheck, CheckCircle2, ShoppingBag, Calendar } from 'lucide-react';
import Link from 'next/link';

export function ProfileClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadProfileData = async () => {
      const token = localStorage.getItem('retailos_customer_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch Profile
        const prof = await getCustomerProfile(token);
        setProfile(prof);
        setFullName(prof.fullName || '');
        setPhoneNumber(prof.phoneNumber || '');
        setEmail(prof.email || '');

        // 2. Fetch Customer Orders
        const ordRes = await getMyOrders(token);
        if (ordRes && ordRes.items) {
          setOrders(ordRes.items);
        }
      } catch (err: any) {
        console.error('Failed to load profile details', err);
        setErrorMsg('Unable to retrieve profile. Please login again.');
        // If unauthorized or token expired, clear invalid session and redirect to login
        if (err.status === 401 || err.message === 'Unauthorized' || err.message?.toLowerCase().includes('token')) {
          localStorage.removeItem('retailos_customer_token');
          localStorage.removeItem('retailos_customer_user');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [mounted, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const token = localStorage.getItem('retailos_customer_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const updated = await updateCustomerProfile(token, {
        fullName,
        phoneNumber,
        email,
      });

      setProfile(updated);
      // Synchronize changes to localStorage so Navbar updates in real-time!
      localStorage.setItem('retailos_customer_user', JSON.stringify(updated));
      
      // Dispatch storage event to notify Navbar and other components immediately
      window.dispatchEvent(new Event('storage'));
      
      setSuccessMsg('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#689f38]" size={48} />
        <p className="text-slate-500 font-medium">Loading your profile dashboard...</p>
      </div>
    );
  }

  // Get User Initials for Profile Avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper for Order Status colors
  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'processing' || s === 'confirmed') return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24">
      {/* Upper profile summary card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full translate-x-20 -translate-y-20 -z-10 opacity-60"></div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-[#689f38] to-[#8bc34a] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-100">
            {getInitials(profile?.fullName || '')}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{profile?.fullName}</h1>
            <p className="text-slate-400 text-sm font-medium mt-1 flex items-center justify-center md:justify-start gap-1">
              <Mail size={14} /> {profile?.email}
            </p>
            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full">
                Active Account
              </span>
              <span className="bg-slate-50 border border-slate-150 text-slate-500 font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1">
                <Calendar size={10} /> Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left column: Profile Edit Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
              <User size={18} className="text-[#689f38]" /> Edit Profile Info
            </h3>

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-300">
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl animate-in fade-in duration-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={12} /> Full Name
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone size={12} /> Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="Enter email address"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full mt-4 bg-[#689f38] text-white py-3.5 rounded-xl font-black uppercase tracking-wider hover:bg-[#558b2f] transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {updating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right columns: Live Orders Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Package size={18} className="text-[#689f38]" /> Order History
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h4>
                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">Explore our fresh garden vegetables and items to place your first grocery order!</p>
                <Link
                  href="/shop"
                  className="inline-block bg-[#689f38] text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[#558b2f] transition-all shadow-md"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-50 pb-3.5">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Order Number</span>
                        <div className="text-base font-black text-slate-900">#{order.orderNumber}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* Status tag */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        {/* Payment Method tag */}
                        <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                          <CreditCard size={10} /> {order.paymentMethod}
                        </span>
                        {/* Payment Status tag */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4 text-sm font-medium">
                      <div className="text-slate-400">
                        Date: <span className="text-slate-800 font-bold">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-xs mr-2 font-bold">Total Amount:</span>
                        <span className="text-lg font-black text-slate-950">₹{(order.grandTotal ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
