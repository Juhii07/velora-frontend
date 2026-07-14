import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    setResetToken('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMsg(res.data.data.message || 'Reset link generated successfully.');
      if (res.data.data.token) {
        setResetToken(res.data.data.token);
      }
    } catch (err: any) {
      setMsg(err.error || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">
            Reset Password
          </h1>
          <p className="text-xs text-gray-400 font-light">Retrieve access to your Velora profile</p>
          <div className="w-8 h-0.5 bg-gold mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              placeholder="eleanor@vance.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Generating Link...' : 'Send Reset Link'}
          </button>
          
          {msg && <p className="text-xs text-gold text-center leading-relaxed">{msg}</p>}
          
          {resetToken && (
            <div className="border border-dashed border-gold/40 p-4 rounded bg-luxury-sand/20 space-y-2 text-center text-xs">
              <p className="text-gray-500 font-light">Simulated Token Reset link:</p>
              <Link
                to={`/auth/reset-password?token=${resetToken}`}
                className="font-bold text-gold hover:underline block"
              >
                Go to Reset Password Form
              </Link>
            </div>
          )}
        </form>

        <div className="text-center text-xs font-light text-gray-500 border-t border-gold/10 pt-4">
          Remember credentials?{' '}
          <Link to="/auth/login" className="text-gold font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
