import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import api from '@/utils/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, setItems, removeItem, updateQuantity } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountMsg, setDiscountMsg] = useState('');
  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 25,
    total: 0
  });

  // Calculate pricing client-side
  const calculateClientPricing = () => {
    let sub = 0;
    for (const item of items) {
      const price = item.product.discountPrice || item.product.price;
      sub += price * item.quantity;
    }
    const ship = sub > 500 ? 0 : items.length > 0 ? 25 : 0;
    const tot = sub + ship;
    setPricing({ subtotal: sub, discount: 0, shipping: ship, total: tot });
  };

  // Sync pricing from Server if user is logged in
  const syncServerPricing = async () => {
    if (!user) {
      calculateClientPricing();
      return;
    }
    try {
      let url = '/orders/checkout-summary';
      if (couponCode) url += `?couponCode=${couponCode}`;
      const res = await api.get(url);
      setPricing(res.data.data);
    } catch (err: any) {
      setDiscountMsg(err.error || 'Invalid coupon code');
      calculateClientPricing();
    }
  };

  useEffect(() => {
    syncServerPricing();
  }, [items, user]);

  const handleQtyChange = async (productId: string, currentQty: number, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    if (newQty > maxStock) return alert('Requested quantity exceeds stock limits');

    if (user) {
      try {
        const res = await api.put('/cart/quantity', { productId, quantity: newQty });
        setItems(res.data.data.items);
      } catch (err) {}
    } else {
      updateQuantity(productId, newQty);
    }
  };

  const handleRemove = async (productId: string) => {
    if (user) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        setItems(res.data.data.items);
      } catch (err) {}
    } else {
      removeItem(productId);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountMsg('');
    syncServerPricing();
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (!user) {
      alert('Please sign in or create an account to proceed to checkout.');
      navigate('/auth/login?redirect=checkout');
    } else {
      navigate(`/checkout?coupon=${couponCode}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-bold font-outfit uppercase tracking-wider">Your Cart is Empty</h1>
        <p className="text-gray-500 font-light text-sm max-w-sm mx-auto leading-relaxed">
          Explore our collections and add fine jewelry pieces to your bag.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">Your Shopping Bag</h1>
      <div className="w-12 h-0.5 bg-gold"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gold/10 p-4 rounded-lg flex gap-4 items-center justify-between"
            >
              {/* Product Info */}
              <div className="flex gap-4 items-center flex-grow">
                <div className="w-20 h-20 bg-luxury-sand rounded overflow-hidden aspect-square shrink-0">
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 truncate">
                  <Link to={`/product/${item.product.slug}`} className="font-outfit text-sm font-semibold hover:text-gold transition-colors block truncate">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gold font-semibold">
                    ₹{item.product.discountPrice || item.product.price}
                  </p>
                  <p className="text-[10px] text-gray-400">Stock: {item.product.stock} available</p>
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center border border-gold/20 rounded">
                <button
                  onClick={() => handleQtyChange(item.product._id, item.quantity, item.quantity - 1, item.product.stock)}
                  className="px-2.5 py-1 text-gray-500 hover:text-gold"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-outfit font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQtyChange(item.product._id, item.quantity, item.quantity + 1, item.product.stock)}
                  className="px-2.5 py-1 text-gray-500 hover:text-gold"
                >
                  +
                </button>
              </div>

              {/* Price Total / Remove */}
              <div className="flex flex-col items-end gap-2 text-right pl-4">
                <span className="text-sm font-outfit font-bold text-luxury-charcoal">
                    ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemove(item.product._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary Panel */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg h-fit space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Order Summary
          </h3>

          {/* Pricing breakdowns */}
          <div className="space-y-3 text-sm font-light">
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
              <span>Estimated Shipping</span>
              <span className="font-outfit font-semibold">
                {pricing.shipping === 0 ? 'Complimentary' : `₹${pricing.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-gold/10 pt-3 text-base font-bold text-luxury-charcoal">
              <span>Total</span>
              <span className="font-outfit text-gold">₹{pricing.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Promo Code</label>
            <div className="flex border border-gold/20 rounded overflow-hidden focus-within:border-gold">
              <input
                type="text"
                placeholder="VELORA10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="bg-transparent text-sm w-full px-3 py-2 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-luxury-sand text-xs font-bold uppercase tracking-wider px-4 border-l border-gold/20 hover:bg-gold hover:text-white transition-colors"
              >
                Apply
              </button>
            </div>
            {discountMsg && <p className="text-[10px] text-red-600">{discountMsg}</p>}
          </form>

          <button
            onClick={handleCheckout}
            className="w-full py-3.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all"
          >
            Checkout <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
