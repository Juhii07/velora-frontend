import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import api from '@/utils/api';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number;
    images: string[];
    rating: number;
    numReviews: number;
    tags: string[];
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuthStore();
  const { wishlistIds, toggleWishlistId, addItem } = useCartStore();
  const { settings } = useSettingsStore();

  const isWishlisted = wishlistIds.includes(product._id);
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to manage your wishlist');
      return;
    }
    try {
      await api.post('/wishlist', { productId: product._id });
      toggleWishlistId(product._id);
    } catch (err) {}
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    if (user) {
      try {
        const res = await api.post('/cart', { productId: product._id, quantity: 1 });
        // Set Zustand state from API response items
        useCartStore.getState().setItems(res.data.data.items);
      } catch (err: any) {
        alert(err.error || 'Failed to add item to cart');
      }
    } else {
      // Guest local addition
      addItem({
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images,
          stock: product.stock
        },
        quantity: 1
      });
      alert('Added to local cart. Log in to save.');
    }
  };

  return (
    <div className="group relative luxury-card overflow-hidden animate-fade-in-up">
      {/* Product Image Panel */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-luxury-sand image-zoom-hover">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.tags.includes('Trending') && (
            <span className="bg-gold text-white font-outfit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Trending
            </span>
          )}
          {product.tags.includes('Best Seller') && (
            <span className="bg-luxury-charcoal text-white font-outfit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Best Seller
            </span>
          )}
          {discountPct > 0 && (
            <span className="bg-red-600 text-white font-outfit text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Action button overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
          {settings?.features?.wishlist !== false && (
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-full transition-colors ${
                isWishlisted ? 'bg-gold text-white' : 'bg-white text-luxury-charcoal hover:bg-gold hover:text-white'
              }`}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-full transition-colors ${
              product.stock === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-white text-luxury-charcoal hover:bg-gold hover:text-white'
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </Link>

      {/* Details Box */}
      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-outfit text-base font-semibold text-luxury-charcoal hover:text-gold transition-colors truncate mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Ratings and reviews counts */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-gold fill-gold" />
          <span className="text-xs font-outfit font-semibold text-luxury-charcoal mt-0.5">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.numReviews})</span>
        </div>

        {/* Price list */}
        <div className="flex items-baseline gap-2">
          {product.discountPrice ? (
            <>
              <span className="text-base font-outfit font-bold text-gold">₹{product.discountPrice}</span>
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="text-base font-outfit font-bold text-luxury-charcoal">₹{product.price}</span>
          )}
        </div>
        
        {product.stock === 0 && (
          <p className="text-[10px] text-red-600 font-medium uppercase tracking-wider mt-1">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
