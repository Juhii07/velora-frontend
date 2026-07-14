import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Compass } from 'lucide-react';
import { useSettingsStore } from '@/store/settings.store';
import api from '@/utils/api';

export default function Footer() {
  const { settings } = useSettingsStore();
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post('/newsletter/subscribe', { email });
      setStatusMsg('Thank you for subscribing to Velora.');
      setEmail('');
    } catch (err) {
      setStatusMsg('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="bg-luxury-charcoal text-gray-400 border-t border-gold/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div>
            <span className="font-outfit text-2xl font-extrabold tracking-widest text-gold block mb-6">
              {settings?.websiteName || 'VELORA'}
            </span>
            <p className="text-sm leading-relaxed mb-6 font-light">
              Crafting premium architectural jewelry that tells a story of elegance and meticulous geometry.
            </p>
            <div className="flex space-x-4">
              <a href={settings?.socialLinks?.facebook || '#'} className="hover:text-gold transition-colors"><Facebook size={18} /></a>
              <a href={settings?.socialLinks?.instagram || '#'} className="hover:text-gold transition-colors"><Instagram size={18} /></a>
              <a href={settings?.socialLinks?.twitter || '#'} className="hover:text-gold transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-gold transition-colors"><Compass size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-outfit text-sm font-semibold text-white uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-gold transition-colors font-light">Shop All</Link></li>
              <li><Link to="/shop?category=bracelets" className="hover:text-gold transition-colors font-light">Bracelets Collection</Link></li>
              <li><Link to="/shop?category=rings" className="hover:text-gold transition-colors font-light">Rings Collection</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors font-light">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors font-light">Get in Touch</Link></li>
              <li><Link to="/admin/dashboard" className="text-gold/80 hover:text-gold transition-colors font-semibold text-xs border border-gold/30 rounded px-2.5 py-0.5 inline-block mt-1">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-outfit text-sm font-semibold text-white uppercase tracking-wider mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm font-light">
              <li className="flex items-start">
                <MapPin className="text-gold mr-3 shrink-0" size={18} />
                <span>{settings?.address || '742 Luxury Boulevard, Fashion District, NY 10001'}</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-gold mr-3 shrink-0" size={18} />
                <span>{settings?.phone || '+1 (800) 809-9834'}</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-gold mr-3 shrink-0" size={18} />
                <span>{settings?.email || 'concierge@veloraboutique.com'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-outfit text-sm font-semibold text-white uppercase tracking-wider mb-6">Newsletter</h4>
            <p className="text-sm leading-relaxed mb-4 font-light">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            {/* suppressHydrationWarning: browser autofill/form-filler extensions
               inject a "fdprocessedid" attribute on inputs/buttons right after
               load, before React hydrates -- this is not caused by our code,
               so we suppress the resulting (harmless) console warning here. */}
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <div className="flex border-b border-gold/40 focus-within:border-gold">
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning
                  className="bg-transparent text-sm w-full py-2 focus:outline-none text-white font-light"
                  required
                />
                <button type="submit" suppressHydrationWarning className="text-gold hover:text-gold-light uppercase text-xs font-semibold tracking-wider px-2">
                  Join
                </button>
              </div>
              {statusMsg && <p className="text-xs text-gold font-light">{statusMsg}</p>}
            </form>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-gold/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-light">
          <p>&copy; {new Date().getFullYear()} VELORA. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Shipping & Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}