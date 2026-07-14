import React, { useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import api from '@/utils/api';
import { LayoutDashboard, ShoppingBag, Sliders, Image, AlertTriangle, ShieldCheck, Home, ClipboardList, Users } from 'lucide-react';

// Note: the original Next.js version served the admin portal on a separate
// dev port (3001) as a crude access boundary. In this single-server Vite/React
// SPA, the whole app runs on one port, so that port-separation check has been
// removed -- route-level auth/role checks below are the real access control.
export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);

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

  return (
    <div className="min-h-screen flex bg-luxury-sand/30">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-luxury-charcoal text-gray-400 border-r border-gold/10 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="border-b border-gold/10 pb-4">
            <span className="font-outfit text-xl font-extrabold tracking-widest text-white block">VELORA</span>
            <span className="text-[10px] text-gold uppercase tracking-wider font-bold block mt-0.5 flex items-center gap-1">
              <ShieldCheck size={12} /> Admin Studio
            </span>
          </div>

          <nav className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-luxury-beige/10 hover:text-white transition-all"
            >
              <LayoutDashboard size={16} /> Overview
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-luxury-beige/10 hover:text-white transition-all"
            >
              <ClipboardList size={16} /> Orders
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-luxury-beige/10 hover:text-white transition-all"
            >
              <ShoppingBag size={16} /> Products
            </Link>
            <Link
              to="/admin/banners"
              className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-luxury-beige/10 hover:text-white transition-all"
            >
              <Image size={16} /> Banners
            </Link>
            <Link
              to="/admin/customers"
              className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-luxury-beige/10 hover:text-white transition-all"
            >
              <Users size={16} /> Clients
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 px-4 py-2.5 rounded hover:bg-luxury-beige/10 hover:text-white transition-all"
            >
              <Sliders size={16} /> Page Settings
            </Link>
          </nav>
        </div>

        <div className="text-[10px] text-gray-500 border-t border-gold/10 pt-4">
          Logged in as <span className="text-white block truncate">{user.email}</span>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}
