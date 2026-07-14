import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useSettingsStore } from '@/store/settings.store';
import api from '@/utils/api';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wishlistIds, setWishlistIds } = useCartStore();
  const { settings } = useSettingsStore();

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      // Populate full products
      const pIds = res.data.data.products;
      setWishlistIds(pIds);

      // Fetch products detail for populated view
      const itemPromises = pIds.map((id: string) => api.get(`/products?limit=100`).then(r => r.data.data.products.find((p: any) => p._id === id)));
      const items = await Promise.all(itemPromises);
      setWishlistItems(items.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId: string) => {
    try {
      await api.post('/wishlist', { productId });
      setWishlistIds(wishlistIds.filter(id => id !== productId));
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
    } catch (err) {}
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      const res = await api.post('/wishlist/move-to-cart', { productId });
      useCartStore.getState().setItems(res.data.data.cart.items);
      setWishlistIds(wishlistIds.filter(id => id !== productId));
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
      alert('Moved to cart!');
    } catch (err: any) {
      alert(err.error || 'Failed to move to cart');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
          <Heart size={28} />
        </div>
        <h1 className="text-2xl font-bold font-outfit uppercase tracking-wider">Access Your Wishlist</h1>
        <p className="text-gray-500 font-light text-sm max-w-sm mx-auto leading-relaxed">
          Log in to access your curated wishlists and luxury collections.
        </p>
        <div>
          <button
            onClick={() => navigate('/auth/login?redirect=wishlist')}
            className="px-8 py-3 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (settings?.features?.wishlist === false) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-light text-red-600">
        Wishlist feature is currently disabled.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-20 font-light text-gray-500">Fetching wishlist items...</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto">
          <Heart size={28} />
        </div>
        <h1 className="text-2xl font-bold font-outfit uppercase tracking-wider">Your Wishlist is Empty</h1>
        <p className="text-gray-500 font-light text-sm max-w-sm mx-auto leading-relaxed">
          Browse through our products and save your favorite designs here.
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors"
          >
            Explore Masterpieces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">Your Wishlist</h1>
      <div className="w-12 h-0.5 bg-gold"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gold/10 rounded-lg overflow-hidden flex flex-col justify-between"
          >
            {/* Image display */}
            <div className="relative aspect-square bg-luxury-sand">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700 rounded-full transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Info details */}
            <div className="p-4 space-y-3">
              <h3 className="font-outfit text-sm font-bold uppercase tracking-wider truncate">
                {item.name}
              </h3>
              <p className="text-sm font-outfit font-semibold text-gold">${item.discountPrice || item.price}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleMoveToCart(item._id)}
                  disabled={item.stock === 0}
                  className="flex-grow py-2 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>
                <Link
                  to={`/product/${item.slug}`}
                  className="px-3 py-2 border border-gold/20 hover:border-gold hover:text-gold rounded text-xs font-semibold uppercase tracking-wider text-center"
                >
                  View Details
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
