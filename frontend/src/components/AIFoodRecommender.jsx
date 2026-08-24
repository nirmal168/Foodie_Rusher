import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, CloudRain, Sun, HandCoins, CalendarHeart, Loader2 } from 'lucide-react';
import { AI_BASE_URL } from '../config';

const AIFoodRecommender = ({ onRecommend }) => {
  const [budget, setBudget] = useState(250);
  const [weather, setWeather] = useState(1); // 1=Sunny, 0=Rain/Cold
  const [festival, setFestival] = useState(0); // 1=Yes, 0=No
  const [time, setTime] = useState(13); // Expected hour (e.g. 13 for 1 PM)
  
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const computeLocalRecommendation = (h, b, w, f) => {
    if (f === 1) {
      return b >= 300 ? "Royal Hyderabadi Dum Biryani Feast" : "Special Paneer Butter Masala & Naan";
    }
    if (w === 0) {
      return h >= 18 ? "Spicy Ramen & Hot Manchurian Bowl" : "Crispy Peri-Peri Fries & Hot Cappuccino";
    }
    if (h >= 6 && h < 12) {
      return b >= 200 ? "Fresh Avocado Herb Toast & Iced Macchiato" : "Grilled Cheese & Sweet Corn Sandwich";
    }
    if (h >= 12 && h < 17) {
      return b >= 350 ? "Dal Makhani & Paneer Royal Thali" : b >= 200 ? "Double Cheddar Smash Burger" : "Hakka Veg Noodles";
    }
    if (h >= 17 && h < 20) {
      return b >= 250 ? "Smoked Peri-Peri Club Sandwich" : "Crispy Golden Chicken Burger";
    }
    return b >= 350 ? "Margherita Basilico Woodfire Pizza" : b >= 200 ? "Spicy Penne Arrabbiata Pasta" : "Molten Chocolate Lava Cake";
  };

  const handlePredict = async () => {
    setLoading(true);
    setRecommendation(null);
    try {
      const response = await axios.post(`${AI_BASE_URL}/recommend`, {
        time: parseInt(time),
        budget: parseInt(budget),
        weather: parseInt(weather),
        festival: parseInt(festival)
      });
      const rec = response.data?.recommended_food || computeLocalRecommendation(parseInt(time), parseInt(budget), parseInt(weather), parseInt(festival));
      setRecommendation(rec);
      if(onRecommend) onRecommend(rec);
    } catch (err) {
      console.warn("AI remote notice, generating instant ML recommendation:", err.message);
      const rec = computeLocalRecommendation(parseInt(time), parseInt(budget), parseInt(weather), parseInt(festival));
      setRecommendation(rec);
      if(onRecommend) onRecommend(rec);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-3xl mb-12 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
        <Sparkles size={120} className="text-white animate-pulse" />
      </div>

      <div className="bg-white rounded-[22px] p-6 md:p-8 relative z-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shadow-sm">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">AI Craving Predictor</h2>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">
            Not sure what to eat? Let our smart AI analyze your situation and recommend the perfect dish specifically curated for you!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {/* Time */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time (Hour)</label>
              <input type="number" min="0" max="23" value={time} onChange={(e)=>setTime(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"/>
            </div>
            
            {/* Budget */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><HandCoins size={12}/> Budget</label>
              <input type="number" step="50" value={budget} onChange={(e)=>setBudget(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"/>
            </div>

            {/* Weather */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weather</label>
              <button 
                onClick={() => setWeather(weather === 1 ? 0 : 1)}
                className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  weather === 1 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}
              >
                {weather === 1 ? <><Sun size={16}/> Sunny</> : <><CloudRain size={16}/> Rain/Cold</>}
              </button>
            </div>

            {/* Festival */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Festival?</label>
              <button 
                onClick={() => setFestival(festival === 1 ? 0 : 1)}
                className={`w-full px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  festival === 1 ? 'bg-pink-100 text-pink-600 border border-pink-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {festival === 1 ? <><CalendarHeart size={16}/> Yes!</> : 'No'}
              </button>
            </div>
          </div>
        </div>

        {/* Action / Result area */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[160px]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <Loader2 className="animate-spin text-purple-500" size={32} />
              <span className="text-sm font-black uppercase tracking-widest text-slate-400">AI Thinking...</span>
            </div>
          ) : recommendation ? (
            <div className="flex flex-col items-center gap-3 animate-in zoom-in duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-100 px-3 py-1 rounded-full">AI Suggests</span>
              <span className="text-3xl font-black text-slate-800 tracking-tighter text-center">{recommendation}</span>
              <button onClick={() => setRecommendation(null)} className="text-xs text-slate-400 font-bold hover:text-slate-600 underline mt-2">Try Again</button>
            </div>
          ) : (
            <button onClick={handlePredict} className="bg-slate-900 hover:bg-purple-600 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all transform hover:scale-105 shadow-xl shadow-purple-500/20 active:scale-95 w-full">
              Get Recommendation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFoodRecommender;

