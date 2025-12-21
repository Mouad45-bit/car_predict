## ml_api/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="Car Price ML API")

artifact = joblib.load("car_price_model.joblib")
model = artifact["model"]
feature_names = artifact["feature_names"]

class PredictRequest(BaseModel):
    year: int
    odometer: float
    manufacturer_id: int
    fuel_id: int
    transmission_id: int
    type_id: int
    age_car: int

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/predict")
def predict(req: PredictRequest):
    X = pd.DataFrame([req.model_dump()])
    X = X.reindex(columns=feature_names)
    pred = float(model.predict(X)[0])
    return {"price": pred}