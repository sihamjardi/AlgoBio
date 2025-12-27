# train_model.py
from datasets import load_dataset
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from collections import Counter
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
    ds = ds.filter(is_dna, num_proc=1)  # Windows safe

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

    model = SGDClassifier(
        loss="log_loss",
        max_iter=1,
        tol=None,
        n_jobs=-1
    )

    print(" Training...")
    for epoch in range(EPOCHS):
        print(f"Epoch {epoch+1}/{EPOCHS}")
        for start in range(0, len(X_train), BATCH):
            bx = X_train[start:start+BATCH]
            by = y_train[start:start+BATCH]
            Xv = vectorizer.transform(bx)
            if epoch == 0 and start == 0:
                model.partial_fit(Xv, by, classes=classes)
            else:
                model.partial_fit(Xv, by)

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
