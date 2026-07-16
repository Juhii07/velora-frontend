import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settings.store';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import api from '@/utils/api';

export default function ContactPage() {
  const { settings } = useSettingsStore();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/contacts', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.error || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">
          Contact the Atelier
        </h1>
        <p className="text-sm font-light text-gray-500 max-w-md mx-auto">
          Our concierge team is available to assist you with order inquiries, sizing, or bespoke commissions.
        </p>
        <div className="w-12 h-0.5 bg-gold mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* Left Side: Contact Coordinates */}
        <div className="bg-white border border-gold/10 p-8 rounded-lg space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Concierge Services
          </h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Please feel free to connect via phone, email, or visit our atelier address. We strive to respond within 24 business hours.
          </p>

          <ul className="space-y-4 text-xs font-light leading-relaxed text-gray-600">
            <li className="flex items-start">
              <MapPin className="text-gold mr-3 shrink-0" size={18} />
              <div>
                <strong className="block text-luxury-charcoal font-semibold mb-0.5">Address</strong>
                Row house-2, Apna ghar society near kachigam checkpost, Vapi-396191
              </div>
            </li>
            <li className="flex items-center">
              <Phone className="text-gold mr-3 shrink-0" size={18} />
              <div>
                <strong className="block text-luxury-charcoal font-semibold mb-0.5">Concierge Phone</strong>
                +91 9336896144
              </div>
            </li>
            <li className="flex items-center">
              <Mail className="text-gold mr-3 shrink-0" size={18} />
              <div>
                <strong className="block text-luxury-charcoal font-semibold mb-0.5">Email Support</strong>
                velora1526@gmail.com
              </div>
            </li>
          </ul>
        </div>

        {/* Right Side: Message Submission Form */}
        <div className="bg-white border border-gold/10 p-8 rounded-lg">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-outfit text-sm font-bold uppercase tracking-wider">Message Received</h4>
              <p className="text-xs text-gray-500 font-light max-w-xs mx-auto leading-relaxed">
                Thank you for your enquiry. Our concierge representative will contact you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-4 py-2 border border-gold text-gold text-xs font-bold uppercase tracking-wider rounded"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3 mb-4">
                Leave a Message
              </h3>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="Eleanor Vance"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="eleanor@vance.com"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="Bespoke Pendant Commission"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                  placeholder="Describe your request..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Message...' : 'Submit Message'}
              </button>
              {errorMsg && <p className="text-xs text-red-600 text-center">{errorMsg}</p>}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}