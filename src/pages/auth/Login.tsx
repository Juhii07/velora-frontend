import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import api from '@/utils/api';

function LoginContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { user, setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If user already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, redirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userProfile, token } = res.data.data;
      setAuth(userProfile, token);
      navigate(redirect ? `/${redirect}` : '/');
    } catch (err: any) {
      setErrorMsg(err.error || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-400 font-light">Sign in to your premium Velora account</p>
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

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 font-outfit">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="text-right">
            <Link
              to="/auth/forgot-password"
              className="text-[10px] text-gold hover:text-gold-dark uppercase tracking-wider font-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          {errorMsg && <p className="text-xs text-red-600 text-center">{errorMsg}</p>}
        </form>

        {!redirect.includes('admin') && (
          <div className="text-center text-xs font-light text-gray-500 border-t border-gold/10 pt-4">
            New to Velora?{' '}
            <Link to="/auth/register" className="text-gold font-bold hover:underline">
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
