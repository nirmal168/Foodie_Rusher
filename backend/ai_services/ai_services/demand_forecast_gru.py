import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import GRU, Dense

series = np.array([100,120,130,180,220,260,240,280,320,350])
X,y=[],[]
for i in range(4,len(series)):
    X.append(series[i-4:i])
    y.append(series[i])

X=np.array(X).reshape(-1,4,1)
y=np.array(y)

model=Sequential()
model.add(GRU(64, input_shape=(4,1)))
model.add(Dense(1))
model.compile(optimizer="adam", loss="mse")
model.fit(X,y,epochs=50,verbose=0)
model.save("gru_demand_model.h5")
print("GRU saved")
