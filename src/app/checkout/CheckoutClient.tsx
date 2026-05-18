'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { getCart } from '@/services/cart.service';
import type { Cart } from '@/services/cart.service';
import { checkout, verifyRazorpayPayment } from '@/services/order.service';

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, Phone, User, CreditCard, CheckCircle2, Smartphone, Landmark, Search, Lock, QrCode, Check } from 'lucide-react';
import Link from 'next/link';

export function CheckoutClient() {
  const router = useRouter();
  const { refreshCart } = useStore();
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use a key to force re-render of the form when pre-fill data is ready
  const [formKey, setFormKey] = useState(0);
  const [prefill, setPrefill] = useState({ fullName: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'copay'>('cod');
  const [paymentDoneMsg, setPaymentDoneMsg] = useState<string | null>(null);

  // Simulated Razorpay Modal States
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedPayload, setSimulatedPayload] = useState<any>(null);
  const [simulatedTab, setSimulatedTab] = useState<'card' | 'upi' | 'netbank'>('card');
  const [simulatedStep, setSimulatedStep] = useState<'details' | 'processing' | 'success'>('details');
  const [simulatedProgress, setSimulatedProgress] = useState('');
  const [mockCard, setMockCard] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/30',
    cvv: '123',
    name: 'John Doe',
  });
  const [upiId, setUpiId] = useState('success@razorpay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [bankSearch, setBankSearch] = useState('');

  const popularBanks = [
    { name: 'HDFC Bank', color: 'bg-blue-600' },
    { name: 'ICICI Bank', color: 'bg-orange-500' },
    { name: 'State Bank of India', color: 'bg-sky-500' },
    { name: 'Axis Bank', color: 'bg-red-800' },
    { name: 'Kotak Mahindra Bank', color: 'bg-red-600' },
    { name: 'Yes Bank', color: 'bg-blue-800' },
  ];

  const handleSimulatedPay = async () => {
    setSimulatedStep('processing');
    
    const steps = [
      'Establishing secure SSL connection to bank gateway...',
      'Verifying credit card authorization & limits...',
      'Encrypting transaction payloads (256-bit AES)...',
      'Securing confirmation from the mock reserve...',
      'Payment authorized successfully!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setSimulatedProgress(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setSimulatedStep('success');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Complete the payment flow
    setShowSimulatedModal(false);
    setPlacingOrder(true);
    setPaymentDoneMsg('Verifying simulated payment signature...');

    const response = {
      razorpay_payment_id: 'pay_sim_' + Math.random().toString(36).substring(2, 11),
      razorpay_order_id: simulatedPayload.rzpOrderId,
      razorpay_signature: 'sig_sim_' + Math.random().toString(36).substring(2, 11),
    };

    const token = localStorage.getItem('retailos_customer_token');

    try {
      await verifyRazorpayPayment({
        orderId: simulatedPayload.orderId,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }, token);

      setOrderSuccess(simulatedPayload.orderNumber);
      await refreshCart();
    } catch (verifyErr: any) {
      setError(verifyErr.message || 'Payment verification failed');
    } finally {
      setPlacingOrder(false);
      setPaymentDoneMsg(null);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const loadData = async () => {
      const token = localStorage.getItem('retailos_customer_token');
      const sessionId = localStorage.getItem('retailos_session_id');

      // Require user login before checking out
      if (!token) {
        router.push('/login?redirect=/checkout');
        return;
      }

      try {
        const c = await getCart(sessionId, token);
        if (!c || c.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCart(c);

        const profile = JSON.parse(localStorage.getItem('retailos_customer_user') || '{}');
        if (profile) {
           setPrefill({
             fullName: profile.fullName || '',
             phone: profile.phoneNumber || '',
           });
           setFormKey(prev => prev + 1); // Force re-render with pre-filled defaultValues
        }
      } catch (err) {
        console.error('Checkout load failed', err);
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [mounted, router]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPlacingOrder(true);
    setError(null);
    setPaymentDoneMsg(null);

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem('retailos_customer_token');
    const sessionId = localStorage.getItem('retailos_session_id');

    const address = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      line1: formData.get('line1') as string,
      line2: formData.get('line2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string || 'India',
    };

    try {
      if (paymentMethod === 'copay') {
        setPaymentDoneMsg('Payment done on Copay successfully!');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const order = (await checkout({
        address,
        paymentMethod,
        sessionId,
      }, token)) as any;

      if (paymentMethod === 'razorpay') {
        const payload = order.paymentPayload;
        if (!payload || !payload.rzpOrderId) {
          throw new Error('Razorpay failed to initialize order on server. Please try again.');
        }

        // Detect if Razorpay credentials are placeholder/stub keys
        const isStub = !payload.keyId || 
                       payload.keyId === 'stub_key' || 
                       payload.keyId === 'rzp_test_yourKeyHere' || 
                       payload.rzpOrderId.startsWith('stub_');

        if (isStub) {
          setPlacingOrder(false);
          setSimulatedPayload({
            orderId: order.id,
            rzpOrderId: payload.rzpOrderId,
            orderNumber: order.orderNumber,
            amount: payload.amount,
            keyId: payload.keyId,
            prefillName: address.fullName,
            prefillContact: address.phone,
          });
          setSimulatedStep('details');
          setSimulatedTab('card');
          setSimulatedProgress('');
          setShowSimulatedModal(true);
          return;
        }

        setPaymentDoneMsg('Connecting to Razorpay...');
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          throw new Error('Failed to load Razorpay Payment Gateway SDK. Please check your internet connection.');
        }

        setPaymentDoneMsg('Awaiting payment...');
        const options = {
          key: payload.keyId,
          amount: payload.amount,
          currency: payload.currency || 'INR',
          name: 'BlueHeaven RetailOS',
          description: `Order #${order.orderNumber}`,
          order_id: payload.rzpOrderId,
          handler: async function (response: any) {
            setPlacingOrder(true);
            setPaymentDoneMsg('Verifying payment signature securely...');
            try {
              await verifyRazorpayPayment({
                orderId: order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }, token);

              setOrderSuccess(order.orderNumber);
              await refreshCart();
            } catch (verifyErr: any) {
              setError(verifyErr.message || 'Payment verification failed');
            } finally {
              setPlacingOrder(false);
              setPaymentDoneMsg(null);
            }
          },
          prefill: {
            name: address.fullName,
            contact: address.phone,
          },
          theme: {
            color: '#689f38',
          },
          modal: {
            ondismiss: function () {
              setError('Payment cancelled by user');
              setPlacingOrder(false);
              setPaymentDoneMsg(null);
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD and Copay complete instantly
        setOrderSuccess(order.orderNumber);
        await refreshCart();
        setPlacingOrder(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#689f38]" size={48} />
        <p className="text-slate-500 font-medium">Preparing checkout...</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center text-[#689f38] mb-8 shadow-xl shadow-emerald-50">
          <CheckCircle2 size={56} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Order Placed Successfully!</h2>
        <p className="text-slate-500 text-lg mb-2">Thank you for your order. Your order number is <span className="font-bold text-slate-900">#{orderSuccess}</span></p>
        <p className="text-slate-400 mb-10">We'll send you an update when your groceries are on the way.</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="bg-[#689f38] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-[#558b2f] transition-all shadow-lg shadow-emerald-100">
            Continue Shopping
          </Link>
          <Link href="/profile" className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-50 transition-all">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
        {/* Left: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <MapPin className="text-[#689f38]" size={24} />
              <h2 className="text-xl font-black text-slate-900">Delivery Address</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <User size={12} /> Full Name
                </label>
                <input
                  required
                  name="fullName"
                  defaultValue={prefill.fullName}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Phone size={12} /> Phone Number
                </label>
                <input
                  required
                  name="phone"
                  defaultValue={prefill.phone}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="9876543210"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address Line 1</label>
                <input
                  required
                  name="line1"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="House No, Building, Street"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Address Line 2 (Optional)</label>
                <input
                  name="line2"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="Landmark, Area"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">City</label>
                <input
                  required
                  name="city"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">State</label>
                <input
                  required
                  name="state"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="Maharashtra"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Postal Code</label>
                <input
                  required
                  name="postalCode"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-300 transition-colors font-medium text-slate-900"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <CreditCard className="text-[#689f38]" size={24} />
              <h2 className="text-xl font-black text-slate-900">Payment Method</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
               {/* COD */}
               <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#689f38] bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#689f38] h-4 w-4" />
                  <div>
                     <span className="block text-sm font-black text-slate-900">COD</span>
                     <span className="text-[10px] text-slate-500 font-medium leading-tight">Cash on Delivery</span>
                  </div>
               </label>

               {/* Razorpay */}
               <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#689f38] bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-[#689f38] h-4 w-4" />
                  <div>
                     <span className="block text-sm font-black text-slate-900">Razorpay</span>
                     <span className="text-[10px] text-slate-500 font-medium leading-tight">Simulated Razorpay</span>
                  </div>
               </label>

               {/* Copay */}
               <label className={`flex items-center gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'copay' ? 'border-[#689f38] bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input type="radio" name="paymentMethod" value="copay" checked={paymentMethod === 'copay'} onChange={() => setPaymentMethod('copay')} className="accent-[#689f38] h-4 w-4" />
                  <div>
                     <span className="block text-sm font-black text-slate-900">Copay</span>
                     <span className="text-[10px] text-slate-500 font-medium leading-tight">Simulated Copay</span>
                  </div>
               </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-28">
             <h3 className="text-xl font-black mb-8 border-b border-slate-800 pb-4">Final Summary</h3>
             
             <div className="space-y-4 mb-8">
                {cart?.items.map(item => (
                   <div key={item.variantId} className="flex justify-between items-start text-xs">
                      <div className="text-slate-400">
                         <span className="text-white font-bold">{item.quantity}x</span> {item.snapshot.title}
                      </div>
                      <span className="text-white font-bold shrink-0">₹{item.lineTotal}</span>
                   </div>
                ))}
             </div>

             <div className="space-y-4 mb-8 pt-6 border-t border-slate-800">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white">₹{cart?.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Delivery</span>
                  <span className="text-[#689f38] font-bold tracking-widest uppercase text-xs">FREE</span>
                </div>
             </div>
             
             <div className="border-t border-slate-800 pt-6 mb-8">
                <div className="flex justify-between items-baseline">
                   <span className="text-slate-400 font-bold">Total Payable</span>
                   <span className="text-3xl font-black text-[#689f38]">₹{cart?.subtotal}</span>
                </div>
             </div>

             {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold leading-relaxed">
                  {error}
                </div>
             )}
             
             <button
               type="submit"
               disabled={placingOrder}
               className="flex items-center justify-center gap-3 w-full bg-[#689f38] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#558b2f] transition-all shadow-lg shadow-emerald-950 mb-6 disabled:opacity-50"
             >
                {placingOrder ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
             </button>
             
             <div className="flex items-center gap-3 justify-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={16} className="text-[#689f38]" />
                Secure Checkout Powered by RetailOS
             </div>
          </div>
        </div>
      </form>
      {paymentDoneMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="h-16 w-16 bg-emerald-100 text-[#689f38] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={36} className="text-[#689f38]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Simulated Transaction</h3>
            <p className="text-sm font-bold text-slate-600 mb-1">{paymentDoneMsg}</p>
            <p className="text-xs text-slate-400">Order is being secured in the database...</p>
          </div>
        </div>
      )}

      {/* GORGEOUS HIGH-FIDELITY SIMULATED RAZORPAY MODAL */}
      {showSimulatedModal && simulatedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-[480px] bg-[#0c101a] text-slate-200 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col font-sans animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#131926] p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white tracking-tight">Razorpay Checkout</h3>
                  <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Simulated Test Mode
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-1">Order #{simulatedPayload.orderNumber}</p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-black text-emerald-400">₹{(simulatedPayload.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Amount</span>
              </div>
            </div>

            {/* Modal Body */}
            {simulatedStep === 'details' && (
              <>
                {/* Tabs */}
                <div className="flex bg-[#0f1522] border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
                  <button
                    type="button"
                    onClick={() => setSimulatedTab('card')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
                      simulatedTab === 'card' 
                        ? 'text-emerald-400 bg-[#131a2a] border-b-2 border-emerald-400 font-black' 
                        : 'hover:text-slate-200 hover:bg-[#111726]/50'
                    }`}
                  >
                    <CreditCard size={14} />
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedTab('upi')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
                      simulatedTab === 'upi' 
                        ? 'text-emerald-400 bg-[#131a2a] border-b-2 border-emerald-400 font-black' 
                        : 'hover:text-slate-200 hover:bg-[#111726]/50'
                    }`}
                  >
                    <Smartphone size={14} />
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedTab('netbank')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
                      simulatedTab === 'netbank' 
                        ? 'text-emerald-400 bg-[#131a2a] border-b-2 border-emerald-400 font-black' 
                        : 'hover:text-slate-200 hover:bg-[#111726]/50'
                    }`}
                  >
                    <Landmark size={14} />
                    Netbanking
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-6 flex-grow space-y-6 overflow-y-auto max-h-[360px]">
                  {simulatedTab === 'card' && (
                    <div className="space-y-6">
                      {/* Premium Rotating/Glowing Card Preview */}
                      <div className="relative h-40 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-950/20 overflow-hidden flex flex-col justify-between select-none">
                        {/* Decorative background grid pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-200">RetailOS Premium Card</span>
                            <div className="w-10 h-7 bg-amber-400/80 rounded-md mt-2 flex items-center justify-center overflow-hidden border border-amber-300/30">
                              {/* Chip lines */}
                              <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1">
                                <div className="border border-amber-950/20 rounded-sm"></div>
                                <div className="border border-amber-950/20 rounded-sm"></div>
                                <div className="border border-amber-950/20 rounded-sm"></div>
                              </div>
                            </div>
                          </div>
                          <span className="text-xl font-black italic tracking-tight text-white/90">VISA</span>
                        </div>

                        <div className="text-lg font-mono tracking-widest text-center my-1 select-all">
                          {mockCard.number || '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-end text-xs font-mono">
                          <div>
                            <span className="block text-[8px] uppercase tracking-widest text-emerald-300 font-bold">Cardholder</span>
                            <span className="font-bold truncate max-w-[180px] block">{mockCard.name || 'JOHN DOE'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[8px] uppercase tracking-widest text-emerald-300 font-bold">Expires</span>
                            <span className="font-bold">{mockCard.expiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card Number</label>
                          <input
                            type="text"
                            value={mockCard.number}
                            onChange={(e) => setMockCard({ ...mockCard, number: e.target.value })}
                            className="w-full bg-[#131926] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="4111 1111 1111 1111"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry Date</label>
                          <input
                            type="text"
                            value={mockCard.expiry}
                            onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                            className="w-full bg-[#131926] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="12/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CVV</label>
                          <input
                            type="password"
                            value={mockCard.cvv}
                            onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value })}
                            className="w-full bg-[#131926] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="123"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cardholder Name</label>
                          <input
                            type="text"
                            value={mockCard.name}
                            onChange={(e) => setMockCard({ ...mockCard, name: e.target.value })}
                            className="w-full bg-[#131926] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {simulatedTab === 'upi' && (
                    <div className="space-y-6 flex flex-col items-center">
                      {/* Pulsing Simulated QR Code with Scanner Effect */}
                      <div className="relative p-4 bg-white rounded-2xl shadow-xl w-44 h-44 flex items-center justify-center border border-slate-100 overflow-hidden">
                        <QrCode size={130} className="text-slate-900" />
                        {/* Custom moving green laser scanner line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-md shadow-emerald-400 animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>
                      
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-slate-300">Scan QR Code using any UPI App</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">GPay, PhonePe, Paytm, BHIM</p>
                      </div>

                      <div className="w-full border-t border-slate-800/80 pt-4 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or enter UPI ID</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-[#131926] border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors text-center"
                            placeholder="success@razorpay"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {simulatedTab === 'netbank' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-slate-500" size={16} />
                        <input
                          type="text"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          className="w-full bg-[#131926] border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="Search for your bank..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                        {popularBanks
                          .filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
                          .map((bank) => (
                            <button
                              type="button"
                              key={bank.name}
                              onClick={() => setSelectedBank(bank.name)}
                              className={`p-4 rounded-xl border text-left transition-all ${
                                selectedBank === bank.name
                                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                                  : 'border-slate-800 hover:border-slate-700 bg-[#0f1522] text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${bank.color}`}>
                                  {bank.name.substring(0, 2).toUpperCase()}
                                </span>
                                <span className="text-xs font-bold leading-snug">{bank.name}</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="p-6 bg-[#090d16] border-t border-slate-800/80 space-y-4">
                  <button
                    type="button"
                    onClick={handleSimulatedPay}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Lock size={14} /> Pay ₹{(simulatedPayload.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Simulated)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSimulatedModal(false);
                      setError('Payment cancelled by user (Simulation)');
                    }}
                    className="w-full border border-slate-800 hover:border-slate-700 hover:bg-slate-800/20 text-slate-400 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel Transaction
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-2">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Simulated AES 256-bit Secure Gateway
                  </div>
                </div>
              </>
            )}

            {/* Payment Processing Step */}
            {simulatedStep === 'processing' && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
                {/* Glowing rotating spinner */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></div>
                  <Lock size={24} className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-white tracking-wide">Processing simulated transaction...</h4>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Do not close this window</p>
                </div>

                <div className="w-full max-w-sm bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 font-mono text-[10px] text-emerald-400/90 text-left min-h-[70px] flex items-center">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 select-none">&gt;</span>
                    <span className="leading-relaxed font-bold animate-[pulse_1s_infinite]">{simulatedProgress}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Success Step */}
            {simulatedStep === 'success' && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px] animate-in fade-in zoom-in duration-300">
                <div className="h-20 w-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 animate-[bounce_1.5s_infinite]">
                  <Check size={40} className="stroke-[3]" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white tracking-wide">Payment Authorized!</h4>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Transaction was successful</p>
                </div>

                <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-5 w-full max-w-sm space-y-3 text-xs font-semibold">
                  <div className="flex justify-between border-b border-slate-800/50 pb-2">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="text-slate-300 font-mono">pay_sim_success</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid</span>
                    <span className="text-emerald-400 font-bold">₹{(simulatedPayload.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                  Redirecting back to order confirmation...
                </p>
              </div>
            )}
          </div>
          
          {/* Internal custom animations for simulated modal */}
          <style>{`
            @keyframes scan {
              0%, 100% { top: 0%; opacity: 0.3; }
              50% { top: 100%; opacity: 0.9; }
            }
          `}</style>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}
