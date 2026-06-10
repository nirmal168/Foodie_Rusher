import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Navigation, Share2, MapPin, Play, Square, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const StaffProfile = ({ orders, refresh }) => {
  const { updateLocation } = useSocket();
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [simIntervalId, setSimIntervalId] = useState(null);

  useEffect(() => {
    return () => {
      if (simIntervalId) clearInterval(simIntervalId);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [simIntervalId, watchId]);

  const startTracking = (orderId) => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude, orderId);
        console.log(`Updated location for order ${orderId}: ${latitude}, ${longitude}`);
      },
      (err) => {
        console.error("GPS Error:", err);
        toast.error("Failed to get GPS location. Please check permissions.");
        stopTracking();
      },
      { enableHighAccuracy: true }
    );

    setWatchId(id);
    setIsLive(true);
    setActiveTrackingOrderId(orderId);
    toast.success("You are now LIVE! Customers can track you.");
  };

  const stopTracking = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    if (simIntervalId) clearInterval(simIntervalId);
    setSimIntervalId(null);
    setIsLive(false);
    setIsSimulating(false);
    setActiveTrackingOrderId(null);
    toast("Live Tracking Stopped", { icon: '🛑' });
  };

  const startSimulation = (orderId) => {
    setIsSimulating(true);
    setIsLive(true);
    setActiveTrackingOrderId(orderId);
    toast.success("Starting simulated route towards customer...");

    // Ahmedabad Satellite to Vastrapur route coordinates
    const route = [
      { lat: 23.0298, lng: 72.5333 },
      { lat: 23.0305, lng: 72.5325 },
      { lat: 23.0312, lng: 72.5318 },
      { lat: 23.0320, lng: 72.5310 },
      { lat: 23.0328, lng: 72.5305 },
      { lat: 23.0335, lng: 72.5300 },
      { lat: 23.0342, lng: 72.5296 },
      { lat: 23.0350, lng: 72.5293 }
    ];

    let step = 0;
    // Immediate first update
    updateLocation(route[0].lat, route[0].lng, orderId);

    const interval = setInterval(() => {
      step++;
      if (step < route.length) {
        updateLocation(route[step].lat, route[step].lng, orderId);
        console.log(`[Sim] Updated location: ${route[step].lat}, ${route[step].lng}`);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setIsLive(false);
        setActiveTrackingOrderId(null);
        toast.success("Simulation finished! Partner arrived at customer.");
      }
    }, 3000); // every 3 seconds

    setSimIntervalId(interval);
  };

  const stopSimulation = () => {
    if (simIntervalId) clearInterval(simIntervalId);
    setSimIntervalId(null);
    setIsSimulating(false);
    setIsLive(false);
    setActiveTrackingOrderId(null);
    toast("Simulation Stopped", { icon: '🛑' });
  };

  const handlePickup = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/orders/${orderId}/pickup`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Order Picked Up!');
      refresh();
    } catch (err) { toast.error('Failed to pickup order'); }
  };

  const handleComplete = async (orderId) => {
    if (isLive) stopTracking();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5001/api/orders/${orderId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Delivery Completed!');
      refresh();
    } catch (err) { toast.error('Failed to complete delivery'); }
  };

  const handleShare = (order) => {
    const text = `I'm delivering your order #${order._id.slice(-6)} from FoodieRusher! Track me here: http://localhost:5173/profile`;
    if (navigator.share) {
      navigator.share({ title: 'FoodieRusher Tracking', text: text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Tracking link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Staff Dashboard</h2>
          <p className="text-slate-500 font-medium tracking-tight">Manage your assigned deliveries and live status</p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full border border-red-100">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Live Tracking Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
            <Truck size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active assignments for today</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 group hover:border-[#E23744]/20 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-white bg-slate-900 px-3 py-1 rounded-full">#{order._id.slice(-6)}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'preparing' ? 'bg-amber-100 text-amber-600' :
                      order.status === 'out-for-delivery' ? 'bg-[#E23744] text-white shadow-lg' :
                      'bg-green-100 text-green-600'
                    }`}>{order.status.replace('-', ' ')}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{order.customerId?.name || 'Customer'}</h3>
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-2"><MapPin size={16} className="text-[#E23744]" /> {order.deliveryAddress}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleShare(order)} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-inner"><Share2 size={20}/></button>
                  
                  {order.status === 'preparing' && (
                    <button onClick={() => handlePickup(order._id)} className="bg-[#E23744] text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-100 flex items-center gap-2">
                       <Package size={18} /> Pickup Order
                    </button>
                  )}

                  {order.status === 'out-for-delivery' && (
                    <div className="flex flex-wrap gap-2">
                      {isSimulating && activeTrackingOrderId === order._id ? (
                        <button onClick={stopSimulation} className="bg-amber-600 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-amber-100 hover:scale-105 active:scale-95 transition-all"><Square size={16} /> Stop Sim</button>
                      ) : (
                        !isLive && (
                          <button onClick={() => startSimulation(order._id)} className="bg-indigo-600 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"><Navigation size={16} /> Simulate Route</button>
                        )
                      )}

                      {!isSimulating && (
                        activeTrackingOrderId === order._id ? (
                          <button onClick={stopTracking} className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl"><Square size={16} /> Stop Live</button>
                        ) : (
                          !isLive && (
                            <button onClick={() => startTracking(order._id)} className="bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"><Play size={16} /> Go Live</button>
                          )
                        )
                      )}

                      <button onClick={() => handleComplete(order._id)} className="bg-green-500 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-100 flex items-center gap-2">
                        <CheckCircle size={18} /> Complete Delivery
                      </button>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex items-center gap-2 text-green-500 font-black uppercase text-xs">
                      <CheckCircle size={20} /> Delivered Successfully
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffProfile;

