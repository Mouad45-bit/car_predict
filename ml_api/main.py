# ml_api/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path
from scipy.sparse import csr_matrix, hstack

app = FastAPI(title="Car Price ML API")

# Charger l'artifact
ARTIFACT_PATH = Path(__file__).with_name("linear_simple.joblib")
artifact = joblib.load(ARTIFACT_PATH)

# Structure venant de ton Colab
# artifact = {"model": lin_model, "scaler": scaler_simple, "ohe": ohe, "num_cols": [...], "cat_cols": [...]}
model = artifact.get("model")
scaler = artifact.get("scaler")
ohe = artifact.get("ohe")
num_cols = artifact.get("num_cols")
cat_cols = artifact.get("cat_cols")

if model is None or scaler is None or ohe is None or num_cols is None or cat_cols is None:
    raise RuntimeError(
        "Artifact invalide. Clés attendues: model, scaler, ohe, num_cols, cat_cols."
    )


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
    return {
        "ok": True,
        "artifact_path": str(ARTIFACT_PATH),
        "num_cols": list(num_cols),
        "cat_cols": list(cat_cols),
    }


@app.post("/predict")
def predict(req: PredictRequest):
    try:
        # 1) DataFrame 1 ligne
        X = pd.DataFrame([req.model_dump()])

        # 2) Vérifier présence des colonnes attendues
        missing = [c for c in (list(num_cols) + list(cat_cols)) if c not in X.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Champs manquants: {missing}",
            )

        # 3) scaler sur numériques (dense)
        X_num = scaler.transform(X[num_cols])

        # 4) onehot sur catégorielles (sparse)
        X_cat = ohe.transform(X[cat_cols])

        # 5) concat (num dense -> sparse)
        X_final = hstack([csr_matrix(X_num), X_cat]).tocsr()

        # 6) predict
        pred = float(model.predict(X_final)[0])
        return {"price": pred}

    except HTTPException:
        raise
    except Exception as e:
        # Erreur claire côté API (au lieu d’un 500 sans info)
        raise HTTPException(status_code=500, detail=f"Predict failed: {type(e).__name__}: {e}")