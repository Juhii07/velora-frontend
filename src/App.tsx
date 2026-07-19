import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Providers from './providers';
import StoreLayout from '@/components/layout/StoreLayout';
import AdminLayout from '@/components/layout/AdminLayout';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Wishlist from '@/pages/Wishlist';
import Profile from '@/pages/Profile';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

import AdminDashboard from '@/pages/admin/Dashboard';
import AdminOrders from '@/pages/admin/Orders';
import AdminProducts from '@/pages/admin/Products';
import AdminBanners from '@/pages/admin/Banners';
import AdminCustomers from '@/pages/admin/Customers';
import AdminSettings from '@/pages/admin/Settings';
import AdminReviewsPage from '@/pages/admin/Reviews';

export default function App() {
  return (
    <Providers>
      <Routes>
        {/* Storefront routes (share Navbar/Footer) */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Admin routes (share the AdminLayout sidebar + auth guard) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Providers>
  );
}

function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <h1 className="text-3xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">404</h1>
      <p className="text-gray-500 text-sm font-light">The page you're looking for doesn't exist.</p>
    </div>
  );
}
