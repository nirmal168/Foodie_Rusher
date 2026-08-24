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

const curatedCategoryItems = [
  // Pizza
  {
    _id: "curated_pizza_1",
    name: "Margherita Basilico Pizza",
    category: "Pizza",
    price: 399,
    foodType: "veg",
    shopName: "Little Italy Kitchen",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_pizza_2",
    name: "Pepperoni Feast Pizza",
    category: "Pizza",
    price: 499,
    foodType: "non-veg",
    shopName: "Pizza Crust Co.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_pizza_3",
    name: "Farmhouse Veggie Supreme",
    category: "Pizza",
    price: 449,
    foodType: "veg",
    shopName: "Woodfire Pizzeria",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop"
  },
  // Burger
  {
    _id: "curated_burger_1",
    name: "Double Cheddar Smash Burger",
    category: "Burger",
    price: 199,
    foodType: "veg",
    shopName: "Burger Spot",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_burger_2",
    name: "Crispy Golden Chicken Burger",
    category: "Burger",
    price: 229,
    foodType: "non-veg",
    shopName: "The Grill House",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_burger_3",
    name: "Spicy Paneer Tikka Burger",
    category: "Burger",
    price: 179,
    foodType: "veg",
    shopName: "Burger Factory",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop"
  },
  // Beverages
  {
    _id: "curated_bev_1",
    name: "Iced Caramel Macchiato",
    category: "Beverages",
    price: 179,
    foodType: "veg",
    shopName: "Cafe Mocha",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_bev_2",
    name: "Fresh Mint Mojito Cooler",
    category: "Beverages",
    price: 129,
    foodType: "veg",
    shopName: "Juice Lounge",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_bev_3",
    name: "Belgian Dark Chocolate Shake",
    category: "Beverages",
    price: 199,
    foodType: "veg",
    shopName: "Shake Haven",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop"
  },
  // Dessert
  {
    _id: "curated_dessert_1",
    name: "Molten Chocolate Lava Cake",
    category: "Dessert",
    price: 149,
    foodType: "veg",
    shopName: "Sweet Cravings",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_dessert_2",
    name: "Classic New York Cheesecake",
    category: "Dessert",
    price: 249,
    foodType: "veg",
    shopName: "The Bakery Loft",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_dessert_3",
    name: "Warm Walnut Brownie Fudge",
    category: "Dessert",
    price: 169,
    foodType: "veg",
    shopName: "Choco Treats",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop"
  },
  // Chinese
  {
    _id: "curated_chinese_1",
    name: "Hakka Veg Noodles",
    category: "Chinese",
    price: 219,
    foodType: "veg",
    shopName: "Wok & Roll",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_chinese_2",
    name: "Crispy Manchurian Gravy Bowl",
    category: "Chinese",
    price: 239,
    foodType: "veg",
    shopName: "Dragon Bowl",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_chinese_3",
    name: "Fiery Schezwan Fried Rice",
    category: "Chinese",
    price: 229,
    foodType: "veg",
    shopName: "Golden Dragon",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800&auto=format&fit=crop"
  },
  // Main Course
  {
    _id: "curated_main_1",
    name: "Paneer Butter Masala & Naan",
    category: "Main Course",
    price: 329,
    foodType: "veg",
    shopName: "Royal Dhaba",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_main_2",
    name: "Dal Makhani Royal Thali",
    category: "Main Course",
    price: 279,
    foodType: "veg",
    shopName: "Punjab Express",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_main_3",
    name: "Aromatic Hyderabadi Dum Biryani",
    category: "Main Course",
    price: 349,
    foodType: "veg",
    shopName: "Biryani Mahal",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop"
  },
  // Sandwich
  {
    _id: "curated_sandwich_1",
    name: "Grilled Cheese & Sweet Corn",
    category: "Sandwich",
    price: 159,
    foodType: "veg",
    shopName: "Toast & Roast",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_sandwich_2",
    name: "Smoked Peri-Peri Club Sandwich",
    category: "Sandwich",
    price: 219,
    foodType: "non-veg",
    shopName: "Urban Club Sandwich",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_sandwich_3",
    name: "Fresh Avocado Herb Toast",
    category: "Sandwich",
    price: 239,
    foodType: "veg",
    shopName: "Healthy Bites",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop"
  },
  // Pasta
  {
    _id: "curated_pasta_1",
    name: "Creamy Alfredo Fettuccine",
    category: "Pasta",
    price: 299,
    foodType: "veg",
    shopName: "Pasta Fresca",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_pasta_2",
    name: "Spicy Penne Arrabbiata",
    category: "Pasta",
    price: 269,
    foodType: "veg",
    shopName: "Italiano Bistro",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_pasta_3",
    name: "Baked Four-Cheese Lasagna",
    category: "Pasta",
    price: 369,
    foodType: "veg",
    shopName: "Roma Ristorante",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=800&auto=format&fit=crop"
  },
  // Sides
  {
    _id: "curated_sides_1",
    name: "Peri-Peri Crinkle Fries",
    category: "Sides",
    price: 129,
    foodType: "veg",
    shopName: "Crispy Crunch",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_sides_2",
    name: "Cheesy Garlic Herb Bread",
    category: "Sides",
    price: 169,
    foodType: "veg",
    shopName: "Little Italy Kitchen",
    image: "https://images.unsplash.com/photo-1619881590738-a111d176d906?q=80&w=800&auto=format&fit=crop"
  },
  {
    _id: "curated_sides_3",
    name: "Crispy Golden Onion Rings",
    category: "Sides",
    price: 139,
    foodType: "veg",
    shopName: "Snack Shack",
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=800&auto=format&fit=crop"
  }
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
  const foodSectionRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    if (foodSectionRef.current) {
      foodSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const areaParam = selectedArea?.name ? `&area=${selectedArea.name}` : '';
        const res = await axios.get(`/api/shop/get-by-location?district=${selectedDistrict}${areaParam}`);
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
    // Combine real shop menu items with curated items for complete category coverage
    const liveItems = (shops || []).flatMap(shop => 
      (shop.items || []).map(item => ({
        ...item,
        shopName: shop.name,
        shopId: shop._id
      }))
    );

    const mergedItems = [...liveItems, ...curatedCategoryItems];
    setSuggestedItems(mergedItems);
  }, [shops]);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredItems = suggestedItems.filter(item => {
    const itemCat = (item.category || '').toLowerCase();
    const selCat = selectedCategory.toLowerCase();
    const matchesCategory = selCat === "all" || itemCat === selCat || (selCat === "dessert" && itemCat === "desserts") || (selCat === "burger" && itemCat === "burgers");
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
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
            <div className="flex-1 md:flex-initial min-w-[160px]">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">District</label>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:border-[#E23744] cursor-pointer shadow-sm"
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-1 md:flex-initial min-w-[180px]">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Area</label>
              <select 
                value={selectedArea?.name || ''} 
                onChange={(e) => setSelectedArea(areas.find(a => a.name === e.target.value))} 
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E23744]/20 focus:border-[#E23744] cursor-pointer shadow-sm"
              >
                {areas.length > 0 ? (
                  areas.map(a => <option key={a.name} value={a.name}>{a.name} ({a.pincode})</option>)
                ) : (
                  <option value="">All Areas</option>
                )}
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
                    onClick={() => handleCategorySelect(cat.name)}
                    className="flex flex-col items-center gap-3 shrink-0 focus:outline-none group cursor-pointer"
                  >
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 ${isSelected ? 'border-[#E23744] scale-110 shadow-xl shadow-red-200 ring-4 ring-[#E23744]/20' : 'border-white shadow-md group-hover:scale-105 group-hover:border-red-100'}`}>
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop'; }}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-[#E23744] font-black scale-105' : 'text-slate-500 group-hover:text-slate-800'}`}>{cat.name}</span>
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
                        src={shop.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop'} 
                        alt={shop.name}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop'; }}
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
        <section ref={foodSectionRef} className="space-y-6 pt-4 scroll-mt-28">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
                <Utensils className="text-[#E23744]" /> 
                {selectedCategory !== "All" ? `${selectedCategory} Specials` : "Suggested Food Items"}
              </h2>
              {selectedCategory !== "All" && (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Showing top rated {selectedCategory.toLowerCase()} options • Click "ALL" to reset
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedCategory !== "All" && (
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className="text-xs font-black uppercase tracking-widest text-[#E23744] hover:underline cursor-pointer"
                >
                  View All
                </button>
              )}
              <span className="bg-[#E23744]/10 text-[#E23744] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {filteredItems.length} Dishes
              </span>
            </div>
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
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'} 
                        alt={item.name} 
                        onError={(e) => { 
                          e.currentTarget.onerror = null; 
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'; 
                        }}
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

