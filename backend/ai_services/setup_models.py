import os
import subprocess
import sys

def setup():
    # Target directory is backend/ai_services/ai_services/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(script_dir, "ai_services")

    # Model file paths
    recommendation_model = os.path.join(target_dir, "hybrid_food_model.pkl")
    demand_model = os.path.join(target_dir, "gru_demand_model.h5")

    # Generate recommendation model if missing
    if not os.path.exists(recommendation_model):
        print("Training hybrid food recommendation model...")
        try:
            subprocess.run([sys.executable, "hybrid_recommendation.py"], cwd=target_dir, check=True)
            print("Successfully created hybrid_food_model.pkl")
        except Exception as e:
            print(f"Error training recommendation model: {e}")
    else:
        print("hybrid_food_model.pkl already exists.")

    # Generate GRU demand model if missing
    if not os.path.exists(demand_model):
        try:
            # Check if tensorflow is installed
            import tensorflow
            print("Training GRU demand forecasting model...")
            subprocess.run([sys.executable, "demand_forecast_gru.py"], cwd=target_dir, check=True)
            print("Successfully created gru_demand_model.h5")
        except ImportError:
            print("INFO: TensorFlow is not installed. Skipping GRU model training (app will use heuristic fallback).")
        except Exception as e:
            print(f"Error training GRU demand model: {e}")
    else:
        print("gru_demand_model.h5 already exists.")

if __name__ == "__main__":
    setup()
