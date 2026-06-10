import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { MapPin, ShoppingBag, Star, Clock, Bike, Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import ForgetPassword from './pages/ForgetPassword';
import ShopMenu from './pages/ShopMenu';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import AIChatAssistant from './components/AIChatAssistant';
import HelpdeskAssistant from './components/HelpdeskAssistant';
import { LocationProvider } from './context/LocationContext';

const RoleBasedRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && (user.role === 'owner' || user.role === 'staff')) {
    return <Navigate to="/profile" />;
  }
  return children;
};

const CustomerOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'customer') {
    return <Navigate to="/profile" />;
  }
  return children;
};

const Dashboard = () => {
  return <Navigate to="/profile" />;
};

const TrackingView = () => {
  const { socket, joinOrder } = useSocket();
  const [location, setLocation] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const pathRef = React.useRef(null);

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId") || "active_order_id";

  // Ahmedabad Satellite coordinate (Restaurant Default)
  const restaurantCoords = [23.0298, 72.5333];
  // Ahmedabad Vastrapur coordinate (Customer Default)
  const customerCoords = [23.0350, 72.5293];

  // Fetch order details to display on panel
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || orderId === "active_order_id") {
        setLoadingOrder(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/profile/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const order = res.data.find(o => o._id === orderId);
        if (order) setOrderDetails(order);
      } catch (err) {
        console.error("Error loading order details:", err);
      } finally {
        setLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (joinOrder && orderId) {
      joinOrder(orderId);
    }
    if (socket) {
      socket.on("delivery-tracking", (data) => {
        setLocation(data);
        toast.success("Delivery partner location updated!", { icon: '🛵', id: 'tracking-toast' });
      });
    }
    return () => socket?.off("delivery-tracking");
  }, [socket, joinOrder, orderId]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    // Use global L (Leaflet)
    if (typeof window.L === 'undefined') {
      console.error("Leaflet is not loaded from CDN");
      return;
    }

    const L = window.L;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: restaurantCoords,
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Custom Icons using SVG
    const createCustomIcon = (color, svgPath) => {
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${color}; width: 44px; height: 44px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white;">${svgPath}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
    };

    // Icons
    const restaurantIcon = createCustomIcon('#E23744', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><circle cx="12" cy="16" r="3"/><path d="M9 16v6h6v-6"/></svg>');
    const customerIcon = createCustomIcon('#3B82F6', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M11.5 9.5 14 12"/><path d="M22 2v3h-3l-9 9"/><path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/></svg>');

    // Add static markers
    L.marker(restaurantCoords, { icon: restaurantIcon }).addTo(map).bindPopup("<b>Kitchen (Restaurant)</b><br>Preparing delicious food.");
    L.marker(customerCoords, { icon: customerIcon }).addTo(map).bindPopup("<b>Your Delivery Point</b><br>Yummy food heading here.");

    mapRef.current = map;
  }, []);

  // Update Live Marker and Polyline
  useEffect(() => {
    if (!mapRef.current) return;
    const L = window.L;

    const currentPartnerCoords = location ? [location.lat, location.lng] : restaurantCoords;

    if (!markerRef.current) {
      const bikeIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: #10B981; width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 15px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; color: white; animation: pulse 2s infinite;"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h1a2 2 0 0 1 2 2v2"/><path d="M12 17.5V14H7.5L4 9"/><path d="m13 6-4 7h6l-3.5 4.5"/></svg></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      markerRef.current = L.marker(currentPartnerCoords, { icon: bikeIcon }).addTo(mapRef.current).bindPopup("<b>Delivery Partner</b><br>On the way to you!").openPopup();
    } else {
      markerRef.current.setLatLng(currentPartnerCoords);
    }

    // Draw route path line (Restaurant -> Partner -> Customer)
    if (pathRef.current) {
      pathRef.current.setLatLngs([restaurantCoords, currentPartnerCoords, customerCoords]);
    } else {
      pathRef.current = L.polyline([restaurantCoords, currentPartnerCoords, customerCoords], {
        color: '#E23744',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(mapRef.current);
    }

    // Fit map bounds slightly to display the route path
    const bounds = L.latLngBounds([restaurantCoords, currentPartnerCoords, customerCoords]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50] });

  }, [location]);

  return (
    <div className="pt-28 pb-16 min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col md:flex-row gap-6 container-max px-4">
      {/* Map Column */}
      <div className="flex-grow min-h-[450px] md:min-h-0 relative rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50">
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />
        <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 shadow-lg">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          <span>Live Tracking Active</span>
        </div>
      </div>

      {/* Side Status Column */}
      <div className="w-full md:w-[420px] shrink-0 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Order Status</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">ID: #{orderId.slice(-6)}</p>
          </div>

          <hr className="border-slate-100" />

          {/* Stepper progress */}
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-sm shadow-md">✓</div>
                <div className="w-0.5 h-10 bg-green-500" />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-tight">Order Placed</p>
                <p className="text-xs text-slate-400 font-medium">Successfully created</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md ${
                  location || orderDetails?.status === 'out-for-delivery' || orderDetails?.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {location || orderDetails?.status === 'out-for-delivery' || orderDetails?.status === 'delivered' ? '✓' : '2'}
                </div>
                <div className={`w-0.5 h-10 ${
                  location || orderDetails?.status === 'out-for-delivery' || orderDetails?.status === 'delivered' ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-tight">Preparing Meal</p>
                <p className="text-xs text-slate-400 font-medium">Chef is working their magic</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md ${
                  orderDetails?.status === 'delivered' ? 'bg-green-500 text-white' :
                  location || orderDetails?.status === 'out-for-delivery' ? 'bg-[#E23744] text-white animate-bounce' : 'bg-slate-100 text-slate-400'
                }`}>
                  {orderDetails?.status === 'delivered' ? '✓' : '3'}
                </div>
                <div className={`w-0.5 h-10 ${
                  orderDetails?.status === 'delivered' ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-tight">Out for Delivery</p>
                <p className="text-xs text-slate-400 font-medium">Partner is on the way</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md ${
                  orderDetails?.status === 'delivered' ? 'bg-green-500 text-white shadow-green-100' : 'bg-slate-100 text-slate-400'
                }`}>4</div>
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-tight">Arrived</p>
                <p className="text-xs text-slate-400 font-medium">Enjoy your fresh meal!</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Partner Coordinates Display */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Live Coordinates</p>
            {location ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shadow-inner">
                  <Bike size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                  <p className="text-[10px] font-bold text-green-600 animate-pulse uppercase">Receiving real-time GPS signals</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <Clock size={20} />
                <p className="text-xs font-bold">Waiting for delivery partner to start journey...</p>
              </div>
            )}
          </div>

          {/* Order Item Details */}
          {orderDetails && (
            <div className="flex flex-col gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Items in Order</p>
              <div className="text-xs font-black text-slate-700 space-y-1">
                {orderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity || 1}x {it.name}</span>
                    <span>₹{it.price}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-slate-900 text-sm">
                  <span>Total Paid</span>
                  <span className="text-[#E23744]">₹{orderDetails.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const [cart, setCart] = useState([]);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (item) => {
    let preventAdd = false;
    setCart((prevCart) => {
      if (prevCart.length > 0) {
        const firstItem = prevCart[0];
        const newShopId = item.shopId || item.shop;
        const currentShopId = firstItem.shopId || firstItem.shop;
        
        if (newShopId && currentShopId && newShopId !== currentShopId) {
          preventAdd = true;
          return prevCart;
        }
      }
      
      const itemId = item.id || item._id;
      const existingItem = prevCart.find((i) => i.id === itemId);
      if (existingItem) {
        return prevCart.map((i) => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, id: itemId, quantity: 1 }];
    });
    
    if (preventAdd) {
      toast.error("You cannot add items from a different restaurant. Please clear your cart first!");
      return;
    }
    
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500" />
          <span className="font-bold text-sm text-slate-800">{item.name} added to cart!</span>
        </div>
        <div className="flex gap-2 justify-end mt-1">
          <button 
            className="bg-slate-100 text-slate-600 px-4 py-2 text-[10px] uppercase tracking-widest rounded-xl font-black hover:bg-slate-200 transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Add More
          </button>
          <button 
            className="bg-[#E23744] text-white px-4 py-2 text-[10px] uppercase tracking-widest rounded-xl font-black hover:bg-red-600 transition-colors shadow-sm"
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/cart');
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleRemoveFromCart = (item) => {
    setCart((prevCart) => {
      const itemId = item.id || item._id;
      const existingItem = prevCart.find((i) => i.id === itemId);
      if (existingItem.quantity === 1) return prevCart.filter((i) => i.id !== itemId);
      return prevCart.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Foodie Rusher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
       <Toaster position="bottom-right" />
       <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} />
       <main className="pt-24 flex-grow">
          <Routes>
            <Route path="/" element={<RoleBasedRedirect><Landing onAddToCart={handleAddToCart} onRemoveFromCart={handleRemoveFromCart} cart={cart} /></RoleBasedRedirect>} />
            <Route path="/menu" element={<CustomerOnlyRoute><Menu onAddToCart={handleAddToCart} cart={cart} /></CustomerOnlyRoute>} />
            <Route path="/shop/:shopId" element={<CustomerOnlyRoute><ShopMenu onAddToCart={handleAddToCart} cart={cart} /></CustomerOnlyRoute>} />
            <Route path="/cart" element={<CustomerOnlyRoute><Cart cart={cart} onAddToCart={handleAddToCart} onRemoveFromCart={handleRemoveFromCart} onClearCart={() => setCart([])} /></CustomerOnlyRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth defaultIsLogin={true} />} />
            <Route path="/signup" element={<Auth defaultIsLogin={false} />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tracking" element={<TrackingView />} />
          </Routes>
       </main>
       <AIChatAssistant onAddToCart={handleAddToCart} />
        <HelpdeskAssistant />
       <Footer />
    </div>
  );
}

function App() {
  return (
    <LocationProvider>
      <SocketProvider>
         <Router>
            <AppContent />
         </Router>
      </SocketProvider>
    </LocationProvider>
  );
}

export default App;


