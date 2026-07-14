import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '@/utils/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/customers');
      setCustomers(res.data.data);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleBlock = async (id: string, isVerified: boolean) => {
    const actionText = isVerified ? 'block' : 'unblock/verify';
    if (!confirm(`Are you sure you want to ${actionText} this client account?`)) return;

    try {
      await api.put(`/admin/customers/${id}/block`);
      setCustomers(prev =>
        prev.map(c =>
          c._id === id ? { ...c, isVerified: !c.isVerified } : c
        )
      );
      alert(`Client account successfully ${isVerified ? 'blocked' : 'unblocked/verified'}.`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle client account status');
    }
  };

  // Filter clients
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(search.toLowerCase()) || 
      customer.email?.toLowerCase().includes(search.toLowerCase()) ||
      customer.addresses?.some((a: any) => a.mobileNumber?.includes(search));
      
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Verified' && customer.isVerified) ||
      (statusFilter === 'Blocked' && !customer.isVerified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">Clients Registry</h1>
          <p className="text-xs text-gray-400 font-light mt-0.5">Overview of registered client accounts, profile states, and login mobile numbers</p>
        </div>
        <button
          onClick={fetchCustomers}
          className="p-2 border border-gold/20 text-gold hover:bg-gold hover:text-white rounded transition-all inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
        >
          <RefreshCw size={14} /> Reload Registry
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-gold/10 p-4 rounded-lg text-xs font-semibold">
        <div className="w-full sm:w-1/3 relative flex items-center">
          <input
            type="text"
            placeholder="Search by Name, Email, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold pl-9 pr-3 py-2.5 rounded focus:outline-none"
          />
          <Search size={14} className="absolute left-3 text-gray-400" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Verified', 'Blocked'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded uppercase tracking-wider text-[10px] font-bold border transition-all ${
                statusFilter === status
                  ? 'bg-gold border-gold text-white shadow-sm'
                  : 'bg-white border-gold/10 text-gray-400 hover:border-gold hover:text-gold'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 font-light text-xs">Accessing clients registry ledger...</div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/10 uppercase font-bold text-gray-400 bg-luxury-sand/15">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Login Email</th>
                  <th className="px-6 py-4">Mobile Numbers</th>
                  <th className="px-6 py-4">Registration Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filteredCustomers.map((c) => {
                  const mobileNumbers = c.addresses?.map((a: any) => a.mobileNumber).filter(Boolean) || [];
                  const uniqueMobiles = Array.from(new Set(mobileNumbers));
                  
                  return (
                    <tr key={c._id} className="hover:bg-luxury-sand/5 font-medium text-luxury-charcoal">
                      <td className="px-6 py-4 font-bold">{c.name}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono">{c.email}</td>
                      <td className="px-6 py-4">
                        {uniqueMobiles.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {uniqueMobiles.map((num: any, index) => (
                              <span key={index} className="bg-luxury-sand text-[10px] px-2 py-0.5 rounded w-fit font-semibold">{num}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-light italic">No phone saved</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          c.isVerified ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {c.isVerified ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                          {c.isVerified ? 'Verified' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleBlock(c._id, c.isVerified)}
                          className={`text-[10px] font-bold uppercase border px-2.5 py-1 rounded transition-colors ${
                            c.isVerified 
                              ? 'border-red-200 text-red-500 hover:bg-red-50' 
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {c.isVerified ? 'Block Account' : 'Activate/Verify'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400 font-light text-sm space-y-2 flex flex-col items-center">
            <AlertCircle size={24} className="text-gray-300" />
            <span>No client profiles found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
