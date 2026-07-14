import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, User as UserIcon, Search, Menu, X, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useSettingsStore } from '@/store/settings.store';
import api from '@/utils/api';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { items, wishlistIds, setItems, setWishlistIds } = useCartStore();
  const { settings } = useSettingsStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Sync state if user is logged in
  useEffect(() => {
    if (user) {
      api.get('/cart')
        .then(res => setItems(res.data.data.items))
        .catch(() => {});
      
      api.get('/wishlist')
        .then(res => setWishlistIds(res.data.data.products))
        .catch(() => {});
    }
  }, [user, setItems, setWishlistIds]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {}
    clearAuth();
    navigate('/');
  };

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-gold/10 backdrop-blur-md bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-outfit text-2xl font-extrabold tracking-widest text-gold hover:text-gold-dark transition-colors">
              {settings?.websiteName || 'VELORA'}
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors">Home</Link>
            <Link to="/shop" className="text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors">Shop</Link>
            <Link to="/shop?category=bracelets" className="text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors">Collections</Link>
            <Link to="/about" className="text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors">About</Link>
            <Link to="/contact" className="text-sm font-medium tracking-wide uppercase hover:text-gold transition-colors">Contact</Link>
          </div>

          {/* Right Utility Icons */}
          <div className="flex items-center space-x-6">
            
            {/* Search Bar Slider */}
            {/* suppressHydrationWarning: browser autofill/form-filler extensions
               inject a "fdprocessedid" attribute on inputs/buttons right after
               load, before React hydrates -- this is not caused by our code,
               so we suppress the resulting (harmless) console warning here. */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search premium pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className={`transition-all duration-300 bg-luxury-sand/50 text-sm border-gold/20 focus:border-gold focus:outline-none px-4 py-1.5 rounded-full ${
                  isSearchOpen ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                suppressHydrationWarning
                className="p-1 text-luxury-charcoal hover:text-gold transition-colors ml-2"
              >
                <Search size={20} />
              </button>
            </form>

            {/* Wishlist */}
            {settings?.features?.wishlist !== false && (
              <Link to="/wishlist" className="relative p-1 text-luxury-charcoal hover:text-gold transition-colors">
                <Heart size={20} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white font-outfit text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-1 text-luxury-charcoal hover:text-gold transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white font-outfit text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1.5 p-1 text-luxury-charcoal hover:text-gold transition-colors focus:outline-none"
                  >
                    <UserIcon size={20} />
                    <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider">{user.name.split(' ')[0]}</span>
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-gold/10 rounded-md shadow-xl py-1 z-50">
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-luxury-charcoal hover:bg-luxury-sand/50"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Settings className="mr-2" size={16} /> Admin Portal
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-luxury-charcoal hover:bg-luxury-sand/50"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <UserIcon className="mr-2" size={16} /> My Account
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-2" size={16} /> Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/auth/login" className="flex items-center space-x-1.5 p-1 text-luxury-charcoal hover:text-gold transition-colors">
                  <UserIcon size={20} />
                  <span className="hidden sm:inline text-xs font-medium uppercase tracking-wider">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              suppressHydrationWarning
              className="md:hidden p-1 text-luxury-charcoal hover:text-gold transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gold/10 bg-white px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Shop
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}