import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Equivalent of the storefront portion of the old Next.js root layout.tsx
export default function StoreLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-luxury-beige">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
