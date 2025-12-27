from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import joblib
import numpy as np

app = FastAPI(title="Virus DNA Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
model = joblib.load(BASE_DIR / "virus_model.pkl")
vectorizer = joblib.load(BASE_DIR / "virus_vectorizer.pkl")
meta = joblib.load(BASE_DIR / "meta.pkl")

LABEL_COL = meta["label_col"]
MIN_LEN = meta["min_len"]
MAX_LEN = meta["max_len"]

class PredictReq(BaseModel):
    sequence: str
    top_k: int = 5
    min_prob: float = 0.05

def clean(seq: str) -> str:
    s = seq.replace(" ", "").replace("\n", "").upper()
    s = "".join([c for c in s if c in "ATCGN"])
    if len(s) < MIN_LEN:
        raise ValueError(f"Sequence trop courte (min {MIN_LEN}).")
    return s[:MAX_LEN]

@app.get("/")
def root():
    return {"status": "ok", "service": "Virus DNA Classifier"}

@app.post("/predict")
def predict(req: PredictReq):
    try:
        seq = clean(req.sequence)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    X = vectorizer.transform([seq])
    proba = model.predict_proba(X)[0]
    classes = model.classes_

    idx = np.argsort(proba)[::-1][:req.top_k]
    best_label = classes[idx[0]]
    best_prob = float(proba[idx[0]])

    result = {
        "label_type": LABEL_COL,
        "prediction": best_label,
        "prob": best_prob,
        "top_k": [{"label": classes[i], "prob": float(proba[i])} for i in idx]
    }

    if best_prob < req.min_prob:
        result["prediction"] = "unknown"
        result["reason"] = "low_confidence"

    return result
