import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { User as UserIcon, MapPin, ClipboardList, Trash2, Download } from 'lucide-react';
import api from '@/utils/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [profile, setProfile] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Add Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    mobileNumber: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.data);
    } catch (err) {}
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data);
    } catch (err) {}
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses', newAddr);
      setProfile({ ...profile, addresses: res.data.data });
      setIsAddingAddress(false);
      setNewAddr({ fullName: '', mobileNumber: '', addressLine: '', city: '', state: '', pincode: '' });
    } catch (err) {
      alert('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    try {
      const res = await api.delete(`/auth/addresses/${addrId}`);
      setProfile({ ...profile, addresses: res.data.data });
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  if (!profile) {
    return <div className="text-center py-20 font-light text-gray-500">Retrieving account data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold uppercase tracking-widest font-outfit text-luxury-charcoal mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="bg-white border border-gold/10 p-4 rounded-lg h-fit space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'profile' ? 'bg-gold text-white' : 'hover:bg-luxury-sand/50 text-luxury-charcoal'
            }`}
          >
            <UserIcon size={16} /> Profile Details
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'addresses' ? 'bg-gold text-white' : 'hover:bg-luxury-sand/50 text-luxury-charcoal'
            }`}
          >
            <MapPin size={16} /> Manage Addresses
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              activeTab === 'orders' ? 'bg-gold text-white' : 'hover:bg-luxury-sand/50 text-luxury-charcoal'
            }`}
          >
            <ClipboardList size={16} /> Order History
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="md:col-span-3">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
              <h3 className="font-outfit text-base font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
                Profile Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-light">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</span>
                  <span className="text-luxury-charcoal font-semibold">{profile.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                  <span className="text-luxury-charcoal font-semibold">{profile.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Role</span>
                  <span className="text-xs text-gold font-bold uppercase tracking-wider bg-gold/10 px-2.5 py-1 rounded-full w-fit block mt-1">
                    {profile.role}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Verified</span>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit block mt-1 ${
                    profile.isVerified ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                  }`}>
                    {profile.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
                <div className="flex justify-between items-center border-b border-gold/10 pb-3">
                  <h3 className="font-outfit text-base font-bold uppercase tracking-wider">
                    Saved Addresses
                  </h3>
                  <button
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="px-4 py-1.5 border border-gold text-gold text-xs font-bold uppercase tracking-wider rounded hover:bg-gold hover:text-white transition-colors"
                  >
                    {isAddingAddress ? 'Cancel' : 'Add Address'}
                  </button>
                </div>

                {/* Add Address Form */}
                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gold/15 p-4 rounded bg-luxury-sand/20">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="w-full text-xs bg-white border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={newAddr.mobileNumber}
                        onChange={(e) => setNewAddr({ ...newAddr, mobileNumber: e.target.value })}
                        className="w-full text-xs bg-white border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address Details</label>
                      <input
                        type="text"
                        value={newAddr.addressLine}
                        onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                        className="w-full text-xs bg-white border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">City</label>
                      <input
                        type="text"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full text-xs bg-white border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">State</label>
                      <input
                        type="text"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full text-xs bg-white border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pincode</label>
                      <input
                        type="text"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="w-full text-xs bg-white border border-gold/10 focus:border-gold px-3 py-2 rounded focus:outline-none"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full py-2 bg-gold hover:bg-gold-dark text-white font-outfit text-xs font-bold uppercase tracking-wider rounded"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div className="space-y-4">
                  {profile.addresses.length > 0 ? (
                    profile.addresses.map((addr: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-gold/10 p-4 rounded flex justify-between items-center text-xs font-light leading-relaxed"
                      >
                        <div>
                          <strong className="block text-sm font-semibold text-luxury-charcoal mb-1">{addr.fullName}</strong>
                          <p>{addr.addressLine}</p>
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-[10px] text-gray-400 mt-1">Mobile: {addr.mobileNumber}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 font-light text-sm italic">No addresses saved yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Order History */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gold/10 p-6 rounded-lg space-y-6">
              <h3 className="font-outfit text-base font-bold uppercase tracking-wider border-b border-gold/10 pb-3">
                My Orders
              </h3>

              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((ord: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-gold/10 rounded overflow-hidden text-xs"
                    >
                      {/* Order Header bar */}
                      <div className="bg-luxury-sand/30 px-4 py-3 flex flex-wrap justify-between items-center gap-3 border-b border-gold/10">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Order Placed</span>
                          <span className="font-semibold">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Total Value</span>
                          <span className="font-semibold text-gold">₹{ord.pricingDetails.total}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Status</span>
                          <span className={`font-bold uppercase tracking-wider ${
                            ord.orderStatus === 'Delivered' ? 'text-green-700' : ord.orderStatus === 'Cancelled' ? 'text-red-700' : 'text-amber-700'
                          }`}>{ord.orderStatus}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Payment</span>
                          <span className="font-bold text-luxury-charcoal uppercase tracking-wider">{ord.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Order Items Rows */}
                      <div className="p-4 space-y-3">
                        {ord.orderItems.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 truncate">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=100&auto=format&fit=crop'}
                                alt="thumb"
                                className="w-10 h-10 object-cover bg-luxury-sand rounded"
                              />
                              <span className="font-semibold truncate max-w-sm">{item.name} (x{item.quantity})</span>
                            </div>
                            <span className="font-semibold text-gray-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action footer */}
                      <div className="bg-luxury-sand/10 px-4 py-2 border-t border-gold/10 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">Order Ref: {ord._id}</span>
                        <a
                          href={`http://localhost:5000/api/orders/${ord._id}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 bg-luxury-sand hover:bg-gold hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider border border-gold/20 rounded"
                        >
                          <Download size={12} /> Invoice PDF
                        </a>
                      </div>

                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 font-light text-sm italic">You have not placed any orders yet.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
