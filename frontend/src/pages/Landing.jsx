import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, ShieldCheck, Zap, MapPin, Search, ChevronLeft, ChevronRight, Store, ArrowRight, Utensils, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from '../context/LocationContext';

const categoriesList = [
  { name: "All", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=200&auto=format&fit=crop" },
  { name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop" },
  { name: "Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop" },
  { name: "Beverages", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=200&auto=format&fit=crop" },
  { name: "Dessert", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=200&auto=format&fit=crop" },
  { name: "Chinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=200&auto=format&fit=crop" },
  { name: "Main Course", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop" },
  { name: "Sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=200&auto=format&fit=crop" },
  { name: "Pasta", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop" },
  { name: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&auto=format&fit=crop" }
];

const Landing = ({ onAddToCart, onRemoveFromCart, cart }) => {
  const { districts, selectedDistrict, setSelectedDistrict, areas, selectedArea, setSelectedArea } = useLocation();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Category-filtered suggested items
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [suggestedItems, setSuggestedItems] = useState([]);

  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const areaParam = selectedArea?.name ? `&area=${selectedArea.name}` : '';
        const res = await axios.get(`http://localhost:5001/api/shop/get-by-location?district=${selectedDistrict}${areaParam}`);
        setShops(res.data);
      } catch (err) {
        console.error("Error fetching shops by location:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [selectedDistrict, selectedArea]);

  useEffect(() => {
    if (shops?.length) {
      // Flatten items from all shops to show suggested food items
      const allItems = shops.flatMap(shop => 
        (shop.items || []).map(item => ({
          ...item,
          shopName: shop.name,
          shopId: shop._id
        }))
      );
      setSuggestedItems(allItems);
    } else {
      setSuggestedItems([]);
    }
  }, [shops]);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredItems = suggestedItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(i => i.id === itemId || i._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="pb-24 bg-[#fff9f6] min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative h-[480px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop" 
            alt="Food Delivery Hero" 
            className="w-full h-full object-cover brightness-75" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-4xl">
          <h1 className="text-white text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
            Foodie<span className="text-[#E23744]">Rusher</span>
          </h1>
          <p className="text-white text-lg md:text-xl font-bold mb-8 opacity-90">
            Order fresh meals from top-rated restaurants in <span className="text-[#ff5e6c] font-black">{selectedArea?.name || selectedDistrict || 'Gujarat'}</span>
          </p>
          
          <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto h-auto md:h-16 p-2 gap-2 border border-slate-100">
            <div className="flex items-center gap-3 px-4 border-r border-slate-100 py-3 md:py-0 w-full md:w-auto flex-1">
              <MapPin size={22} className="text-[#E23744] shrink-0" />
              <div className="text-left w-full">
                <p className="text-[9px] font-black uppercase text-slate-400">District / Area</p>
                <p className="text-sm font-black text-slate-900 truncate">
                  {selectedDistrict} - {selectedArea?.name || 'All Areas'}
                </p>
              </div>
            </div>
            <div className="flex items-center flex-1 gap-3 px-4 py-3 md:py-0 w-full md:w-auto">
              <Search size={22} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for restaurants, cuisines or dishes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm font-bold focus:outline-none w-full border-none focus:ring-0 text-slate-950 placeholder:text-slate-300" 
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        
        {/* District and Area Selectors */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-[#E23744] rounded-2xl flex items-center justify-center shadow-inner"><MapPin size={22}/></div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Set Delivery Location</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Filter restaurants by location</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">District</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)} 
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#E23744]"
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-1 md:flex-initial">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Area</label>
              <select 
                value={selectedArea?.name || ''} 
                onChange={(e) => setSelectedArea(areas.find(a => a.name === e.target.value))} 
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-[#E23744]"
              >
                {areas.map(a => <option key={a.name} value={a.name}>{a.name} ({a.pincode})</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Categories Slider Section (Inspiration for your first order) */}
        <section className="space-y-6">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
             <Utensils className="text-[#E23744]" /> Inspiration for your first order
          </h2>
          <div className="relative group">
            <button 
              onClick={() => scroll(cateScrollRef, 'left')} 
              className="absolute -left-5 top-12 z-20 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <div 
              ref={cateScrollRef} 
              className="flex overflow-x-auto gap-8 pb-4 no-scrollbar scroll-smooth"
            >
              {categoriesList.map((cat, idx) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="flex flex-col items-center gap-3 shrink-0 focus:outline-none group"
                  >
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 ${isSelected ? 'border-[#E23744] scale-105 shadow-xl shadow-red-100' : 'border-white shadow-md group-hover:scale-105'}`}>
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-[#E23744]' : 'text-slate-500 group-hover:text-slate-800'}`}>{cat.name}</span>
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => scroll(cateScrollRef, 'right')} 
              className="absolute -right-5 top-12 z-20 w-10 h-10 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Restaurant Directory Slider (Best Shops) */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
              <Store className="text-[#E23744]" /> 
              Best Restaurants in {selectedArea?.name || selectedDistrict}
            </h2>
            <span className="bg-red-50 text-[#E23744] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-inner">
              {filteredShops.length} Registered
            </span>
          </div>
          
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-[#E23744] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Searching kitchens...</p>
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="relative group">
              <button 
                onClick={() => scroll(shopScrollRef, 'left')} 
                className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>
              <div 
                ref={shopScrollRef} 
                className="flex overflow-x-auto gap-8 pb-6 no-scrollbar scroll-smooth"
              >
                {filteredShops.map((shop) => (
                  <motion.div
                    key={shop._id}
                    whileHover={{ y: -4 }}
                    className="w-80 shrink-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl shadow-slate-200/50 hover:shadow-slate-200/60 overflow-hidden transition-all duration-300 group flex flex-col cursor-pointer"
                    onClick={() => navigate(`/shop/${shop._id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={shop.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600'} 
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5 border border-white/50 shadow-lg">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter truncate">{shop.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">{shop.address}, {shop.city}</p>
                      </div>
                      
                      <div className="border-t border-slate-50 pt-4 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={16} />
                          <span className="text-xs font-black uppercase tracking-widest text-[10px]">25 Mins</span>
                        </div>
                        <div className="flex items-center gap-1 font-black text-xs uppercase tracking-widest text-[#E23744] group-hover:gap-2 transition-all">
                          <span>View Menu</span>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button 
                onClick={() => scroll(shopScrollRef, 'right')} 
                className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
              <Utensils className="text-slate-300 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No kitchens found</h3>
              <p className="text-slate-400 font-medium text-sm">We don't have active restaurants registered in this area yet. Try selecting another area/district above.</p>
            </div>
          )}
        </section>

        {/* Suggested Food Items Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
              <Utensils className="text-[#E23744]" /> Suggested Food Items
            </h2>
            <span className="bg-[#E23744]/10 text-[#E23744] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {filteredItems.length} Found
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredItems.map((item) => {
                const quantity = getItemQuantity(item._id);
                return (
                  <motion.div
                    key={item._id}
                    layout
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group relative"
                  >
                    {/* Item Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-50">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-md border border-white/50 flex items-center justify-center">
                        <span className={`w-3 h-3 rounded-full ${item.foodType === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} title={item.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#E23744] bg-red-50 px-2.5 py-1 rounded-full">{item.category}</span>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-2 truncate" title={item.name}>{item.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Store size={12} /> {item.shopName}</p>
                      </div>

                      {/* Bottom Info & CTA */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <span className="text-xl font-black text-slate-900">₹{item.price}</span>
                        
                        {quantity === 0 ? (
                          <button 
                            onClick={() => onAddToCart({ ...item, id: item._id })}
                            className="bg-white hover:bg-slate-50 text-[#E23744] border border-slate-200 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                          >
                             ADD <Plus size={14} />
                          </button>
                        ) : (
                          <div className="flex items-center bg-[#E23744] text-white rounded-xl shadow-md overflow-hidden border border-[#E23744]">
                             <button 
                               onClick={() => onRemoveFromCart({ id: item._id })}
                               className="px-3 py-2 hover:bg-[#C52B34] transition-colors"
                             >
                               <Minus size={12} className="font-black" />
                             </button>
                             <span className="px-2 font-black text-xs">{quantity}</span>
                             <button 
                               onClick={() => onAddToCart({ ...item, id: item._id })}
                               className="px-3 py-2 hover:bg-[#C52B34] transition-colors"
                             >
                               <Plus size={12} className="font-black" />
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
              <p className="font-bold uppercase tracking-widest text-xs">No food items found matching your filters/search.</p>
            </div>
          )}
        </section>

        {/* Brand Promise Trust Section */}
        <section className="py-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center px-8">
            <div className="space-y-4">
               <div className="w-16 h-16 bg-red-50 rounded-full shadow-inner flex items-center justify-center mx-auto text-[#E23744]">
                  <ShieldCheck size={32} />
               </div>
               <h3 className="text-xl font-bold uppercase tracking-tight">100% Safe Payments</h3>
               <p className="text-slate-400 text-sm font-medium">Encrypted connection for Razorpay checkout.</p>
            </div>
            <div className="space-y-4">
               <div className="w-16 h-16 bg-red-50 rounded-full shadow-inner flex items-center justify-center mx-auto text-[#E23744]">
                  <Zap size={32} />
               </div>
               <h3 className="text-xl font-bold uppercase tracking-tight">Fast Delivery Fleet</h3>
               <p className="text-slate-400 text-sm font-medium">Delivered to your doorstep in under 30 mins.</p>
            </div>
            <div className="space-y-4">
               <div className="w-16 h-16 bg-red-50 rounded-full shadow-inner flex items-center justify-center mx-auto text-[#E23744]">
                  <Clock size={32} />
               </div>
               <h3 className="text-xl font-bold uppercase tracking-tight">Live GPS Tracking</h3>
               <p className="text-slate-400 text-sm font-medium">Monitor your delivery rider in real-time.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;

