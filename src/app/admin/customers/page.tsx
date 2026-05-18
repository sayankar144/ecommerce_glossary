'use client';

import { useEffect, useState } from 'react';
import { listCustomersAdmin, Customer } from '@/services/auth.service';
import { 
  Search, X, User, Mail, Phone, Calendar,
  Loader2, RefreshCw, ChevronRight, ShieldAlert,
  Contact, HeartHandshake, CheckCircle2
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const activeToken = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';
      const res = await listCustomersAdmin(activeToken);
      setCustomers(res.items || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter customers safely
  const filteredCustomers = customers.filter(customer => {
    const fullName = customer.fullName || '';
    const email = customer.email || '';
    const phoneNumber = customer.phoneNumber || '';

    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phoneNumber.includes(searchQuery)
    );
  });

  function getAvatarInitials(name: string) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const f = parts[0] ? parts[0][0] : '';
    const l = parts[1] ? parts[1][0] : '';
    return (f + l).toUpperCase() || '?';
  }

  function getStatusStyle(status: string) {
    if (status === 'active') {
      return 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.15)]';
    }
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RetailOS Customers</h1>
          <p className="text-slate-500 text-sm">Monitor registered customers, verification statuses, and contact details.</p>
        </div>
        <button 
          onClick={loadCustomers}
          disabled={isLoading}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-3 rounded-xl transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter and Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Search customers by name, email or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-blue-500 shadow-md placeholder-slate-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-white/10">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Email Address</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Phone Number</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Joined Date</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <span>Loading customer profiles...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldAlert size={48} className="text-slate-700" />
                      <h3 className="font-bold text-white text-lg">No customers found</h3>
                      <p className="text-slate-500 text-sm">Adjust your search query or refresh the database.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-blue-500/20 uppercase">
                        {getAvatarInitials(customer.fullName)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {customer.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono tracking-tight">{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-300 font-medium">
                    {customer.email}
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">
                    {customer.phoneNumber || '—'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getStatusStyle(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : '—'}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-500/20 group-hover:scale-105 active:scale-95 inline-flex items-center gap-1.5"
                    >
                      View Profile <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Contact size={18} className="text-blue-500" /> Customer Account
              </h2>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Card */}
              <div className="flex flex-col items-center text-center p-4 bg-slate-950/50 border border-white/5 rounded-2xl">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-blue-500/20 uppercase mb-3">
                  {getAvatarInitials(selectedCustomer.fullName)}
                </div>
                <h3 className="text-lg font-black text-white">
                  {selectedCustomer.fullName}
                </h3>
                <span className={`inline-block mt-2 px-3 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${getStatusStyle(selectedCustomer.status)}`}>
                  {selectedCustomer.status}
                </span>
              </div>

              {/* Data Fields */}
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-slate-950/30 border border-white/5 rounded-xl">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Email Address</div>
                    <div className="text-sm font-bold text-white truncate">{selectedCustomer.email}</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-slate-950/30 border border-white/5 rounded-xl">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Phone Number</div>
                    <div className="text-sm font-bold text-white font-mono">{selectedCustomer.phoneNumber || 'No phone registered'}</div>
                  </div>
                </div>

                {/* Registered Date */}
                <div className="flex items-center gap-3 p-3 bg-slate-950/30 border border-white/5 rounded-xl">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Registered Since</div>
                    <div className="text-sm font-bold text-white">
                      {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Not recorded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">Verified Account</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">This user verified their email address and holds a secure customer profile on RetailOS.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950/50 flex justify-end">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2 rounded-xl text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
