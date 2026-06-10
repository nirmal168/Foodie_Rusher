import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShoppingBag, Clock } from 'lucide-react';

const CustomerProfile = ({ orders, refresh }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">My Orders</h2>
          <p className="text-slate-500 font-medium">Track and manage your delicious journeys</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Total Orders</p>
              <p className="text-xl font-black">{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Order ID</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Items</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Total</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-bold text-slate-900">#{order._id.slice(-6)}</td>
                  <td className="p-6 text-sm text-slate-600 font-medium">
                    {order.items.map(item => `${item.quantity || 1}x ${item.name}`).join(', ')}
                  </td>
                  <td className="p-6 font-black text-primary-500">₹{order.total}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'out-for-delivery' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => navigate(`/tracking?orderId=${order._id}`)}
                      className="bg-[#E23744] hover:bg-[#C52B34] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-100 border border-[#E23744]"
                    >
                      Track Order
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <ShoppingBag size={32} />
                      </div>
                      <p className="font-bold">No orders found. Ready to satisfy your cravings?</p>
                      <button onClick={() => navigate('/menu')} className="text-primary-500 font-black uppercase text-xs hover:underline mt-2">Explore Menu</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

