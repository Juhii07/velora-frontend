import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Star } from 'lucide-react';
import api from '@/utils/api';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data.data);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, status: 'Approved' | 'Rejected') => {
    setBusyId(id);
    try {
      await api.put(`/admin/reviews/${id}/status`, { status });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      alert('Failed to update review status');
    }
    setBusyId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    setBusyId(id);
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete review');
    }
    setBusyId(null);
  };

  const filteredReviews = filter === 'All' ? reviews : reviews.filter(r => r.status === filter);

  const statusStyles: Record<string, string> = {
    Approved: 'text-green-700 bg-green-50',
    Pending: 'text-amber-700 bg-amber-50',
    Rejected: 'text-red-700 bg-red-50',
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">
          Review Moderation
        </h1>
        <p className="text-xs text-gray-400 font-light mt-0.5">Approve, reject, or remove customer reviews</p>
      </div>

      {/* Filter tabs - horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all ${
              filter === f
                ? 'bg-luxury-charcoal text-white border-luxury-charcoal'
                : 'bg-white text-gray-500 border-gold/15 hover:border-gold/40'
            }`}
          >
            {f} {f !== 'All' && `(${reviews.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-16 text-center text-gray-400 font-light text-xs bg-white border border-gold/10 rounded-lg">
          Loading reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-16 text-center text-gray-400 font-light text-sm bg-white border border-gold/10 rounded-lg">
          No {filter !== 'All' ? filter.toLowerCase() : ''} reviews found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-gold/10 rounded-lg p-4 sm:p-5 space-y-3"
            >
              {/* Top row: product + status */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-luxury-charcoal truncate">
                    {r.product?.name || 'Product removed'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">
                    by {r.name} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[r.status]}`}>
                  {r.status}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= r.rating ? 'fill-gold text-gold' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                {r.comment}
              </p>

              {/* Actions - stack on mobile, row on larger screens */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gold/5">
                <button
                  onClick={() => handleStatusChange(r._id, 'Approved')}
                  disabled={busyId === r._id || r.status === 'Approved'}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-[10px] font-bold uppercase tracking-wider rounded"
                >
                  <Check size={13} /> Approve
                </button>
                <button
                  onClick={() => handleStatusChange(r._id, 'Rejected')}
                  disabled={busyId === r._id || r.status === 'Rejected'}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-40 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded"
                >
                  <X size={13} /> Disable
                </button>
                <button
                  onClick={() => handleDelete(r._id)}
                  disabled={busyId === r._id}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 hover:bg-red-500 hover:text-white disabled:opacity-40 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}