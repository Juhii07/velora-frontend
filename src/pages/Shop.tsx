import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import api from '@/utils/api';

function ShopContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State for products and loading
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Active filter states (initialized from URL query parameters if present)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('newest');

  // Sync search query from Navbar click
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) setSearch(s);

    const c = searchParams.get('category');
    if (c !== null) setSelectedCategory(c);
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  // Fetch Products when filters change
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let url = `/products?page=${page}&limit=12&sort=${sort}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (rating) url += `&rating=${rating}`;

      const res = await api.get(url);
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, rating, sort]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setPage(1);
    navigate('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-4xl font-extrabold text-luxury-charcoal uppercase tracking-widest font-outfit">
          The Jewellery Gallery
        </h1>
        <p className="text-sm font-light text-gray-500 max-w-lg mx-auto leading-relaxed">
          Filter through our architectural jewelry items, crafted using precious gold, silver, and diamonds.
        </p>
        <div className="w-12 h-0.5 bg-gold mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="bg-white border border-gold/10 p-6 rounded-lg h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-gold/10 pb-3">
            <h3 className="font-outfit text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-gold" /> Filter Pieces
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-400 hover:text-gold uppercase tracking-wider font-semibold"
            >
              Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-6">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Keyword Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm bg-luxury-sand/40 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Collection Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm bg-luxury-sand/40 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              >
                <option value="">All Collections</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Inputs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Price Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 text-sm bg-luxury-sand/40 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 text-sm bg-luxury-sand/40 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Minimum Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full text-sm bg-luxury-sand/40 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              >
                <option value="">Any Rating</option>
                <option value="4">4.0 & Up</option>
                <option value="4.5">4.5 & Up</option>
                <option value="5">5.0 Star Only</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gold text-white font-outfit text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors"
            >
              Apply Filter
            </button>
          </form>
        </aside>

        {/* Product Grid and Sort Section */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Sorting / Meta Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gold/10 px-6 py-4 rounded-lg gap-4">
            <p className="text-xs text-gray-500 font-light">
              Showing <span className="font-semibold text-luxury-charcoal">{products.length}</span> of <span className="font-semibold text-luxury-charcoal">{total}</span> premium pieces
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Sort By:</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-luxury-sand/40 border border-gold/10 focus:border-gold px-3 py-1.5 rounded focus:outline-none font-semibold text-luxury-charcoal"
              >
                <option value="newest">Newest Releases</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="bestSelling">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Items Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 h-[400px] items-center justify-center text-gray-400 font-light">
              Fetching catalog...
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-gold/10 rounded-lg">
              <p className="text-gray-400 font-light text-sm mb-4">No jewelry pieces match your filter criteria.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gold text-gold rounded hover:bg-gold hover:text-white transition-colors text-xs uppercase tracking-wider font-semibold"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination Buttons */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-gold/20 text-xs font-semibold uppercase tracking-wider rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold/10 transition-colors"
              >
                Previous
              </button>
              <span className="font-outfit text-xs text-gray-500">
                Page {page} of {pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-gold/20 text-xs font-semibold uppercase tracking-wider rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold/10 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
