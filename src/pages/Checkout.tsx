import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Truck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useSettingsStore } from '@/store/settings.store';
import api from '@/utils/api';

const addressSchema = z.object({
  fullName: z.string().min(3, 'Full Name must be at least 3 characters'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  addressLine: z.string().min(5, 'Detailed address (min 5 characters) is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
});

type AddressFormData = z.infer<typeof addressSchema>;

function CheckoutContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const couponParam = searchParams.get('coupon') || '';

  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const { settings } = useSettingsStore();

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay' | 'WhatsApp'>('COD');
  const [pricing, setPricing] = useState({ subtotal: 0, discount: 0, shipping: 25, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema)
  });

  // Load user saved address by default
  useEffect(() => {
    if (user) {
      api.get('/auth/profile')
        .then((res) => {
          const profile = res.data.data;
          const defaultAddr = profile.addresses.find((a: any) => a.isDefault) || profile.addresses[0];
          if (defaultAddr) {
            setValue('fullName', defaultAddr.fullName);
            setValue('mobileNumber', defaultAddr.mobileNumber);
            setValue('addressLine', defaultAddr.addressLine);
            setValue('city', defaultAddr.city);
            setValue('state', defaultAddr.state);
            setValue('pincode', defaultAddr.pincode);
          }
        })
        .catch(() => {});
    }
  }, [user, setValue]);

  // Load calculations
  useEffect(() => {
    let url = '/orders/checkout-summary';
    if (couponParam) url += `?couponCode=${couponParam}`;
    api.get(url)
      .then(res => setPricing(res.data.data))
      .catch(() => {
        // local estimate fallback
        let sub = items.reduce((acc, curr) => acc + (curr.product.discountPrice || curr.product.price) * curr.quantity, 0);
        setPricing({ subtotal: sub, discount: 0, shipping: sub > 500 ? 0 : 25, total: sub + (sub > 500 ? 0 : 25) });
      });
  }, [items, couponParam]);

  const onSubmit = async (addressData: AddressFormData) => {
    setIsLoading(true);
    try {
      // 1. Create Payment Order
      const res = await api.post('/orders/payment', {
        address: addressData,
        paymentMethod,
        couponCode: couponParam
      });

      const paymentData = res.data.data;

      if (paymentMethod === 'COD') {
        // Direct order placement
        const orderRes = await api.post('/orders/place', {
          address: addressData,
          paymentMethod: 'COD',
          couponCode: couponParam
        });
        setSuccessOrder(orderRes.data.data);
        clearCart();
      } else if (paymentMethod === 'WhatsApp') {
        // Direct WhatsApp order placement in DB
        const orderRes = await api.post('/orders/place', {
          address: addressData,
          paymentMethod: 'WhatsApp',
          couponCode: couponParam
        });
        const placedOrder = orderRes.data.data;
        clearCart();

        // Compile WhatsApp text invoice message
        let itemsText = '';
        for (const item of items) {
          itemsText += `- ${item.product.name} x${item.quantity} (₹${item.product.discountPrice || item.product.price})\n`;
        }

        const waText = `*NEW ORDER CONFIRMED (VELORA)*\n` +
          `Order ID: *${placedOrder._id}*\n` +
          `Payment Method: *WhatsApp Checkout*\n\n` +
          `*Shipping Address:*\n` +
          `Name: ${addressData.fullName}\n` +
          `Mobile: ${addressData.mobileNumber}\n` +
          `Address: ${addressData.addressLine}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}\n\n` +
          `*Order Items:*\n${itemsText}\n` +
          `*Subtotal:* ₹${pricing.subtotal.toFixed(2)}\n` +
          `*Discount:* -₹${pricing.discount.toFixed(2)}\n` +
          `*Shipping:* ₹${pricing.shipping.toFixed(2)}\n` +
          `*Total Pay:* *₹${pricing.total.toFixed(2)}*\n\n` +
          `Thank you! Placed via online checkout portal.`;

        const waLink = `https://api.whatsapp.com/send?phone=919336896144&text=${encodeURIComponent(waText)}`;
        setSuccessOrder(placedOrder);
        window.open(waLink, '_blank');
      } else {
        // Razorpay Flow
        if (paymentData.isSimulated) {
          // Simulated payments popup
          const confirmPayment = confirm(`Simulate Razorpay payment of ₹${pricing.total}?`);
          if (confirmPayment) {
            const orderRes = await api.post('/orders/place', {
              address: addressData,
              paymentMethod: 'Razorpay',
              couponCode: couponParam,
              razorpayOrderId: paymentData.orderId,
              razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
              razorpaySignature: 'simulated_signature'
            });
            setSuccessOrder(orderRes.data.data);
            clearCart();
          } else {
            alert('Payment cancelled');
          }
        } else {
          // Proper SDK initialization
          const options = {
            key: paymentData.keyId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: 'VELORA',
            description: 'Luxury Fine Jewelry Purchase',
            order_id: paymentData.orderId,
            handler: async function (response: any) {
              try {
                const orderRes = await api.post('/orders/place', {
                  address: addressData,
                  paymentMethod: 'Razorpay',
                  couponCode: couponParam,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
                setSuccessOrder(orderRes.data.data);
                clearCart();
              } catch (err: any) {
                alert(err.error || 'Failed to place order after payment verification');
              }
            },
            prefill: {
              name: addressData.fullName,
              contact: addressData.mobileNumber
            },
            theme: {
              color: '#bba35a'
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      }
    } catch (err: any) {
      alert(err.error || 'Order placement failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Success view
  if (successOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-3xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">
          Order Confirmed
        </h1>
        <p className="text-sm font-light text-gray-500 max-w-sm mx-auto leading-relaxed">
          Thank you for choosing VELORA. Your order has been placed successfully. Order ID: <span className="font-semibold text-luxury-charcoal break-all">{successOrder._id}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <Link
            to="/profile"
            className="px-6 py-2.5 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors"
          >
            Order History
          </Link>
          <Link
            to="/shop"
            className="px-6 py-2.5 border border-gold/20 hover:border-gold rounded text-xs font-bold uppercase tracking-wider text-luxury-charcoal transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">Secure Checkout</h1>
      <div className="w-12 h-0.5 bg-gold"></div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Shipping Address Inputs */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
            <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
              Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="Eleanor Vance"
                />
                {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <input
                  type="text"
                  {...register('mobileNumber')}
                  className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="+1 (555) 019-2834"
                />
                {errors.mobileNumber && <p className="text-[10px] text-red-500 mt-1">{errors.mobileNumber.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address details</label>
                <input
                  type="text"
                  {...register('addressLine')}
                  className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="Street address, apartment, suite, unit"
                />
                {errors.addressLine && <p className="text-[10px] text-red-500 mt-1">{errors.addressLine.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="New York"
                />
                {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="NY"
                />
                {errors.state && <p className="text-[10px] text-red-500 mt-1">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  {...register('pincode')}
                  className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="10021"
                />
                {errors.pincode && <p className="text-[10px] text-red-500 mt-1">{errors.pincode.message}</p>}
              </div>
            </div>
          </div>

          {/* Payment Methods selector */}
          <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
            <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 border rounded-lg text-left flex flex-col justify-between transition-colors ${
                  paymentMethod === 'COD' ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold'
                }`}
              >
                <Truck className="text-gold shrink-0 mb-1" size={20} />
                <div>
                  <h5 className="text-xs font-semibold text-luxury-charcoal">COD</h5>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Cash On Delivery</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('WhatsApp')}
                className={`p-4 border rounded-lg text-left flex flex-col justify-between transition-colors ${
                  paymentMethod === 'WhatsApp' ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold'
                }`}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 shrink-0 mb-1" alt="WA" />
                <div>
                  <h5 className="text-xs font-semibold text-luxury-charcoal">WhatsApp</h5>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Order on WhatsApp</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Invoice Summary */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg h-fit space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Review Order
          </h3>

          <div className="space-y-4 max-h-60 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 justify-between items-center text-xs">
                <span className="font-semibold text-luxury-charcoal truncate min-w-0 flex-1">{item.product.name} (x{item.quantity})</span>
                <span className="font-outfit font-semibold shrink-0">₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm border-t border-gold/10 pt-4 font-light">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-outfit font-semibold">₹{pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span className="font-outfit font-semibold">-₹{pricing.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <div>
                <span>Shipping</span>
                {settings?.estimatedShippingTime && (
                  <span className="text-[10px] text-gray-400 block font-light mt-0.5">Est. Delivery: {settings.estimatedShippingTime}</span>
                )}
              </div>
              <span className="font-outfit font-semibold">
                {pricing.shipping === 0 ? 'Complimentary' : `₹${pricing.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-gold/10 pt-3 text-base font-bold text-luxury-charcoal">
              <span>Total Pay</span>
              <span className="font-outfit text-gold">₹{pricing.total.toFixed(2)}</span>
            </div>
          </div>

          {settings?.enableReturnPolicy && settings?.returnPolicyNotice && (
            <div className="bg-red-50 border border-red-200/50 p-3 rounded text-red-700 text-[10px] uppercase font-bold tracking-wider leading-relaxed flex items-start gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <div>
                <span className="block font-extrabold text-[11px] text-red-800 mb-0.5">Important Notice</span>
                {settings.returnPolicyNotice}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing Order...' : (paymentMethod === 'Razorpay' ? `Pay ₹${pricing.total.toFixed(2)} & Complete` : `Complete Order (₹${pricing.total.toFixed(2)})`)}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
