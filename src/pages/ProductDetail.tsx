import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Heart, ShoppingCart, ShieldCheck, RefreshCw, Truck, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useSettingsStore } from '@/store/settings.store';
import ProductCard from '@/components/common/ProductCard';
import api from '@/utils/api';

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { slug = '' } = useParams<{ slug: string }>();
  
  const { user } = useAuthStore();
  const { wishlistIds, toggleWishlistId, addItem } = useCartStore();
  const { settings } = useSettingsStore();

  const [product, setProduct] = useState<any | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [related, setRelated] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Zoom lens state
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Add Review state
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  // Fetch product data
  useEffect(() => {
    setIsLoadingProduct(true);
    api.get(`/products/slug/${slug}`)
      .then((res) => {
        const prod = res.data.data;
        setProduct(prod);
        setActiveImage(prod.images[0] || '');
        
        // Fetch reviews
        api.get(`/reviews/product/${prod._id}`)
          .then(revRes => setReviews(revRes.data.data))
          .catch(() => {});

        // Fetch related products
        api.get(`/products/related/${slug}`)
          .then(relRes => setRelated(relRes.data.data))
          .catch(() => {});
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoadingProduct(false);
      });
  }, [slug]);

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  // Zoom Lens Effect on Image Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleWishlistToggle = async () => {
    if (!user) return alert('Please log in to manage your wishlist');
    try {
      await api.post('/wishlist', { productId: product._id });
      toggleWishlistId(product._id);
    } catch (err) {}
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) return;
    if (user) {
      try {
        const res = await api.post('/cart', { productId: product._id, quantity: 1 });
        useCartStore.getState().setItems(res.data.data.items);
        alert('Added to cart');
      } catch (err: any) {
        alert(err.error || 'Failed to add item to cart');
      }
    } else {
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

  const handleBuyNow = async () => {
    if (product.stock === 0) return;
    // Clear cart locally/server-side (optional) or just add to cart and redirect immediately
    await handleAddToCart();
    navigate('/cart');
  };

  const handleBuyOnWhatsApp = () => {
    if (product.stock === 0) return;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const priceStr = product.discountPrice ? `₹${product.discountPrice}` : `₹${product.price}`;
    const textMessage = `Hello Velora! I would like to purchase the following jewelry piece:\n\n*${product.name}*\nPrice: ${priceStr}\nLink: ${currentUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919336896144&text=${encodeURIComponent(textMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    try {
      await api.post('/reviews', {
        product: product._id,
        rating: newRating,
        comment
      });
      setReviewMsg('Your review has been submitted and is pending admin approval.');
      setComment('');
    } catch (err: any) {
      setReviewMsg(err.error || 'Failed to submit review');
    }
  };

  if (isLoadingProduct) {
    return <div className="text-center py-20 font-light text-gray-500">Loading fine jewelry details...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 font-light text-red-500">Jewellery piece not found.</div>;
  }

  const isWishlisted = wishlistIds.includes(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          
          {/* Main Display Image with Hover Zoom Magnifier */}
          <div
            className="relative aspect-square border border-gold/10 bg-luxury-sand rounded-lg overflow-hidden cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Zoom Frame overlay */}
            <div
              style={{
                ...zoomStyle,
                backgroundImage: `url(${activeImage})`,
                backgroundSize: '200%',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Miniature Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 border rounded overflow-hidden aspect-square bg-luxury-sand shrink-0 ${
                    activeImage === img ? 'border-gold border-2' : 'border-gold/10'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specifications and Buttons */}
        <div className="space-y-6">
          <p className="text-gold font-outfit text-xs font-semibold tracking-widest uppercase">Fine Jewelry Collection</p>
          <h1 className="text-3xl font-extrabold text-luxury-charcoal uppercase tracking-wide">{product.name}</h1>
          
          {/* Ratings Summary */}
          <div className="flex items-center gap-1.5 border-b border-gold/10 pb-4">
            <Star size={16} className="text-gold fill-gold" />
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.numReviews} client reviews)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-outfit font-bold text-gold">₹{product.discountPrice}</span>
                <span className="text-base text-gray-400 line-through">₹{product.price}</span>
              </>
            ) : (
              <span className="text-3xl font-outfit font-bold text-luxury-charcoal">₹{product.price}</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed font-light">{product.description}</p>
            
            {product.descriptionBox1 && (
              <div className="bg-luxury-sand/10 border border-gold/5 p-4 rounded-lg space-y-1">
                <h5 className="font-outfit font-bold uppercase tracking-wider text-[10px] text-gold">Highlights & Details</h5>
                <p className="text-gray-600 text-xs leading-relaxed font-light whitespace-pre-wrap font-sans normal-case">{product.descriptionBox1}</p>
              </div>
            )}

            {product.descriptionBox2 && (
              <div className="bg-luxury-sand/10 border border-gold/5 p-4 rounded-lg space-y-1">
                <h5 className="font-outfit font-bold uppercase tracking-wider text-[10px] text-gold">Specifications & Care</h5>
                <p className="text-gray-600 text-xs leading-relaxed font-light whitespace-pre-wrap font-sans normal-case">{product.descriptionBox2}</p>
              </div>
            )}
          </div>

          {/* Stock Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Availability:</span>
            {product.stock > 0 ? (
              <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                In Stock ({product.stock} pieces remaining)
              </span>
            ) : (
              <span className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-medium">Out of Stock</span>
            )}
          </div>

          {/* Shipping Overrides Info */}
          {(product.shippingTimeOverride || (product.shippingPriceOverride !== undefined && product.shippingPriceOverride !== null)) && (
            <div className="flex flex-col gap-1 text-[11px] text-gray-500 border-l-2 border-gold/30 pl-3 py-0.5">
              {product.shippingTimeOverride && (
                <p><span className="font-semibold uppercase tracking-wider text-[9px] text-gray-400">Estimated Shipping:</span> {product.shippingTimeOverride}</p>
              )}
              {product.shippingPriceOverride !== undefined && product.shippingPriceOverride !== null && (
                <p>
                  <span className="font-semibold uppercase tracking-wider text-[9px] text-gray-400">Shipping Rate:</span>{' '}
                  {product.shippingPriceOverride === 0 ? (
                    <span className="text-green-700 font-bold">Complimentary</span>
                  ) : (
                    <span className="font-bold text-luxury-charcoal">₹{product.shippingPriceOverride}</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gold/10">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-grow py-3.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-grow py-3.5 bg-luxury-charcoal hover:bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Buy It Now
            </button>
            <button
              onClick={handleBuyOnWhatsApp}
              disabled={product.stock === 0}
              className="flex-grow py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-outfit text-xs font-bold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Buy on WhatsApp
            </button>
            {settings?.features?.wishlist !== false && (
              <button
                onClick={handleWishlistToggle}
                className={`px-4 py-3.5 border rounded-md transition-all flex items-center justify-center ${
                  isWishlisted ? 'border-gold text-gold bg-gold/5' : 'border-gold/20 text-luxury-charcoal hover:border-gold hover:text-gold'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Policy Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-center text-gray-500 text-xs font-light">
            <div className="flex flex-col items-center gap-1.5 p-3 bg-luxury-sand/30 rounded">
              <Truck size={18} className="text-gold" />
              <span>Complimentary Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-luxury-sand/30 rounded">
              <RefreshCw size={18} className="text-gold" />
              <span>14-Day Exchange</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-luxury-sand/30 rounded">
              <ShieldCheck size={18} className="text-gold" />
              <span>Guaranteed Authenticity</span>
            </div>
          </div>

          {/* Return & Refund Policy */}
          {settings?.enableReturnPolicy && (
            <div className="border border-gold/15 p-4 rounded-lg bg-white space-y-3 mt-6">
              <div className="flex items-center gap-2 text-red-600 font-semibold uppercase tracking-wider text-[10px]">
                <ShieldAlert size={14} className="shrink-0" />
                <span>Return & Refund: {settings.returnPolicyNotice || 'No refund, no return available'}</span>
              </div>
              {(settings.returnPolicyDesc1 || settings.returnPolicyDesc2 || settings.returnPolicyDesc3 || settings.returnPolicyDesc4) && (
                <div className="text-[11px] text-gray-500 font-light space-y-2 border-t border-gold/5 pt-2 font-sans normal-case">
                  {settings.returnPolicyDesc1 && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-gold mt-0.5">•</span>
                      <p>{settings.returnPolicyDesc1}</p>
                    </div>
                  )}
                  {settings.returnPolicyDesc2 && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-gold mt-0.5">•</span>
                      <p>{settings.returnPolicyDesc2}</p>
                    </div>
                  )}
                  {settings.returnPolicyDesc3 && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-gold mt-0.5">•</span>
                      <p>{settings.returnPolicyDesc3}</p>
                    </div>
                  )}
                  {settings.returnPolicyDesc4 && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-gold mt-0.5">•</span>
                      <p>{settings.returnPolicyDesc4}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Reviews Section */}
      {settings?.features?.reviews !== false && (
        <section className="border-t border-gold/10 pt-12 space-y-8">
          <h2 className="font-outfit text-2xl font-bold uppercase tracking-wider text-luxury-charcoal">Client Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length > 0 ? (
                reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gold/10 p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-outfit text-xs font-bold">
                          {rev.name[0]}
                        </div>
                        <div>
                          <h5 className="font-outfit text-xs font-bold uppercase tracking-wider">{rev.name}</h5>
                          <span className="text-[10px] text-gray-400">Verified Buyer</span>
                        </div>
                      </div>
                      <div className="flex text-gold">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} className="fill-gold" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-light leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 font-light text-sm italic">No reviews yet for this jewelry piece.</p>
              )}
            </div>

            {/* Submit Review Form */}
            <div>
              {user ? (
                <form onSubmit={handleAddReview} className="bg-white border border-gold/10 p-6 rounded-lg space-y-4">
                  <h4 className="font-outfit text-sm font-bold uppercase tracking-wider">Leave a Review</h4>
                  
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-gold"
                        >
                          <Star size={20} className={star <= newRating ? 'fill-gold' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Comments</label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full text-sm bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                      placeholder="Share your experience wearing this ornament..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Submit Review
                  </button>
                  {reviewMsg && <p className="text-xs text-gold text-center">{reviewMsg}</p>}
                </form>
              ) : (
                <div className="bg-luxury-sand/30 border border-gold/10 p-6 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-light mb-3">Please login to write a verified review.</p>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-2 bg-luxury-charcoal text-white rounded hover:bg-gold text-xs font-bold uppercase tracking-wider"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <section className="border-t border-gold/10 pt-12 space-y-8">
          <h2 className="font-outfit text-2xl font-bold uppercase tracking-wider text-luxury-charcoal">Related Masterpieces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p: any) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
