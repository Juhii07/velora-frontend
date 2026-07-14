import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import api from '@/utils/api';

function ResetPasswordContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setMsg('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (err: any) {
      setMsg(err.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">
            New Password
          </h1>
          <p className="text-xs text-gray-400 font-light">Type your new secure password below</p>
          <div className="w-8 h-0.5 bg-gold mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              placeholder="Repeat password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Resetting Password...' : 'Save Password'}
          </button>
          
          {msg && <p className="text-xs text-gold text-center">{msg}</p>}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Reset Form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
