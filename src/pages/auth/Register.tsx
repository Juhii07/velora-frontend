import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import api from '@/utils/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user: userProfile, token } = res.data.data;
      setAuth(userProfile, token);
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.error || 'Registration failed. Please check input parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-gold/10 p-8 rounded-lg shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal">
            Register Account
          </h1>
          <p className="text-xs text-gray-400 font-light">Join the luxury world of Velora</p>
          <div className="w-8 h-0.5 bg-gold mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              placeholder="Eleanor Vance"
              required
            />
          </div>

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
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
          {errorMsg && <p className="text-xs text-red-600 text-center">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-green-700 text-center">{successMsg}</p>}
        </form>

        <div className="text-center text-xs font-light text-gray-500 border-t border-gold/10 pt-4">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-gold font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
