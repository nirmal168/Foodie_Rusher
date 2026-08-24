import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, Heart } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import AIFoodRecommender from '../components/AIFoodRecommender';

const categories = ['All', 'Pizza', 'Burgers', 'Sushi', 'Desserts', 'Salads', 'Drinks'];

const allFoods = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 399, rating: '4.8', time: '20-25', discount: '10', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'Double Cheese Burger', category: 'Burgers', price: 199, rating: '4.7', time: '15-20', discount: '15', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'Spicy Ramen Bowl', category: 'Sushi', price: 299, rating: '4.9', time: '30-35', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'Fresh Avocado Toast', category: 'Salads', price: 249, rating: '4.6', time: '10-15', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop' },
  { id: 5, name: 'Pepperoni Paradise', category: 'Pizza', price: 499, rating: '4.8', time: '25-30', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop' },
  { id: 6, name: 'Crispy Chicken Burger', category: 'Burgers', price: 229, rating: '4.5', time: '15-20', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop' },
  { id: 7, name: 'Chocolate Lava Cake', category: 'Desserts', price: 149, rating: '5.0', time: '10-15', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop' },
  { id: 8, name: 'Iced Caramel Macchiato', category: 'Drinks', price: 179, rating: '4.7', time: '5-10', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop' },
];

const Menu = ({ onAddToCart, cart }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoods = allFoods.filter(food => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">OUR MENU</h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">
            Choose from a wide variety of cuisines and dishes crafted for every mood.
          </p>
        </div>

        {/* AI Recommendation Widget */}
        <AIFoodRecommender onRecommend={(dish) => {
          setSearchQuery(dish);
          setSelectedCategory('All');
        }} />

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          <div className="flex-1 flex items-center bg-white rounded-3xl p-2 shadow-xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center flex-1 px-4">
              <Search size={20} className="text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Find your favorite dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 py-3"
              />
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all hidden sm:block">
              Search
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
            {categories.map((category) => (
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
            ))}
          </div>
        </div>

        {/* Food Grid */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  item={food}
                  onAddToCart={onAddToCart}
                  cartQuantity={cart.find(c => c.id === food.id)?.quantity || 0}
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

export default Menu;

