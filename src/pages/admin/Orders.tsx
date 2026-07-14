import React, { useState, useEffect } from 'react';
import { ClipboardList, Check, RefreshCw, Eye, AlertCircle, X } from 'lucide-react';
import api from '@/utils/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data);
    } catch (err) {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: nextStatus });
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId
            ? { ...o, orderStatus: nextStatus, isDelivered: nextStatus === 'Delivered', deliveredAt: nextStatus === 'Delivered' ? new Date().toISOString() : o.deliveredAt }
            : o
        )
      );
      alert(`Order status updated to ${nextStatus}`);
    } catch (err: any) {
      alert(err.error || 'Failed to update order status');
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    const matchesSearch = 
      order._id.toLowerCase().includes(search.toLowerCase()) || 
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold font-outfit uppercase tracking-widest text-luxury-charcoal">Orders Registry</h1>
          <p className="text-xs text-gray-400 font-light mt-0.5">Track actual client transactions, checkouts, and process deliveries</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 border border-gold/20 text-gold hover:bg-gold hover:text-white rounded transition-all inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
        >
          <RefreshCw size={14} /> Reload Registry
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-gold/10 p-4 rounded-lg text-xs font-semibold">
        <div className="w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by Order ID or Client Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-luxury-sand/30 border border-gold/10 focus:border-gold px-3 py-2.5 rounded focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
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

      {/* Orders Table */}
      <div className="bg-white border border-gold/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-gray-400 font-light text-xs">Accessing orders ledger...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/10 uppercase font-bold text-gray-400 bg-luxury-sand/15">
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Total Price</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Edit Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-luxury-sand/5 font-medium text-luxury-charcoal">
                    <td className="px-6 py-4 space-y-1">
                      <span className="font-bold text-gold block">#{o._id.substring(o._id.length - 8)}</span>
                      <span className="text-[10px] text-gray-400 block max-w-xs truncate">
                        {o.orderItems?.map((item: any) => `${item.name} (${item.quantity}x)`).join(', ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold block">{o.user?.name || 'Guest Buyer'}</span>
                      <span className="text-[10px] text-gray-400 block">{o.user?.email || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-luxury-sand text-[10px] font-bold rounded">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-outfit font-bold text-luxury-charcoal">
                      ₹{o.pricingDetails?.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        o.orderStatus === 'Delivered'
                          ? 'text-green-700 bg-green-50'
                          : o.orderStatus === 'Cancelled'
                          ? 'text-red-700 bg-red-50'
                          : o.orderStatus === 'Shipped'
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-yellow-700 bg-yellow-50'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="bg-white border border-gold/10 focus:border-gold px-2.5 py-1 rounded text-[10px] font-bold focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 border border-gold/20 text-gold hover:bg-gold hover:text-white rounded transition-all inline-flex"
                        title="View Full Details"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400 font-light text-sm space-y-2 flex flex-col items-center">
            <AlertCircle size={24} className="text-gray-300" />
            <span>No actual client orders match the filters.</span>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gold/20 max-w-2xl w-full rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="bg-luxury-charcoal text-white p-5 flex justify-between items-center border-b border-gold/20">
              <div>
                <h3 className="font-outfit text-sm font-extrabold uppercase tracking-widest text-gold">Order Details</h3>
                <span className="text-[10px] text-gray-400 font-light block mt-0.5">Order ID: #{selectedOrder._id}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
              
              {/* Customer Details & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-outfit font-bold uppercase tracking-wider text-gray-400 border-b border-gold/10 pb-1.5">Client Profile</h4>
                  <p><strong className="text-luxury-charcoal">Name:</strong> {selectedOrder.user?.name || 'Guest Buyer'}</p>
                  <p><strong className="text-luxury-charcoal">Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><strong className="text-luxury-charcoal">Mobile Number:</strong> {selectedOrder.shippingAddress?.mobileNumber || 'N/A'}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-outfit font-bold uppercase tracking-wider text-gray-400 border-b border-gold/10 pb-1.5">Shipping Address</h4>
                  <p><strong className="text-luxury-charcoal">Recipient:</strong> {selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                  <p><strong className="text-luxury-charcoal">Address:</strong> {selectedOrder.shippingAddress?.addressLine || 'N/A'}</p>
                  <p><strong className="text-luxury-charcoal">City/State/Zip:</strong> {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                </div>
              </div>
              
              {/* Order Status & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-luxury-sand/10 p-4 rounded border border-gold/5">
                <div className="space-y-1.5">
                  <h5 className="font-semibold uppercase text-gray-500">Payment Status</h5>
                  <p><strong className="text-luxury-charcoal">Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong className="text-luxury-charcoal">Status:</strong> {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}</p>
                  {selectedOrder.paidAt && <p><strong className="text-luxury-charcoal">Paid At:</strong> {new Date(selectedOrder.paidAt).toLocaleString()}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <h5 className="font-semibold uppercase text-gray-500">Fulfillment Status</h5>
                  <p><strong className="text-luxury-charcoal">Order Status:</strong> {selectedOrder.orderStatus}</p>
                  <p><strong className="text-luxury-charcoal">Delivered:</strong> {selectedOrder.isDelivered ? 'Yes' : 'No'}</p>
                  {selectedOrder.deliveredAt && <p><strong className="text-luxury-charcoal">Delivered At:</strong> {new Date(selectedOrder.deliveredAt).toLocaleString()}</p>}
                </div>
              </div>
              
              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-outfit font-bold uppercase tracking-wider text-gray-400 border-b border-gold/10 pb-1.5">Order Items</h4>
                <div className="divide-y divide-gold/5">
                  {selectedOrder.orderItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded bg-luxury-sand" />
                        )}
                        <div>
                          <span className="font-bold text-luxury-charcoal block">{item.name}</span>
                          <span className="text-[10px] text-gray-400">Qty: {item.quantity} x ₹{item.price}</span>
                        </div>
                      </div>
                      <span className="font-bold font-outfit">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pricing breakdown */}
              <div className="border-t border-gold/10 pt-4 flex flex-col items-end gap-1 text-xs">
                <div className="flex justify-between w-48 text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-outfit font-semibold">₹{selectedOrder.pricingDetails?.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.pricingDetails?.discount > 0 && (
                  <div className="flex justify-between w-48 text-red-600">
                    <span>Discount:</span>
                    <span className="font-outfit font-semibold">-₹{selectedOrder.pricingDetails?.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 text-gray-500">
                  <span>Shipping:</span>
                  <span className="font-outfit font-semibold">₹{selectedOrder.pricingDetails?.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 font-bold border-t border-gold/10 pt-2 text-luxury-charcoal">
                  <span>Total Paid:</span>
                  <span className="font-outfit text-gold">₹{selectedOrder.pricingDetails?.total.toFixed(2)}</span>
                </div>
              </div>
              
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gold/10">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gold/20 hover:border-gold rounded font-outfit text-xs font-bold uppercase tracking-wider text-luxury-charcoal transition-colors bg-white"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
