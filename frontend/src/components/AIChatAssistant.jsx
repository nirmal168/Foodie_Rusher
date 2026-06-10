import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, ChefHat, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const allFoods = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 399, tags: ['pizza', 'cheese', 'veg', 'classic', 'italian'] },
  { id: 2, name: 'Double Cheese Burger', category: 'Burgers', price: 199, tags: ['burger', 'cheese', 'fast food', 'heavy'] },
  { id: 3, name: 'Spicy Ramen Bowl', category: 'Sushi', price: 299, tags: ['spicy', 'ramen', 'asian', 'noodles', 'hot'] },
  { id: 4, name: 'Fresh Avocado Toast', category: 'Salads', price: 249, tags: ['healthy', 'veg', 'avocado', 'breakfast', 'light'] },
  { id: 5, name: 'Pepperoni Paradise', category: 'Pizza', price: 499, tags: ['pizza', 'meat', 'pepperoni', 'italian'] },
  { id: 6, name: 'Crispy Chicken Burger', category: 'Burgers', price: 229, tags: ['burger', 'chicken', 'crispy', 'fast food'] },
  { id: 7, name: 'Chocolate Lava Cake', category: 'Desserts', price: 149, tags: ['dessert', 'chocolate', 'sweet', 'cake'] },
  { id: 8, name: 'Iced Caramel Macchiato', category: 'Drinks', price: 179, tags: ['drink', 'coffee', 'cold', 'sweet', 'caramel'] },
];

const AIChatAssistant = ({ onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Foodie AI Chef 🧑‍🍳. Craving something spicy? Sweet? Or just looking for the fastest delivery? Ask me!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { text: userQuery, isBot: false }]);
    setInput("");

    // Simulated AI Processing Delay
    setTimeout(() => {
      generateResponse(userQuery.toLowerCase());
    }, 600);
  };

  const generateResponse = (query) => {
    let response = "I couldn't quite catch that. Could you tell me if you're looking for pizza, burgers, something spicy, or sweet?";
    let recommendedFood = null;

    if (query.includes('spicy') || query.includes('hot')) {
      recommendedFood = allFoods.find(f => f.tags.includes('spicy'));
      response = `If you want to feel the heat 🔥, I highly recommend our ${recommendedFood.name}! It's packed with flavor.`;
    } else if (query.includes('sweet') || query.includes('dessert') || query.includes('cake')) {
      recommendedFood = allFoods.find(f => f.category === 'Desserts');
      response = `Treat yourself! Our ${recommendedFood.name} is incredibly popular right now 🍫.`;
    } else if (query.includes('pizza')) {
      recommendedFood = allFoods.find(f => f.category === 'Pizza');
      response = `You can never go wrong with a classic ${recommendedFood.name} 🍕. Fresh out of the oven!`;
    } else if (query.includes('burger')) {
      recommendedFood = allFoods.find(f => f.category === 'Burgers');
      response = `Craving a burger? Our beautifully stacked ${recommendedFood.name} is a crowd favorite 🍔.`;
    } else if (query.includes('healthy') || query.includes('veg') || query.includes('light')) {
      recommendedFood = allFoods.find(f => f.tags.includes('healthy'));
      response = `Looking for something light and fresh? Try the ${recommendedFood.name} 🥑.`;
    } else if (query.includes('drink') || query.includes('coffee') || query.includes('thirsty')) {
      recommendedFood = allFoods.find(f => f.category === 'Drinks');
      response = `Cool down with our refreshing ${recommendedFood.name} ☕.`;
    } else if (query.includes('cheap') || query.includes('affordable')) {
      recommendedFood = [...allFoods].sort((a,b) => a.price - b.price)[0];
      response = `On a budget? Our ${recommendedFood.name} is only ₹${recommendedFood.price} and super delicious!`;
    }

    setMessages(prev => [...prev, { 
      text: response, 
      isBot: true, 
      food: recommendedFood 
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-slate-900 justify-between p-4 flex items-center shadow-md">
              <div className="flex items-center gap-3 text-white">
                <div className="bg-primary-500 p-2 rounded-full">
                  <ChefHat size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Chef AI</h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Real-Time Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm font-medium leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none' 
                      : 'bg-primary-500 text-white shadow-md shadow-primary-200 rounded-tr-none'
                  }`}>
                    {msg.text}
                    
                    {msg.food && (
                      <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-slate-900 text-xs">{msg.food.name}</span>
                          <span className="font-black text-primary-500 text-xs">₹{msg.food.price}</span>
                        </div>
                        <button 
                          onClick={() => {
                            onAddToCart(msg.food);
                            toast.success(`Chef AI added ${msg.food.name} to cart!`);
                          }}
                          className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={12} /> Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tell me what you're craving..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4"
                />
                <button
                  onClick={handleSend}
                  className="bg-primary-500 text-white p-3 rounded-xl hover:bg-primary-600 transition-colors shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-400/50 relative group"
      >
        <Sparkles size={24} className={`absolute top-4 right-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity ${isOpen ? 'hidden' : ''}`} />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default AIChatAssistant;

