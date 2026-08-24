FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if any are needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies list
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source files
COPY . .

# Run model preparation/training script to generate hybrid_food_model.pkl & gru_demand_model.h5
RUN python setup_models.py

EXPOSE 5002

# Run the Flask app
CMD ["python", "ai_services/app.py"]
