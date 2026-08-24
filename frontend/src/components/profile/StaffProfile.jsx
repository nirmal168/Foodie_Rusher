import React, { useState, useEffect, useRef } from 'react';
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

  const [currentCoords, setCurrentCoords] = useState([23.0298, 72.5333]);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef(null);

  const restaurantCoords = [23.0298, 72.5333];
  const customerCoords = [23.0350, 72.5293];

  useEffect(() => {
    return () => {
      if (simIntervalId) clearInterval(simIntervalId);
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [simIntervalId, watchId]);

  // Leaflet map initialization
  useEffect(() => {
    if (!isLive || !mapContainerRef.current) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        pathRef.current = null;
      }
      return;
    }

    if (mapRef.current) return;

    if (typeof window.L === 'undefined') return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: restaurantCoords,
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const createCustomIcon = (color, svgPath) => {
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; width: 38px; height: 38px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;">${svgPath}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });
    };

    const restaurantIcon = createCustomIcon('#E23744', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><circle cx="12" cy="16" r="3"/><path d="M9 16v6h6v-6"/></svg>');
    const customerIcon = createCustomIcon('#3B82F6', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M11.5 9.5 14 12"/><path d="M22 2v3h-3l-9 9"/><path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>');

    L.marker(restaurantCoords, { icon: restaurantIcon }).addTo(map).bindPopup("<b>Restaurant</b>");
    L.marker(customerCoords, { icon: customerIcon }).addTo(map).bindPopup("<b>Customer</b>");

    mapRef.current = map;
  }, [isLive]);

  // Leaflet map live coordinates update
  useEffect(() => {
    if (!mapRef.current) return;
    const L = window.L;

    if (!markerRef.current) {
      const bikeIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: #10B981; width: 42px; height: 42px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; color: white; animation: pulse 2s infinite;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h1a2 2 0 0 1 2 2v2"/><path d="M12 17.5V14H7.5L4 9"/><path d="m13 6-4 7h6l-3.5 4.5"/></svg></div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });
      markerRef.current = L.marker(currentCoords, { icon: bikeIcon }).addTo(mapRef.current).bindPopup("<b>Your Current Position</b>").openPopup();
    } else {
      markerRef.current.setLatLng(currentCoords);
    }

    if (pathRef.current) {
      pathRef.current.setLatLngs([restaurantCoords, currentCoords, customerCoords]);
    } else {
      pathRef.current = L.polyline([restaurantCoords, currentCoords, customerCoords], {
        color: '#E23744',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(mapRef.current);
    }

    const bounds = L.latLngBounds([restaurantCoords, currentCoords, customerCoords]);
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [currentCoords]);

  const startTracking = (orderId) => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords([latitude, longitude]);
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
    setCurrentCoords([route[0].lat, route[0].lng]);
    updateLocation(route[0].lat, route[0].lng, orderId);

    const interval = setInterval(() => {
      step++;
      if (step < route.length) {
        setCurrentCoords([route[step].lat, route[step].lng]);
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
      await axios.post(`/api/orders/${orderId}/pickup`, {}, {
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
      await axios.post(`/api/orders/${orderId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Delivery Completed!');
      refresh();
    } catch (err) { toast.error('Failed to complete delivery'); }
  };

  const handleShare = (order) => {
    const text = `I'm delivering your order #${order._id.slice(-6)} from FoodieRusher! Track me here: ${window.location.origin}/profile`;
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
              {isLive && activeTrackingOrderId === order._id && (
                <div className="mt-6 h-[280px] w-full rounded-3xl overflow-hidden border border-slate-100 shadow-inner relative z-10">
                  <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffProfile;

