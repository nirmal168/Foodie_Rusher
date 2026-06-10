import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.DataFrame({
    "time":[8,13,20,22,9,14],
    "budget":[100,250,300,180,120,220],
    "weather":[1,0,1,0,1,0],
    "festival":[0,1,0,1,0,1],
    "food":["Burger","Pizza","Biryani","Pizza","Burger","Biryani"]
})
X = df[["time","budget","weather","festival"]]
y = df["food"]

model = RandomForestClassifier(n_estimators=100)
model.fit(X,y)
joblib.dump(model,"hybrid_food_model.pkl")
print("Hybrid recommendation model ready")
