import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, FolderOpen, Users, Star, Gift, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/utils/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));

    api.get('/admin/notifications')
      .then(res => setNotifications(res.data.data))
      .catch(() => {});
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {}
  };

  if (isLoading) {
    return <div className="text-center py-20 font-light text-gray-500">Compiling studio intelligence analytics...</div>;
  }

  if (!stats) {
    return <div className="text-center py-20 font-light text-red-500">Failed to load analytics.</div>;
  }

  return (
    <div className="space-y-10">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">Studio Intelligence</h1>
        <p className="text-xs text-gray-400 font-light mt-0.5">Overview of brand revenue and operations logs</p>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        
        <div className="bg-white border border-gold/10 p-6 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Revenue</span>
            <h3 className="text-2xl font-outfit font-bold text-luxury-charcoal">₹{stats.revenue.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        <Link
          to="/admin/orders"
          className="bg-white border border-gold/10 p-6 rounded-lg flex items-center justify-between hover-gold-glow transition-all cursor-pointer block"
        >
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Orders</span>
            <h3 className="text-2xl font-outfit font-bold text-luxury-charcoal">{stats.orders}</h3>
          </div>
          <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white border border-gold/10 p-6 rounded-lg flex items-center justify-between hover-gold-glow transition-all cursor-pointer block"
        >
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Orders Today</span>
            <h3 className="text-2xl font-outfit font-bold text-luxury-charcoal">{stats.ordersToday || 0}</h3>
            {(!stats.ordersToday || stats.ordersToday === 0) ? (
              <span className="text-[9px] text-gray-400 font-light block mt-0.5">No orders today yet</span>
            ) : (
              <span className="text-[9px] text-green-600 font-bold block mt-0.5">Active sales day!</span>
            )}
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            (!stats.ordersToday || stats.ordersToday === 0) ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-700'
          }`}>
            <ShoppingBag size={20} />
          </div>
        </Link>

        <div className="bg-white border border-gold/10 p-6 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Fine Products</span>
            <h3 className="text-2xl font-outfit font-bold text-luxury-charcoal">{stats.products}</h3>
          </div>
          <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
            <FolderOpen size={20} />
          </div>
        </div>

        <div className="bg-white border border-gold/10 p-6 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Registered Clients</span>
            <h3 className="text-2xl font-outfit font-bold text-luxury-charcoal">{stats.customers}</h3>
          </div>
          <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3 flex justify-between items-center">
            <span>System Notifications & Order Alerts</span>
            <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded border text-xs flex justify-between items-center transition-all ${
                  n.read ? 'border-gray-150 bg-gray-50/50 text-gray-400' : 'border-gold/20 bg-gold/5 text-luxury-charcoal font-semibold'
                }`}
              >
                <div>
                  <span className="font-bold block">{n.title}</span>
                  <span className="font-light block mt-0.5">{n.message}</span>
                  <span className="text-[9px] text-gray-400 block mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="text-[10px] font-bold uppercase text-gold hover:text-gold-dark border border-gold/25 px-2 py-1 rounded bg-white hover:bg-gold/5 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue graph (visual representation using HTML divs) */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg lg:col-span-2 space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Revenue Timeline (Last 7 Days)
          </h3>
          {stats.revenueGraph.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-4 pt-10 px-4">
              {stats.revenueGraph.map((item: any, idx: number) => {
                const maxVal = Math.max(...stats.revenueGraph.map((g: any) => g.revenue)) || 1;
                const pct = (item.revenue / maxVal) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[9px] font-bold text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.revenue}
                    </span>
                    <div
                      style={{ height: `${Math.max(pct, 5)}%` }}
                      className="w-full bg-gold hover:bg-gold-dark rounded-t transition-all duration-500"
                    />
                    <span className="text-[8px] text-gray-400 font-semibold uppercase">{item.date.split('-')[2]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 font-light text-xs">
              No sales data found for the past week.
            </div>
          )}
        </div>

        {/* Order status allocation */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Order Status Metrics
          </h3>
          <div className="space-y-4 text-xs font-semibold uppercase tracking-wider">
            {Object.entries(stats.orderStatusDistribution).map(([status, count]: any) => (
              <div key={status} className="flex justify-between items-center py-2 border-b border-gold/5 last:border-0">
                <span className="text-gray-400">{status}</span>
                <span className="px-2.5 py-1 bg-gold/10 text-gold rounded font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products Table */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Top Selling Masterpieces
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/10 uppercase font-bold text-gray-400">
                  <th className="py-2.5">Jewellery Name</th>
                  <th className="py-2.5 text-center">Quantity Sold</th>
                  <th className="py-2.5 text-right font-outfit">Revenue generated</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p: any, idx: number) => (
                  <tr key={idx} className="border-b border-gold/5 last:border-0 font-medium">
                    <td className="py-2.5 font-bold">{p.name}</td>
                    <td className="py-2.5 text-center">{p.quantity}</td>
                    <td className="py-2.5 text-right font-outfit text-gold font-bold">₹{p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Activity Log */}
        <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-4">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
            Operational Activity Logs
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {stats.recentActivities.map((act: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-xs leading-relaxed border-b border-gold/5 pb-2.5 last:border-0">
                <div className="w-6 h-6 bg-gold/15 text-gold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Activity size={12} />
                </div>
                <div className="truncate">
                  <strong className="text-luxury-charcoal block">{act.action}</strong>
                  <span className="text-gray-500 font-light block mt-0.5">{act.details}</span>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">
                    {new Date(act.createdAt).toLocaleString()} | By {act.user?.name || 'System'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
