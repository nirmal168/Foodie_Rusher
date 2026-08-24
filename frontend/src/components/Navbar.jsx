import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShoppingCart, Search, MapPin, Menu as MenuIcon, X, Check, ShoppingBag, Home, MoreVertical, UtensilsCrossed, History, Compass } from 'lucide-react';
import { Link, useLocation as useRouteLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Navbar = ({ cartCount }) => {
  const { user, logout } = useAuth();
  const { districts, selectedDistrict, setSelectedDistrict } = useLocation();
  const { socket } = useSocket();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const moreMenuRef = useRef(null);
  const routeLocation = useRouteLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setShowMoreMenu(false);
    setShowNotifications(false);
  }, [routeLocation.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get('/api/notifications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setNotifications(res.data);
        } catch (err) { console.error(err); }
      };
      fetchNotifications();

      if (socket) {
        socket.emit("join-user", user.id || user._id);
        socket.on("new-notification", (notification) => {
          setNotifications(prev => [notification, ...prev]);
          toast.success(notification.title, { icon: '🔔' });
        });
      }
    }
    return () => socket?.off("new-notification");
  }, [user, socket]);

  const markAsRead = async () => {
    try {
      await axios.post('/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-transparent ${isScrolled ? 'shadow-lg border-slate-100 py-3' : 'py-4'}`}>
      <div className="container-max px-4">
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* Left: 3-Dots Quick Menu Button */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                showMoreMenu
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-[#E23744]'
              }`}
              title="Quick Navigation"
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[110] overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Navigation</p>
                  </div>
                  <div className="flex flex-col gap-1 py-1">
                    <Link
                      to="/"
                      onClick={() => setShowMoreMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-red-50 hover:text-[#E23744] transition-colors"
                    >
                      <Home size={16} />
                      <span>Home</span>
                    </Link>

                    {(!user || user.role === 'customer') && (
                      <Link
                        to="/menu"
                        onClick={() => setShowMoreMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-red-50 hover:text-[#E23744] transition-colors"
                      >
                        <UtensilsCrossed size={16} />
                        <span>Order Food</span>
                      </Link>
                    )}

                    {user && user.role === 'customer' && (
                      <Link
                        to="/profile"
                        onClick={() => setShowMoreMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-red-50 hover:text-[#E23744] transition-colors"
                      >
                        <History size={16} />
                        <span>Recent Orders</span>
                      </Link>
                    )}

                    {user && user.role === 'customer' && (
                      <Link
                        to="/tracking"
                        onClick={() => setShowMoreMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-red-50 hover:text-[#E23744] transition-colors"
                      >
                        <Compass size={16} />
                        <span>Live Tracking</span>
                      </Link>
                    )}

                    {(!user || user.role === 'customer') && (
                      <Link
                        to="/cart"
                        onClick={() => setShowMoreMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-red-50 hover:text-[#E23744] transition-colors"
                      >
                        <ShoppingCart size={16} />
                        <span>My Cart ({cartCount})</span>
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group whitespace-nowrap shrink-0">
            <span className="text-3xl font-black italic tracking-tighter text-slate-900 group-hover:text-[#E23744] transition-colors">
              Foodie<span className="text-[#E23744]">Rusher</span>
            </span>
          </Link>

          {/* District & Search */}
          <div className="hidden md:flex items-center flex-1 bg-slate-50 shadow-inner border border-slate-200 rounded-xl h-12 overflow-hidden px-4 gap-4 transition-all">
            <div className="flex items-center gap-2 border-r border-slate-300 pr-4 min-w-[180px] relative">
              <MapPin size={18} className="text-[#E23744] shrink-0" />
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-xs font-black text-slate-600 appearance-none pr-4 cursor-pointer uppercase tracking-widest"
              >
                {districts.map(d => <option key={d} value={d}>{d}, Gujarat</option>)}
              </select>
            </div>
            <div className="flex items-center flex-1 gap-2">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for restaurant, cuisine or a dish" 
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-slate-400 text-slate-800" 
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6 shrink-0 ml-auto">
            <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-[#E23744] font-black text-[10px] uppercase tracking-widest transition-all">
              <Home size={18} />
              <span>Home</span>
            </Link>

            {(!user || user.role === 'customer') && (
              <Link to="/menu" className="flex items-center gap-2 text-slate-600 hover:text-[#E23744] font-black text-[10px] uppercase tracking-widest transition-all">
                <UtensilsCrossed size={18} />
                <span>Menu</span>
              </Link>
            )}

            {user ? (
               <div className="flex items-center gap-5">
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) markAsRead(); }} 
                      className="text-slate-600 hover:text-[#E23744] transition-colors relative"
                    >
                      <Bell size={24} />
                      {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-[#E23744] text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                    </button>
                    <AnimatePresence>
                      {showNotifications && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
                          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h4>
                            <span className="text-[10px] bg-[#E23744] text-white px-2 py-0.5 rounded-full font-black">{notifications.length}</span>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No new alerts</div>
                            ) : (
                              notifications.map(n => (
                                <div key={n._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-red-50/50' : ''}`}>
                                  <h5 className="text-xs font-black text-slate-900">{n.title}</h5>
                                  <p className="text-[10px] font-bold text-slate-500 mt-1">{n.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col items-end mr-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{user.role}</span>
                    <span className="text-sm font-black text-slate-900">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/profile" className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                      {user.role === 'customer' ? 'My Profile' : 'Dashboard'}
                    </Link>
                    <button onClick={() => { logout(); toast.success("Logged out successfully"); navigate('/'); }} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#E23744] transition-all shadow-md cursor-pointer">
                      Logout
                    </button>
                  </div>
               </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-slate-500 hover:text-slate-900 text-xs font-black uppercase tracking-widest transition-colors">Log in</Link>
                    <Link to="/signup" className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#E23744] transition-all shadow-lg active:scale-95">Sign up</Link>
                </div>
            )}
            
            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="relative text-slate-600 hover:text-[#E23744] transition-all">
                <div className="relative">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#E23744] text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4 ml-auto">
            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="relative text-slate-600">
                 <ShoppingCart size={24} />
                 {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#E23744] text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">!</span>}
              </Link>
            )}
            <button className="text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 top-[60px] bg-white z-40 md:hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin size={20} className="text-[#E23744]" />
                <span className="font-bold text-slate-800 uppercase text-xs tracking-widest">{selectedDistrict}, Gujarat</span>
              </div>
              <hr />
               {user ? (
                <>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase text-slate-900">Home</Link>
                  {user.role === 'customer' && (
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase text-slate-900">My Orders</Link>
                  )}
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase text-slate-900">Dashboard</Link>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }} className="block text-xl font-black uppercase text-[#E23744]">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase text-slate-900">Home</Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase text-slate-900">Log In</Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block text-xl font-black uppercase text-slate-900">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

