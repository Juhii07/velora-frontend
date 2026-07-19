import React, { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import api from '@/utils/api';
import {
  LayoutDashboard, ShoppingBag, Sliders, Image, AlertTriangle,
  ShieldCheck, Home, ClipboardList, Users, Star, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/customers', label: 'Clients', icon: Users },
  { to: '/admin/settings', label: 'Page Settings', icon: Sliders },
];

// Note: the original Next.js version served the admin portal on a separate
// dev port (3001) as a crude access boundary. In this single-server Vite/React
// SPA, the whole app runs on one port, so that port-separation check has been
// removed -- route-level auth/role checks below are the real access control.
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setAuth } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {

    const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('velora_token') : false;

    if (!hasToken) {
      navigate('/auth/login?redirect=admin/dashboard');
    } else if (user) {
      setIsChecking(false);
    } else {
      // Token exists but user not loaded, fetch profile
      api.get('/auth/profile')
        .then((res) => {
          const fetchedUser = res.data.data.user;
          setAuth(fetchedUser, localStorage.getItem('velora_token'));
          setIsChecking(false);
        })
        .catch(() => {
          navigate('/auth/login?redirect=admin/dashboard');
        });
    }
  }, [user, navigate]);

  // Close the mobile drawer automatically whenever the route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isChecking && !user) {
    return <div className="text-center py-20 font-light text-gray-500">Checking credentials...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">
          Access Denied
        </h1>
        <p className="text-gray-500 text-sm font-light leading-relaxed">
          You do not possess the required administrator credentials to view this portal.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-6 py-2 bg-luxury-charcoal text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gold transition-colors"
        >
          <Home size={14} /> Back to Homepage
        </Link>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="space-y-8">
        <div className="border-b border-gold/10 pb-4 flex items-center justify-between">
          <div>
            <span className="font-outfit text-xl font-extrabold tracking-widest text-white block">VELORA</span>
            <span className="text-[10px] text-gold uppercase tracking-wider font-bold block mt-0.5 flex items-center gap-1">
              <ShieldCheck size={12} /> Admin Studio
            </span>
          </div>
          {/* Close button, mobile drawer only */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded transition-all ${
                  isActive
                    ? 'bg-gold/15 text-gold'
                    : 'hover:bg-luxury-beige/10 hover:text-white'
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-[10px] text-gray-500 border-t border-gold/10 pt-4">
        Logged in as <span className="text-white block truncate">{user.email}</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-luxury-sand/30">

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-luxury-charcoal text-white flex items-center justify-between px-4 py-3.5 border-b border-gold/10">
        <span className="font-outfit text-lg font-extrabold tracking-widest">VELORA</span>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 text-gray-300 hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 max-w-[80vw] bg-luxury-charcoal text-gray-400 border-r border-gold/10 flex flex-col justify-between p-6 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar (always visible, static) */}
      <aside className="hidden md:flex w-64 bg-luxury-charcoal text-gray-400 border-r border-gold/10 flex-col justify-between p-6 shrink-0">
        {sidebarContent}
      </aside>

      {/* Main workspace */}
      <main className="flex-1 p-4 pt-20 sm:p-6 md:p-10 md:pt-10 overflow-y-auto min-w-0">
        <Outlet />
      </main>

    </div>
  );
}