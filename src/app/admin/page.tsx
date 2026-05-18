'use client';

import { useEffect, useState } from 'react';
import { getAdminOverview, getRevenueAnalytics, getTopProducts } from '@/services/analytics.service';
import { 
  TrendingUp, 
  Users as UsersIcon, 
  Package as PackageIcon,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Calendar,
  Loader2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('30d');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  async function loadData() {
    const token = localStorage.getItem('retailos_staff_token') || '';
    if (!token) return;

    try {
      const [overview, revenue, top] = await Promise.all([
        getAdminOverview(token),
        getRevenueAnalytics(token, selectedPeriod),
        getTopProducts(token, 5)
      ]);
      
      setData(overview);
      setTopProducts(top || []);
      
      // Build visual dates timeline to match chart grids cleanly
      const daysCount = selectedPeriod === '7d' ? 7 : 30;
      const list = [];
      const now = new Date();
      
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const key = `${yyyy}-${mm}-${dd}`;
        
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const matched = (revenue || []).find((item: any) => item._id === key);
        list.push({
          dateKey: key,
          label,
          revenue: matched ? matched.revenue : 0,
          orders: matched ? matched.orders : 0
        });
      }
      setRevenueData(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const metrics = [
    { 
      label: 'Gross Revenue', 
      value: `₹${(data?.allTime?.revenue || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'blue',
      trend: '+12.5%',
      isUp: true
    },
    { 
      label: 'Active Orders', 
      value: data?.allTime?.orders || 0, 
      icon: ShoppingCart, 
      color: 'indigo',
      trend: '+8.2%',
      isUp: true
    },
    { 
      label: 'Total Customers', 
      value: data?.totalCustomers || 0, 
      icon: UsersIcon, 
      color: 'emerald',
      trend: '+2.4%',
      isUp: true
    },
    { 
      label: 'Pending Tasks', 
      value: data?.pendingOrders || 0, 
      icon: Clock, 
      color: 'orange',
      trend: '-1.5%',
      isUp: false
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-48 rounded-[2.5rem] bg-white/5 border border-white/5" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-white/5 border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  // Determine maximum revenue value for dynamic scaling of bars
  const maxRevenue = Math.max(...revenueData.map(item => item.revenue), 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white shadow-2xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles size={14} /> RetailOS Enterprise
            </div>
            <h1 className="text-4xl font-black tracking-tight">Good Morning, Admin!</h1>
            <p className="text-blue-100/80 font-medium">Here is what is happening with your store today.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-100">Current Date</div>
              <div className="text-lg font-black">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-40 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-slate-900/80 hover:-translate-y-1 shadow-xl">
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-all",
                m.color === 'blue' && "bg-blue-500/10 text-blue-500 ring-blue-500/20 group-hover:bg-blue-500 group-hover:text-white",
                m.color === 'indigo' && "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white",
                m.color === 'emerald' && "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white",
                m.color === 'orange' && "bg-orange-500/10 text-orange-500 ring-orange-500/20 group-hover:bg-orange-500 group-hover:text-white",
              )}>
                <m.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black tracking-tighter",
                m.isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                {m.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {m.trend}
              </div>
            </div>
            <div className="mt-5 space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
              <h3 className="text-3xl font-black text-white">{m.value}</h3>
            </div>
            <div className={cn(
              "absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-30",
              m.color === 'blue' && "bg-blue-500",
              m.color === 'indigo' && "bg-indigo-500",
              m.color === 'emerald' && "bg-emerald-500",
              m.color === 'orange' && "bg-orange-500",
            )} />
          </div>
        ))}
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-white/5 bg-slate-900/50 p-8 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-white">Sales Performance</h3>
              <p className="text-sm text-slate-500 font-medium">Revenue insights for the past {selectedPeriod === '7d' ? '7' : '30'} days.</p>
            </div>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 outline-none cursor-pointer focus:border-blue-500 transition-colors"
            >
              <option value="30d" className="bg-slate-950">Last 30 Days</option>
              <option value="7d" className="bg-slate-950">Last 7 Days</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-1.5 pt-4">
             {revenueData.map((item, idx) => {
               // Proportional height calculations
               const hVal = item.revenue > 0 ? `${(item.revenue / maxRevenue) * 85 + 15}%` : '5%';
               return (
                 <div 
                   key={item.dateKey} 
                   className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600/10 to-blue-500/40 hover:to-blue-400 hover:from-blue-500/20 transition-all cursor-pointer group/bar relative" 
                   style={{ height: hVal }}
                 >
                   {/* Hover Tooltip card */}
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-white px-2.5 py-1 text-[10px] text-slate-950 font-black shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                     <span className="text-slate-500 font-bold block text-[8px] uppercase tracking-wider">{item.label}</span>
                     <span>₹{item.revenue.toLocaleString()}</span>
                   </div>
                 </div>
               );
             })}
          </div>
          
          {/* Timeline axis */}
          <div className="flex justify-between mt-6 px-1 border-t border-white/5 pt-4">
             {revenueData.map((item, idx) => {
               const shouldShow = selectedPeriod === '7d' || idx % 5 === 0 || idx === revenueData.length - 1;
               return (
                 <span 
                   key={item.dateKey} 
                   className={`text-[9px] font-black tracking-tighter text-center flex-1 ${shouldShow ? 'text-slate-500' : 'text-transparent'}`}
                 >
                   {item.label.split(' ')[1]}
                 </span>
               );
             })}
          </div>
        </div>

        {/* Top Performing Products Sidebar */}
        <div className="rounded-[2.5rem] border border-white/5 bg-slate-900/50 p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-black text-white mb-6">Top Products</h3>
          <div className="space-y-6 flex-1">
            {topProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm font-medium flex flex-col items-center gap-2">
                <PackageIcon size={32} className="text-slate-700" />
                <span>No product sales recorded.</span>
              </div>
            ) : topProducts.map((prod) => (
              <div key={prod._id} className="flex items-center gap-4 group">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-md">
                  <PackageIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {prod.title || 'Unknown Product'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                    Sold: {prod.totalQuantity} items
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-white">₹{prod.totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
            <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Sales performance metrics are derived from real-time database orders and line items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
