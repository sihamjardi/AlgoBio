from datasets import load_dataset
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.calibration import CalibratedClassifierCV

from collections import Counter
from sklearn.svm import LinearSVC
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    confusion_matrix, ConfusionMatrixDisplay,
    roc_curve, auc
)
from sklearn.preprocessing import label_binarize
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
import numpy as np
import joblib

LABEL_COL = "family"
MAX_LEN = 2000
MIN_LEN = 150
BATCH = 2000
EPOCHS = 3

def is_dna(ex):
    mol = (ex["molecule_type"] or "").lower()
    return ("dna" in mol) and ("rna" not in mol)

def clean_seq(s: str) -> str:
    s = (s or "").strip().upper().replace(" ", "").replace("\n", "")
    s = "".join([c for c in s if c in "ATCGN"])
    return s[:MAX_LEN]

def main():
    print(" Load dataset...")
    ds = load_dataset("DNA-LLM/virus_detailed_clean", split="train")

    print(" Filter DNA only...")
    ds = ds.filter(is_dna, num_proc=1)  

    seqs = [clean_seq(x) for x in ds["seq"]]
    labels = ds[LABEL_COL]

    keep = [i for i,s in enumerate(seqs) if len(s) >= MIN_LEN and labels[i] is not None]
    seqs = [seqs[i] for i in keep]
    labels = [labels[i] for i in keep]

    cnt = Counter(labels)
    valid = {k for k,v in cnt.items() if v >= 20}
    seqs = [s for s,l in zip(seqs, labels) if l in valid]
    labels = [l for l in labels if l in valid]

    print(" Samples:", len(seqs))
    print(" Classes:", len(set(labels)))

    X_train, X_test, y_train, y_test = train_test_split(
        seqs, labels, test_size=0.2, random_state=42, stratify=labels
    )

    vectorizer = HashingVectorizer(
        analyzer="char",
        ngram_range=(3,5),
        n_features=2**18,
        alternate_sign=False,
        norm="l2"
    )

    
    classes = np.unique(y_train)

    base = LinearSVC()
    model = CalibratedClassifierCV(base, method="sigmoid", cv=3)  
    print(" Training...")
    X_train_v = vectorizer.transform(X_train)
    model.fit(X_train_v, y_train)

    print(" Evaluation")
    X_test_v = vectorizer.transform(X_test)
    pred = model.predict(X_test_v)
    print(classification_report(y_test, pred, zero_division=0))

    joblib.dump(model, "virus_model.pkl")
    joblib.dump(vectorizer, "virus_vectorizer.pkl")
    joblib.dump({"label_col": LABEL_COL, "min_len": MIN_LEN, "max_len": MAX_LEN}, "meta.pkl")
    print(" Saved model files.")

if __name__ == "__main__":
    main()
