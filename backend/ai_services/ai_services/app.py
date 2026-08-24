from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import numpy as np
import os

# Suppress TF messages for cleaner logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = Flask(__name__)
CORS(app)

# Get absolute path to the directory containing this script
script_dir = os.path.dirname(os.path.abspath(__file__))
recommendation_model_path = os.path.join(script_dir, "hybrid_food_model.pkl")
demand_model_path = os.path.join(script_dir, "gru_demand_model.h5")

# Attempt to load models at startup
try:
    rf_model = joblib.load(recommendation_model_path)
    print("SUCCESS: Hybrid Recommendation Model loaded successfully.")
except Exception as e:
    print("ERROR loading hybrid model:", e)
    rf_model = None

try:
    from tensorflow.keras.models import load_model
    gru_model = load_model(demand_model_path)
    print("SUCCESS: GRU Demand Forecasting Model loaded successfully.")
except Exception as e:
    print("ERROR loading gru model:", e)
    gru_model = None

@app.route('/recommend', methods=['POST'])
def recommend():
    if not rf_model:
        return jsonify({"error": "Recommendation model not available"}), 500
    
    data = request.json
    try:
        input_data = pd.DataFrame([{
            "time": data.get('time', 12),
            "budget": data.get('budget', 200),
            "weather": data.get('weather', 1),
            "festival": data.get('festival', 0)
        }])
        
        prediction = rf_model.predict(input_data)[0]
        return jsonify({"recommended_food": prediction, "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json
    try:
        history = data.get('history', [100, 100, 100, 100])
        if len(history) < 4:
            history = ([history[0] if history else 100] * (4 - len(history))) + history
        history = history[-4:]
        
        if gru_model:
            X = np.array(history).reshape(-1, 4, 1)
            prediction = gru_model.predict(X, verbose=0)
            predicted_value = max(0, int(prediction[0][0]))
        else:
            # Fallback heuristic if TensorFlow fails to load on host machine
            weights = [0.1, 0.2, 0.3, 0.4]
            predicted_value = int(sum(h * w for h, w in zip(history, weights)) * 1.1)
            
        return jsonify({
            "predicted_demand": predicted_value, 
            "status": "success",
            "model_used": "gru" if gru_model else "heuristic_fallback"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5002))
    print(f"Starting AI Microservice on port {port}", flush=True)
    app.run(host="0.0.0.0", port=port, debug=False)
