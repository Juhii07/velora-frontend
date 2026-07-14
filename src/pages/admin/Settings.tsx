import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { Save, Sliders, CheckSquare, Compass, ShieldAlert } from 'lucide-react';
import api from '@/utils/api';

export default function AdminSettingsPage() {
  const { settings, setSettings } = useSettingsStore();

  const [websiteName, setWebsiteName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [storyText, setStoryText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [visionText, setVisionText] = useState('');

  // Feature Flags
  const [wishlist, setWishlist] = useState(true);
  const [reviews, setReviews] = useState(true);
  const [offers, setOffers] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState(true);
  const [bestSellers, setBestSellers] = useState(true);
  const [newArrivals, setNewArrivals] = useState(true);

  // Shipping settings
  const [enableDeliveryCharge, setEnableDeliveryCharge] = useState(true);
  const [deliveryChargeAmount, setDeliveryChargeAmount] = useState('');
  const [minOrderForFreeDelivery, setMinOrderForFreeDelivery] = useState('');
  const [estimatedShippingTime, setEstimatedShippingTime] = useState('');

  // Return policy settings
  const [enableReturnPolicy, setEnableReturnPolicy] = useState(true);
  const [returnPolicyNotice, setReturnPolicyNotice] = useState('');
  const [returnPolicyDesc1, setReturnPolicyDesc1] = useState('');
  const [returnPolicyDesc2, setReturnPolicyDesc2] = useState('');
  const [returnPolicyDesc3, setReturnPolicyDesc3] = useState('');
  const [returnPolicyDesc4, setReturnPolicyDesc4] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setWebsiteName(settings.websiteName);
      setEmail(settings.email);
      setPhone(settings.phone);
      setAddress(settings.address);
      setStoryText(settings.brandStory.storyText);
      setMissionText(settings.brandStory.missionText);
      setVisionText(settings.brandStory.visionText);
      setWishlist(settings.features.wishlist);
      setReviews(settings.features.reviews);
      setOffers(settings.features.offers);
      setFeaturedProducts(settings.features.featuredProducts);
      setBestSellers(settings.features.bestSellers);
      setNewArrivals(settings.features.newArrivals);
      
      setEnableDeliveryCharge(settings.enableDeliveryCharge ?? true);
      setDeliveryChargeAmount(settings.deliveryChargeAmount?.toString() ?? '25');
      setMinOrderForFreeDelivery(settings.minOrderForFreeDelivery?.toString() ?? '500');
      setEstimatedShippingTime(settings.estimatedShippingTime ?? '2-5 Business Days');

      setEnableReturnPolicy(settings.enableReturnPolicy ?? true);
      setReturnPolicyNotice(settings.returnPolicyNotice ?? 'No refund, no return available');
      setReturnPolicyDesc1(settings.returnPolicyDesc1 ?? '');
      setReturnPolicyDesc2(settings.returnPolicyDesc2 ?? '');
      setReturnPolicyDesc3(settings.returnPolicyDesc3 ?? '');
      setReturnPolicyDesc4(settings.returnPolicyDesc4 ?? '');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      websiteName,
      email,
      phone,
      address,
      brandStory: {
        storyText,
        missionText,
        visionText
      },
      features: {
        wishlist,
        reviews,
        offers,
        featuredProducts,
        bestSellers,
        newArrivals
      },
      enableDeliveryCharge,
      deliveryChargeAmount: parseFloat(deliveryChargeAmount || '0'),
      minOrderForFreeDelivery: parseFloat(minOrderForFreeDelivery || '0'),
      estimatedShippingTime,
      enableReturnPolicy,
      returnPolicyNotice,
      returnPolicyDesc1,
      returnPolicyDesc2,
      returnPolicyDesc3,
      returnPolicyDesc4
    };

    try {
      const res = await api.put('/settings', payload);
      setSettings(res.data.data);
      alert('Settings updated successfully. Changes are now live!');
    } catch (err: any) {
      alert(err.error || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">Studio Controls</h1>
          <p className="text-xs text-gray-400 font-light mt-0.5">Toggle live features and edit general branding profiles</p>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Save size={16} /> {isLoading ? 'Saving...' : 'Deploy Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-semibold uppercase tracking-wider text-gray-500">
        
        {/* PANEL 1: Feature Toggles */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
          <h3 className="font-outfit text-sm font-bold text-luxury-charcoal border-b border-gold/10 pb-3 flex items-center gap-2">
            <Sliders size={16} className="text-gold" /> Live Feature Toggles
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer border-b border-gold/5 pb-2">
              <span>Enable Wishlist</span>
              <input
                type="checkbox"
                checked={wishlist}
                onChange={(e) => setWishlist(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer border-b border-gold/5 pb-2">
              <span>Enable Reviews</span>
              <input
                type="checkbox"
                checked={reviews}
                onChange={(e) => setReviews(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer border-b border-gold/5 pb-2">
              <span>Enable Promo Offers</span>
              <input
                type="checkbox"
                checked={offers}
                onChange={(e) => setOffers(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer border-b border-gold/5 pb-2">
              <span>Show Featured Products</span>
              <input
                type="checkbox"
                checked={featuredProducts}
                onChange={(e) => setFeaturedProducts(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer border-b border-gold/5 pb-2">
              <span>Show Best Sellers</span>
              <input
                type="checkbox"
                checked={bestSellers}
                onChange={(e) => setBestSellers(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer border-b border-gold/5 pb-2">
              <span>Show New Arrivals</span>
              <input
                type="checkbox"
                checked={newArrivals}
                onChange={(e) => setNewArrivals(e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
            </label>
          </div>
        </div>

        {/* PANEL 2: Branding / Contact info */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4 lg:col-span-2">
          <h3 className="font-outfit text-sm font-bold text-luxury-charcoal border-b border-gold/10 pb-3 flex items-center gap-2">
            <CheckSquare size={16} className="text-gold" /> Store Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5">Website Name</label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1.5">Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1.5">Phone Line</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1.5">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans"
              />
            </div>
          </div>
        </div>

        {/* PANEL 3: About Story page parameters */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4 lg:col-span-3">
          <h3 className="font-outfit text-sm font-bold text-luxury-charcoal border-b border-gold/10 pb-3 flex items-center gap-2">
            <Compass size={16} className="text-gold" /> About Page Content
          </h3>

          <div className="space-y-4 font-sans text-xs">
            <div>
              <label className="block uppercase font-bold text-gray-500 mb-1.5">Atelier Story Summary</label>
              <textarea
                rows={3}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-gray-500 mb-1.5">Atelier Mission Statement</label>
              <textarea
                rows={2}
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light"
              />
            </div>
            <div>
              <label className="block uppercase font-bold text-gray-500 mb-1.5">Atelier Vision Statement</label>
              <textarea
                rows={2}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light"
              />
            </div>
          </div>
        </div>

        {/* PANEL 4: Shipping & Fulfilment Settings */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4 lg:col-span-3">
          <h3 className="font-outfit text-sm font-bold text-luxury-charcoal border-b border-gold/10 pb-3 flex items-center gap-2">
            <Compass size={16} className="text-gold" /> Shipping & Delivery Options
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="enableDeliveryCharge"
                checked={enableDeliveryCharge}
                onChange={(e) => setEnableDeliveryCharge(e.target.checked)}
                className="w-4 h-4 accent-gold cursor-pointer"
              />
              <label htmlFor="enableDeliveryCharge" className="cursor-pointer select-none text-[10px] uppercase font-bold text-gray-500">Enable Delivery Charge</label>
            </div>
            
            <div>
              <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Delivery Charge (₹)</label>
              <input
                type="number"
                disabled={!enableDeliveryCharge}
                value={deliveryChargeAmount}
                onChange={(e) => setDeliveryChargeAmount(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                disabled={!enableDeliveryCharge}
                value={minOrderForFreeDelivery}
                onChange={(e) => setMinOrderForFreeDelivery(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Estimated Shipping Time</label>
              <input
                type="text"
                placeholder="e.g. 2-5 Business Days"
                value={estimatedShippingTime}
                onChange={(e) => setEstimatedShippingTime(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium font-sans"
              />
            </div>
          </div>
        </div>

        {/* PANEL 5: Return & Refund Policy Settings */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4 lg:col-span-3">
          <h3 className="font-outfit text-sm font-bold text-luxury-charcoal border-b border-gold/10 pb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-gold" /> Return & Refund Policy
          </h3>

          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableReturnPolicy"
                checked={enableReturnPolicy}
                onChange={(e) => setEnableReturnPolicy(e.target.checked)}
                className="w-4 h-4 accent-gold cursor-pointer"
              />
              <label htmlFor="enableReturnPolicy" className="cursor-pointer select-none text-[10px] uppercase font-bold text-gray-500">Enable Return Policy Notice on Storefront</label>
            </div>
            
            <div>
              <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Primary Return Notice Warning</label>
              <input
                type="text"
                disabled={!enableReturnPolicy}
                placeholder="e.g. No refund, no return available"
                value={returnPolicyNotice}
                onChange={(e) => setReturnPolicyNotice(e.target.value)}
                className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-medium disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Description Box 1</label>
                <textarea
                  rows={3}
                  disabled={!enableReturnPolicy}
                  value={returnPolicyDesc1}
                  onChange={(e) => setReturnPolicyDesc1(e.target.value)}
                  className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light disabled:opacity-50"
                  placeholder="e.g. Imitation jewellery items cannot be returned due to hygiene reasons."
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Description Box 2</label>
                <textarea
                  rows={3}
                  disabled={!enableReturnPolicy}
                  value={returnPolicyDesc2}
                  onChange={(e) => setReturnPolicyDesc2(e.target.value)}
                  className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light disabled:opacity-50"
                  placeholder="e.g. Quality check is performed prior to dispatch."
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Description Box 3</label>
                <textarea
                  rows={3}
                  disabled={!enableReturnPolicy}
                  value={returnPolicyDesc3}
                  onChange={(e) => setReturnPolicyDesc3(e.target.value)}
                  className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light disabled:opacity-50"
                  placeholder="e.g. Video proof of unboxing required for transit damage claims."
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[10px] uppercase font-bold text-gray-500">Description Box 4</label>
                <textarea
                  rows={3}
                  disabled={!enableReturnPolicy}
                  value={returnPolicyDesc4}
                  onChange={(e) => setReturnPolicyDesc4(e.target.value)}
                  className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none text-luxury-charcoal font-light disabled:opacity-50"
                  placeholder="e.g. Special custom items are non-refundable."
                />
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </form>
  );
}
