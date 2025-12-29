from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
from sqlalchemy import select, desc
import os, json
import joblib
import numpy as np

# ===== Eureka =====
import py_eureka_client.eureka_client as eureka_client

# ===== DB (SQLAlchemy) =====
from sqlalchemy import create_engine, String, Float, DateTime, Integer, Text
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Mapped, mapped_column
from urllib.parse import quote_plus

# ---------------------------
# Config
# ---------------------------
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://localhost:8761/eureka")
APP_NAME = os.getenv("APP_NAME", "AI-CLASSIFIER")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))

pwd = quote_plus(os.getenv("DB_PASSWORD", "sih@m2002"))
db_user = os.getenv("DB_USER", "postgres")
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "5432")
db_name = os.getenv("DB_NAME", "algobio_ai")
DATABASE_URL = f"postgresql+psycopg2://{db_user}:{pwd}@{db_host}:{db_port}/{db_name}"

# ---------------------------
# SQLAlchemy setup
# ---------------------------
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

class Classification(Base):
    __tablename__ = "classifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sequence: Mapped[str] = mapped_column(Text, nullable=False)
    label_type: Mapped[str] = mapped_column(String(50), nullable=False)
    prediction: Mapped[str] = mapped_column(String(200), nullable=False)
    prob: Mapped[float] = mapped_column(Float, nullable=False)
    top_k_json: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

# ---------------------------
# FastAPI
# ---------------------------
app = FastAPI(title="Virus DNA Classifier (with DB)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    Base.metadata.create_all(bind=engine)

    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=APP_NAME,
        instance_host=HOST,
        instance_port=PORT,
        health_check_url=f"http://{HOST}:{PORT}/health",
        status_page_url=f"http://{HOST}:{PORT}/",
        home_page_url=f"http://{HOST}:{PORT}/",
    )

@app.on_event("shutdown")
def on_shutdown():
    try:
        eureka_client.stop()
    except Exception:
        pass

# ===== Load model =====
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
    save: bool = True

def clean(seq: str) -> str:
    s = seq.replace(" ", "").replace("\n", "").upper()
    s = "".join([c for c in s if c in "ATCGN"])
    if len(s) < MIN_LEN:
        raise ValueError(f"Sequence trop courte (min {MIN_LEN}).")
    return s[:MAX_LEN]

@app.get("/health")
def health():
    return {"status": "UP", "service": APP_NAME}

@app.get("/")
def root():
    return {"status": "ok", "service": "Virus DNA Classifier (with DB)"}

@app.post("/predict")
def predict_endpoint(req: PredictReq):
    return predict(req)




@app.get("/classifications")
def list_classifications(limit: int = 50):
    db = SessionLocal()
    try:
        rows = db.execute(
            select(Classification).order_by(desc(Classification.id)).limit(limit)
        ).scalars().all()

        return [
            {
                "id": r.id,
                "sequence": r.sequence,
                "label_type": r.label_type,
                "prediction": r.prediction,
                "prob": r.prob,
                "top_k": json.loads(r.top_k_json),
                "reason": r.reason,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]
    finally:
        db.close()


@app.get("/classifications/{id}")
def get_classification(id: int):
    db = SessionLocal()
    try:
        r = db.get(Classification, id)
        if not r:
            raise HTTPException(status_code=404, detail="Not found")

        return {
            "id": r.id,
            "sequence": r.sequence,
            "label_type": r.label_type,
            "prediction": r.prediction,
            "prob": r.prob,
            "top_k": json.loads(r.top_k_json),
            "reason": r.reason,
            "created_at": r.created_at.isoformat(),
        }
    finally:
        db.close()

def predict(req: PredictReq):
    try:
        seq = clean(req.sequence)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    X = vectorizer.transform([seq])
    proba = model.predict_proba(X)[0]
    classes = model.classes_

    idx = np.argsort(proba)[::-1][:req.top_k]
    best_label = str(classes[idx[0]])
    best_prob = float(proba[idx[0]])

    top_k = [{"label": str(classes[i]), "prob": float(proba[i])} for i in idx]

    result = {"label_type": LABEL_COL, "prediction": best_label, "prob": best_prob, "top_k": top_k}

    if best_prob < req.min_prob:
        result["prediction"] = "unknown"
        result["reason"] = "low_confidence"

    saved_id = None
    if req.save:
        db = SessionLocal()
        try:
            row = Classification(
                sequence=seq,
                label_type=result["label_type"],
                prediction=result["prediction"],
                prob=float(result["prob"]),
                top_k_json=json.dumps(result["top_k"]),
                reason=result.get("reason"),
            )
            db.add(row)
            db.commit()
            db.refresh(row)
            saved_id = row.id
        finally:
            db.close()

    result["saved_id"] = saved_id
    return result
