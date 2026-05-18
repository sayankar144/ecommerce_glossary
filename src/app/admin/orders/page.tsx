'use client';

import { useEffect, useState } from 'react';
import { listOrdersAdmin, updateOrderStatusAdmin, Order } from '@/services/order.service';
import { 
  Search, X, Check, ShoppingBag, Filter, 
  ChevronRight, Loader2, Calendar, User, 
  MapPin, CreditCard, Truck, RefreshCw
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const activeToken = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';
      const res = await listOrdersAdmin(activeToken);
      setOrders(res.items || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setIsUpdating(orderId);
    try {
      const activeToken = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';
      const updated = await updateOrderStatusAdmin(activeToken, orderId, newStatus);
      // Update locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      
      // Update selected order details if open
      if (selectedOrder && selectedOrder.order.id === orderId) {
        setSelectedOrder((prev: any) => ({
          ...prev,
          order: { ...prev.order, status: updated.status }
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setIsUpdating(null);
    }
  }

  async function handleViewDetails(order: Order) {
    setIsUpdating(order.id);
    try {
      const activeToken = typeof window !== 'undefined' ? localStorage.getItem('retailos_staff_token') || '' : '';
      const baseUrl = 'http://localhost:5000/api/v1';
      const response = await fetch(`${baseUrl}/admin/orders/${order.id}`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Accept': 'application/json'
        }
      });
      const json = await response.json();
      if (json.success) {
        setSelectedOrder(json.data);
      } else {
        alert('Failed to fetch order details');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to server');
    } finally {
      setIsUpdating(null);
    }
  }

  // Filter orders (extremely safe against missing properties)
  const filteredOrders = orders.filter(order => {
    const orderNum = order.orderNumber || '';
    const fullName = order.shippingAddress?.fullName || '';
    const phone = order.shippingAddress?.phone || '';

    const matchesSearch = 
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Allowed transitions matching backend logic
  function getAllowedTransitions(status: string) {
    const allowed: Record<string, { label: string; value: string; color: string }[]> = {
      pending: [
        { label: 'Confirm Order', value: 'confirmed', color: 'bg-emerald-600 hover:bg-emerald-500' },
        { label: 'Cancel Order', value: 'cancelled', color: 'bg-rose-600 hover:bg-rose-500' }
      ],
      confirmed: [
        { label: 'Start Processing', value: 'processing', color: 'bg-purple-600 hover:bg-purple-500' },
        { label: 'Cancel Order', value: 'cancelled', color: 'bg-rose-600 hover:bg-rose-500' }
      ],
      processing: [
        { label: 'Mark as Shipped', value: 'shipped', color: 'bg-amber-600 hover:bg-amber-500' }
      ],
      shipped: [
        { label: 'Mark as Delivered', value: 'delivered', color: 'bg-green-600 hover:bg-green-500' },
        { label: 'Mark as Returned', value: 'returned', color: 'bg-slate-600 hover:bg-slate-500' }
      ],
      delivered: [
        { label: 'Mark as Returned', value: 'returned', color: 'bg-slate-600 hover:bg-slate-500' }
      ],
      cancelled: [],
      returned: []
    };

    return allowed[status] || [];
  }

  function getStatusStyle(status: string) {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.15)]',
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
      processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
      shipped: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      delivered: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      returned: 'bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_12px_rgba(148,163,184,0.15)]',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RetailOS Orders</h1>
          <p className="text-slate-500 text-sm">Manage customers orders and fulfill order statuses.</p>
        </div>
        <button 
          onClick={loadOrders}
          disabled={isLoading}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold p-3 rounded-xl transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by order ID, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-white/10">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                      <span>Loading orders catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingBag size={48} className="text-slate-700" />
                      <h3 className="font-bold text-white text-lg">No orders found</h3>
                      <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-mono text-sm text-slate-300">
                    {order.orderNumber}
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{order.shippingAddress?.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-bold">{order.shippingAddress?.phone}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-white">
                    ₹{order.grandTotal || order.totalAmount || 0}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleViewDetails(order)}
                      disabled={isUpdating === order.id}
                      className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-500/20 group-hover:scale-105 active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {isUpdating === order.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>View Details <ChevronRight size={12} /></>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STABLE DETAILED MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Order <span className="text-blue-500 font-mono">{selectedOrder.order.orderNumber}</span>
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Placed on {new Date(selectedOrder.order.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-900">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Shipping Details */}
                <div className="bg-slate-950 border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> Customer & Delivery
                  </h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div>
                      <div className="font-bold text-white">{selectedOrder.order.shippingAddress?.fullName}</div>
                      <div className="text-xs text-slate-500">{selectedOrder.order.shippingAddress?.phone}</div>
                    </div>
                    <hr className="border-white/5" />
                    <div className="flex gap-2">
                      <MapPin size={16} className="text-slate-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-400 leading-relaxed">
                        {selectedOrder.order.shippingAddress?.line1}
                        {selectedOrder.order.shippingAddress?.line2 && <>, {selectedOrder.order.shippingAddress.line2}</>}
                        <br />
                        {selectedOrder.order.shippingAddress?.city}, {selectedOrder.order.shippingAddress?.state} - {selectedOrder.order.shippingAddress?.postalCode}
                        <br />
                        {selectedOrder.order.shippingAddress?.country}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Payment Information */}
                <div className="bg-slate-950 border border-white/5 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                    <CreditCard size={14} className="text-blue-500" /> Payment & Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order Status</span>
                      <span className={`inline-block px-3 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${getStatusStyle(selectedOrder.order.status)}`}>
                        {selectedOrder.order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Payment Method</span>
                      <span className="text-sm font-bold text-white uppercase">{selectedOrder.order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Payment Status</span>
                      <span className={`text-xs font-black uppercase ${
                        selectedOrder.order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-500'
                      }`}>
                        {selectedOrder.order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <ShoppingBag size={14} className="text-blue-500" /> Order Line Items
                </h3>
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/50">
                  <div className="divide-y divide-white/5">
                    {selectedOrder.items && selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.title}</h4>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">{item.sku || 'No SKU'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">₹{item.unitPrice * item.quantity}</div>
                          <div className="text-[10px] text-slate-500 font-bold">₹{item.unitPrice} × {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.order.subtotal || 0}</span>
                </div>
                {selectedOrder.order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-rose-400 font-bold">
                    <span>Discount {selectedOrder.order.couponCode && `(${selectedOrder.order.couponCode})`}</span>
                    <span>-₹{selectedOrder.order.discountTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Shipping Fee</span>
                  <span>₹{selectedOrder.order.shippingTotal || 0}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tax Amount</span>
                  <span>₹{selectedOrder.order.taxTotal || 0}</span>
                </div>
                <hr className="border-white/5" />
                <div className="flex justify-between text-base font-black text-white">
                  <span>Grand Total</span>
                  <span className="text-blue-400 text-lg">₹{selectedOrder.order.grandTotal || 0}</span>
                </div>
              </div>

              {/* Status Machine Actions */}
              {getAllowedTransitions(selectedOrder.order.status).length > 0 && (
                <div className="bg-slate-950/50 border border-blue-500/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-blue-500" />
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Fulfill / Change Order Status</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {getAllowedTransitions(selectedOrder.order.status).map((t) => (
                      <button
                        key={t.value}
                        onClick={() => handleStatusChange(selectedOrder.order.id, t.value)}
                        disabled={isUpdating !== null}
                        className={`text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5 ${t.color}`}
                      >
                        {isUpdating === selectedOrder.order.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-950/50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
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
