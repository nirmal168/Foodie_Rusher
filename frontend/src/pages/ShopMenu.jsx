import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Store, Utensils, ArrowLeft, Star, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import FoodCard from '../components/FoodCard';

const categories = ['All', 'Pizza', 'Burgers', 'Sushi', 'Desserts', 'Salads', 'Drinks', 'Snacks', 'Main Course', 'Sandwiches', 'South Indian', 'North Indian', 'Chinese', 'Fast Food', 'Others'];

const ShopMenu = ({ onAddToCart, cart }) => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5001/api/item/get-by-shop/${shopId}`);
        setShop(res.data.shop);
        setItems(res.data.items);
      } catch (err) {
        console.error("Error loading shop menu:", err);
        toast.error("Failed to load restaurant menu.");
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetails();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen pt-32 pb-24 text-center bg-slate-50">
        <div className="max-w-md mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Shop Not Found</h2>
          <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Go Home</button>
        </div>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Banner */}
      <div className="relative w-full h-80 md:h-[400px]">
        <img 
          src={shop.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600'} 
          alt={shop.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-7xl mx-auto w-full">
            <button
              onClick={() => navigate('/')}
              className="mb-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all border border-white/10 shadow-lg"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-fit mb-4 shadow-lg shadow-red-500/20">
              <Store size={14} />
              <span>Partner Restaurant</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">{shop.name}</h1>
            <div className="flex flex-wrap items-center gap-6 mt-4 text-white/80 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-red-500" />
                {shop.address}, {shop.city}
              </span>
              <span className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                4.8 Rating
              </span>
              <span className="flex items-center gap-2">
                <Clock size={18} className="text-green-500" />
                25-30 Mins Delivery
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          <div className="flex-1 flex items-center bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center flex-1 px-4">
              <Search size={20} className="text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Find a dish in this menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 py-3"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
            {categories.map((category) => {
              // Filter to show only categories that exist in the menu to prevent cluttering
              const hasItems = items.some(item => item.category === category);
              if (category !== 'All' && !hasItems) return null;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                      : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="mb-8 flex items-center gap-3">
          <Utensils className="text-red-500" size={24} />
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Food Menu</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <FoodCard
                  key={item._id}
                  item={{
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    rating: item.rating?.average ? item.rating.average.toFixed(1) : '0.0',
                    category: item.category,
                    time: '25-30',
                    foodType: item.foodType,
                    shop: item.shop
                  }}
                  onAddToCart={onAddToCart}
                  cartQuantity={cart.find(c => c.id === item._id)?.quantity || 0}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block p-8 bg-white rounded-[3rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">No dishes found!</h3>
                  <p className="text-slate-400 font-medium">Try searching for something else or browse categories.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopMenu;

