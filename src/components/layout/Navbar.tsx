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
            <Link to="/" className="font-outfit text-xl sm:text-2xl font-extrabold tracking-widest text-gold hover:text-gold-dark transition-colors">
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
          <div className="flex items-center space-x-3 sm:space-x-6">

            {/* Search Bar Slider - hidden on phones to save space, still reachable via mobile drawer below */}
            {/* suppressHydrationWarning: browser autofill/form-filler extensions
               inject a "fdprocessedid" attribute on inputs/buttons right after
               load, before React hydrates -- this is not caused by our code,
               so we suppress the resulting (harmless) console warning here. */}
            <form onSubmit={handleSearchSubmit} className="relative items-center hidden sm:flex">
              <input
                type="text"
                placeholder="Search premium pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className={`transition-all duration-300 bg-luxury-sand/50 text-sm border-gold/20 focus:border-gold focus:outline-none px-4 py-1.5 rounded-full ${
                  isSearchOpen ? 'w-32 sm:w-48 md:w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                suppressHydrationWarning
                className="p-1 text-luxury-charcoal hover:text-gold transition-colors ml-1 sm:ml-2"
              >
                <Search size={19} />
              </button>
            </form>

            {/* Wishlist - hidden below sm to keep the bar from crowding on phones, still reachable from the mobile drawer */}
            {settings?.features?.wishlist !== false && (
              <Link to="/wishlist" className="relative p-1 text-luxury-charcoal hover:text-gold transition-colors hidden sm:inline-flex">
                <Heart size={19} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-white font-outfit text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-1 text-luxury-charcoal hover:text-gold transition-colors">
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white font-outfit text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown - hidden on the smallest screens, accessible via mobile drawer instead */}
            <div className="relative hidden sm:block">
              {user ? (
                <>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1.5 p-1 text-luxury-charcoal hover:text-gold transition-colors focus:outline-none"
                  >
                    <UserIcon size={19} />
                    <span className="hidden lg:inline text-xs font-medium uppercase tracking-wider">{user.name.split(' ')[0]}</span>
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
                  <UserIcon size={19} />
                  <span className="hidden lg:inline text-xs font-medium uppercase tracking-wider">Login</span>
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

      {/* Mobile Drawer - now also carries Search, Wishlist, Account/Login since those icons are hidden below sm */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gold/10 bg-white px-4 py-4 space-y-1 shadow-lg max-h-[80vh] overflow-y-auto">
          {/* suppressHydrationWarning: see note above on the desktop search form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-3 sm:hidden">
            <input
              type="text"
              placeholder="Search premium pieces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              className="flex-1 bg-luxury-sand/50 text-sm border border-gold/20 focus:border-gold focus:outline-none px-4 py-2 rounded-full"
            />
            <button
              type="submit"
              suppressHydrationWarning
              className="p-2 text-luxury-charcoal hover:text-gold transition-colors shrink-0"
            >
              <Search size={19} />
            </button>
          </form>

          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Shop
          </Link>
          <Link
            to="/shop?category=bracelets"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Collections
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
          >
            Contact
          </Link>

          <div className="border-t border-gold/10 my-2 pt-2 space-y-1">
            {settings?.features?.wishlist !== false && (
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
              >
                <Heart size={18} /> Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
              </Link>
            )}
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
                  >
                    <Settings size={18} /> Admin Portal
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
                >
                  <UserIcon size={18} /> My Account
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-base font-medium hover:bg-luxury-sand/50"
              >
                <UserIcon size={18} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}