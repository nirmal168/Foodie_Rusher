import React from 'react';
import { Star, Clock, ShoppingCart, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

const FoodCard = ({ item, onAddToCart, onRemoveFromCart, cartQuantity = 0 }) => {
  const [imgSrc, setImgSrc] = React.useState(item.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop');

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden hover:shadow-zomato transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-100 p-2"
    >
      <div className="relative h-48 rounded-xl overflow-hidden mb-3">
        <img
          src={imgSrc}
          alt={item.name}
          onError={() => setImgSrc('https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.discount && (
          <div className="absolute bottom-3 left-0 bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {item.discount}% OFF
          </div>
        )}
        <div className="absolute bottom-3 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-800">
          {item.time || '25'} min
        </div>
      </div>

      <div className="px-1 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-slate-800 truncate flex-1">
            {item.name}
          </h3>
          <div className="bg-green-700 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
            <span className="text-[11px] font-bold">{item.rating || '4.2'}</span>
            <Star size={10} className="fill-current" />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-slate-500 text-xs truncate max-w-[150px]">
            {item.description || 'North Indian, Chinese'}
          </p>
          <p className="text-slate-500 text-xs font-medium">
            ₹{item.price} for one
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <Clock size={12} className="text-slate-400" />
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Fast Delivery</span>
          </div>

          <div className="flex items-center">
            {cartQuantity > 0 ? (
              <div className="flex items-center bg-primary-50 rounded-lg p-1 gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFromCart(item); }}
                  className="w-6 h-6 flex items-center justify-center text-primary-500 hover:bg-primary-100 rounded transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-primary-600 text-xs min-w-[12px] text-center">{cartQuantity}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                  className="w-6 h-6 flex items-center justify-center text-primary-500 hover:bg-primary-100 rounded transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                className="bg-white text-primary-500 border border-primary-500 px-4 py-1.5 rounded-xl font-black text-[12px] hover:bg-primary-500 hover:text-white transition-all uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95"
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;

