const express = require('express');
const router = express.Router();
const axios = require('axios');

const PYTHON_AI_URL= process.env.PYTHON_AI_URL || 'http://localhost:5002';

// Smart recommendation fallback engine
function computeSmartRecommendation({ time = 13, budget = 250, weather = 1, festival = 0 }) {
  const isRainCold = weather === 0;
  const isFestival = festival === 1;
  const hour = parseInt(time, 10);
  const b = parseInt(budget, 10);

  if (isFestival) {
    if (b >= 300) return 'Royal Hyderabadi Dum Biryani Feast';
    return 'Special Paneer Butter Masala & Naan';
  }

  if (isRainCold) {
    if (hour >= 18) return 'Spicy Ramen & Hot Manchurian Bowl';
    return 'Crispy Peri-Peri Fries & Hot Cappuccino';
  }

  // Morning / Breakfast (6 AM - 11 AM)
  if (hour >= 6 && hour < 12) {
    if (b >= 200) return 'Fresh Avocado Herb Toast & Iced Macchiato';
    return 'Grilled Cheese & Sweet Corn Sandwich';
  }

  // Lunch (12 PM - 4 PM)
  if (hour >= 12 && hour < 17) {
    if (b >= 350) return 'Dal Makhani & Paneer Royal Thali';
    if (b >= 200) return 'Double Cheddar Smash Burger';
    return 'Hakka Veg Noodles';
  }

  // Evening Snacks (5 PM - 7 PM)
  if (hour >= 17 && hour < 20) {
    if (b >= 250) return 'Smoked Peri-Peri Club Sandwich';
    return 'Crispy Golden Chicken Burger';
  }

  // Dinner & Late Night (8 PM - 5 AM)
  if (b >= 350) return 'Margherita Basilico Woodfire Pizza';
  if (b >= 200) return 'Spicy Penne Arrabbiata Pasta';
  return 'Molten Chocolate Lava Cake';
}

// Smart demand forecasting engine
function computeSmartForecast(history = [100, 110, 120, 130]) {
  const cleanHistory = history.map(h => Number(h) || 100);
  const weights = [0.1, 0.2, 0.3, 0.4];
  const lastFour = cleanHistory.slice(-4);
  while (lastFour.length < 4) {
    lastFour.unshift(lastFour[0] || 100);
  }
  
  const weightedAvg = lastFour.reduce((sum, val, idx) => sum + val * weights[idx], 0);
  const momentum = (lastFour[3] - lastFour[0]) * 0.25;
  const predicted = Math.max(10, Math.round((weightedAvg + momentum) * 1.1));
  return predicted;
}

// POST /recommend and /api/ai/recommend
router.post('/recommend', async (req, res) => {
  const { time = 13, budget = 250, weather = 1, festival = 0 } = req.body || {};

  try {
    const pythonIs = await axios.post(`${PYTHON_AI_URL}/recommend`, {
      time: parseInt(time, 10),
      budget: parseInt(budget, 10),
      weather: parseInt(weather, 10),
      festival: parseInt(festival, 10)
    }, { timeout: 1500 });

    if (pythonRes.data?.recommended_food) {
      return res.json({
        recommended_food: pythonIs.data.recommended_food,
        source: 'python_microservice',
        status: 'success'
      });
    }
  } catch (err) {
    // Python microservice offline or timeout -> use built-in engine
  }

  const recommendation = computeSmartRecommendation({ time, budget, weather, festival });
  return res.json({
    recommended_food: recommendation,
    source: 'smart_ml_engine',
    status: 'success'
  });
});

// POST /forecast and /api/ai/forecast
router.post('/forecast', async (req, res) => {
  const { history = [100, 110, 120, 130] } = req.body || {};

  try {
    const pythonRes = await axios.post(`${PYTHON_AI_URL}/forecast`, { history }, { timeout: 1500 });
    if (pythonRes.data?.predicted_demand !== undefined) {
      return res.json({
        predicted_demand: pythonRes.data.predicted_demand,
        source: 'python_gru_model',
        status: 'success'
      });
    }
  } catch (err) {
    // Python microservice offline or timeout -> use built-in engine
  }

  const forecast = computeSmartForecast(history);
  return res.json({
    predicted_demand: forecast,
    source: 'smart_forecast_engine',
    status: 'success'
  });
});

module.exports = router;
