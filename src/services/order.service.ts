import { apiFetch } from '@/lib/api';

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CheckoutBody = {
  address: Address;
  paymentMethod: 'cod' | 'razorpay' | 'stripe' | 'paypal' | 'copay';
  couponCode?: string;
  sessionId?: string | null;
  customerId?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  currency?: string;
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  grandTotal?: number;
  couponCode?: string | null;
  shippingAddress?: Address;
  totalAmount?: number;
  items?: any[];
  address?: Address;
  createdAt: string;
  updatedAt?: string;
};

export async function checkout(body: CheckoutBody, token?: string | null) {
  return apiFetch<Order>('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export async function getMyOrders(token: string, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return apiFetch<{ items: Order[]; meta: any }>(`/customer/orders/my${qs}`, { token });
}

/* Admin Methods */

export async function listOrdersAdmin(token: string, params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return apiFetch<{ items: Order[]; meta: any }>(`/admin/orders${qs}`, { token });
}

export async function updateOrderStatusAdmin(token: string, id: string, status: string) {
  return apiFetch<Order>(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}

export async function verifyRazorpayPayment(
  body: {
    orderId: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  },
  token?: string | null
) {
  return apiFetch<Order>('/orders/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}
