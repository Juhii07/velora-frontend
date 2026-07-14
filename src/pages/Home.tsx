import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { useSettingsStore } from '@/store/settings.store';
import api from '@/utils/api';

export default function HomePage() {
  const { settings } = useSettingsStore();

  const [banners, setBanners] = useState<any[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  // Fetch Homepage Data
  useEffect(() => {
    // Banners
    api.get('/banners')
      .then(res => setBanners(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoadingBanners(false));

    // Categories
    api.get('/categories')
      .then(res => setCategories(res.data.data.slice(0, 5)))
      .catch(() => {});

    // Products (segmented by tags)
    api.get('/products?tags=Trending&limit=4')
      .then(res => setTrendingProducts(res.data.data.products))
      .catch(() => {});

    api.get('/products?tags=New Arrival&limit=4')
      .then(res => setNewArrivals(res.data.data.products))
      .catch(() => {});

    api.get('/products?tags=Best Seller&limit=4')
      .then(res => setBestSellers(res.data.data.products))
      .catch(() => {});

    api.get('/products?tags=Featured Product&limit=1')
      .then(res => {
        if (res.data.data.products.length > 0) {
          setFeaturedProduct(res.data.data.products[0]);
        }
      })
      .catch(() => {});

    // Reviews (approved reviews shown as testimonials)
    api.get('/reviews/featured?limit=3')
      .then(res => setReviews(res.data.data))
      .catch(() => {});
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // Auto-play slider
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(handleNextSlide, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative w-full h-[80vh] overflow-hidden bg-luxury-sand">
        {isLoadingBanners ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-light animate-pulse">
            Loading campaigns...
          </div>
        ) : banners.length > 0 ? (
          <>
            <div className="relative w-full h-full">
              {banners.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4">
                    <div className="max-w-3xl space-y-6">
                      <p className="text-gold font-outfit text-xs font-semibold tracking-[0.3em] uppercase">
                        Velora Atelier
                      </p>
                      <h1 className="text-4xl md:text-6xl font-extrabold font-outfit tracking-wide text-white leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-gray-200 text-sm md:text-lg font-light tracking-wide max-w-xl mx-auto">
                        {slide.subtitle}
                      </p>
                      <div>
                        <Link
                          to={slide.redirectUrl}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gold-dark transition-all duration-300 transform hover:translate-y-[-2px]"
                        >
                          {slide.ctaText} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Navigation arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2 border border-white/20 bg-black/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2 border border-white/20 bg-black/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        ) : (
          // No banners configured in Admin > Banners (or the request failed) --
          // show a graceful fallback hero instead of a message that looks stuck.
          <div className="w-full h-full flex items-center justify-center text-center px-4 bg-luxury-charcoal">
            <div className="max-w-3xl space-y-6">
              <p className="text-gold font-outfit text-xs font-semibold tracking-[0.3em] uppercase">
                {settings?.websiteName || 'Velora Atelier'}
              </p>
              <h1 className="text-4xl md:text-6xl font-extrabold font-outfit tracking-wide text-white leading-tight">
                Fine Architectural Jewelry
              </h1>
              <p className="text-gray-300 text-sm md:text-lg font-light tracking-wide max-w-xl mx-auto">
                Discover our curated collection of handcrafted luxury pieces.
              </p>
              <div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gold-dark transition-all duration-300 transform hover:translate-y-[-2px]"
                >
                  Shop Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">Collections</p>
          <h2 className="text-3xl font-extrabold text-luxury-charcoal">Featured Categories</h2>
          <div className="w-12 h-0.5 bg-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${cat._id}`}
              className="group relative aspect-[3/4] bg-luxury-sand rounded-lg overflow-hidden block shadow-sm border border-gold/10 hover-gold-glow animate-fade-in-up"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=400&auto=format&fit=crop'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-4 text-center">
                <span className="font-outfit text-white text-sm font-semibold tracking-wider uppercase group-hover:text-gold transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      {settings?.features?.featuredProducts !== false && trendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end border-b border-gold/10 pb-4 mb-8">
            <div>
              <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">Highly Coveted</p>
              <h2 className="text-2xl font-bold text-luxury-charcoal mt-1">Trending Pieces</h2>
            </div>
            <Link to="/shop?tags=Trending" className="text-xs font-semibold text-gold hover:text-gold-dark flex items-center gap-1 uppercase tracking-wider">
              Explore All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map((p, idx) => (
              <ProductCard key={idx} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. NEW ARRIVALS */}
      {settings?.features?.newArrivals !== false && newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end border-b border-gold/10 pb-4 mb-8">
            <div>
              <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">The Atelier Release</p>
              <h2 className="text-2xl font-bold text-luxury-charcoal mt-1">New Arrivals</h2>
            </div>
            <Link to="/shop?tags=New Arrival" className="text-xs font-semibold text-gold hover:text-gold-dark flex items-center gap-1 uppercase tracking-wider">
              Explore All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p, idx) => (
              <ProductCard key={idx} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 5. FEATURED COLLECTION SECTION */}
      {featuredProduct && (
        <section className="bg-luxury-sand/30 py-20 border-y border-gold/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white border border-gold/15 p-8 rounded-lg shadow-sm hover-gold-glow">
              {/* Image side */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gold/10">
                <img
                  src={featuredProduct.images[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Description side */}
              <div className="space-y-6">
                <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">Atelier Highlight</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-luxury-charcoal uppercase tracking-wider">{featuredProduct.name}</h2>
                <div className="w-12 h-0.5 bg-gold"></div>
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                  {featuredProduct.description}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-outfit font-bold text-gold">
                    ₹{featuredProduct.discountPrice || featuredProduct.price}
                  </span>
                  {featuredProduct.discountPrice && (
                    <span className="text-sm text-gray-400 line-through">₹{featuredProduct.price}</span>
                  )}
                </div>
                <div>
                  <Link
                    to={`/product/${featuredProduct.slug}`}
                    className="btn-gold-gradient inline-flex items-center gap-2 px-8 py-3.5 font-outfit text-xs font-bold uppercase tracking-wider rounded-md"
                  >
                    View Fine Piece <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. BEST SELLERS */}
      {settings?.features?.bestSellers !== false && bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end border-b border-gold/10 pb-4 mb-8">
            <div>
              <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">Atelier Favorites</p>
              <h2 className="text-2xl font-bold text-luxury-charcoal mt-1">Best Sellers</h2>
            </div>
            <Link to="/shop?tags=Best Seller" className="text-xs font-semibold text-gold hover:text-gold-dark flex items-center gap-1 uppercase tracking-wider">
              Explore All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((p, idx) => (
              <ProductCard key={idx} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 7. CUSTOMER REVIEWS */}
      {settings?.features?.reviews !== false && reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">Client Testimonials</p>
            <h2 className="text-3xl font-extrabold text-luxury-charcoal">Customer Reviews</h2>
            <div className="w-12 h-0.5 bg-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex text-gold">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-gold" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm font-light leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t border-gold/10 pt-4">
                  <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-outfit text-xs font-bold">
                    {rev.name[0]}
                  </div>
                  <div>
                    <h5 className="font-outfit text-xs font-bold text-luxury-charcoal uppercase tracking-wider">{rev.name}</h5>
                    <p className="text-[10px] text-gray-400">Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}