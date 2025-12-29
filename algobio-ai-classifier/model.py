from datasets import load_dataset
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sklearn.linear_model import SGDClassifier, LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score

from collections import Counter
import numpy as np
LABEL_COL = "family"
MAX_LEN = 2000
MIN_LEN = 150
def is_dna(ex):
    mol = (ex["molecule_type"] or "").lower()
    return ("dna" in mol) and ("rna" not in mol)

def clean_seq(s: str) -> str:
    s = (s or "").strip().upper().replace(" ", "").replace("\n", "")
    s = "".join([c for c in s if c in "ATCGN"])
    return s[:MAX_LEN]
print("Load dataset...")
ds = load_dataset("DNA-LLM/virus_detailed_clean", split="train")
ds = ds.filter(is_dna, num_proc=1)
seqs = [clean_seq(x) for x in ds["seq"]]
labels = ds[LABEL_COL]
# filtrage longueur + label non null
keep = [i for i, s in enumerate(seqs) if len(s) >= MIN_LEN and labels[i] is not None]
seqs = [seqs[i] for i in keep]
labels = [labels[i] for i in keep]
# filtrage classes rares
cnt = Counter(labels)
valid = {k for k, v in cnt.items() if v >= 20}
seqs = [s for s, l in zip(seqs, labels) if l in valid]
labels = [l for l in labels if l in valid]
X_train, X_test, y_train, y_test = train_test_split(
    seqs, labels, test_size=0.2, random_state=42, stratify=labels
)
# Vectorizer (identique à ton choix)
vectorizer = HashingVectorizer(
    analyzer="char",
    ngram_range=(3, 5),
    n_features=2**18,
    alternate_sign=False,
    norm="l2"
)

 #Modèles à comparer (SGD = ton baseline)

models = {

    "SGDClassifier(log_loss)": SGDClassifier(loss="log_loss", max_iter=20, n_jobs=-1, random_state=42),

    "LinearSVC": LinearSVC(),

    "LogisticRegression": LogisticRegression(max_iter=2000, n_jobs=-1),

    "MultinomialNB": MultinomialNB()

}


X_train_v = vectorizer.transform(X_train)
X_test_v = vectorizer.transform(X_test)
y_pred = model.predict(X_test_v)

print(classification_report(y_test, y_pred, zero_division=0))


cm = confusion_matrix(y_test, y_pred, labels=classes)



plt.figure(figsize=(10, 8))

sns.heatmap(cm, xticklabels=classes, yticklabels=classes,

            cmap="Blues", annot=False, fmt="d")

plt.xlabel("Predicted")

plt.ylabel("True")

plt.title("Confusion Matrix - SGDClassifier")

plt.show()

probas = model.predict_proba(X_test_v)

df_proba = pd.DataFrame(probas, columns=classes)



corr = df_proba.corr()



plt.figure(figsize=(12, 10))

sns.heatmap(corr, cmap="coolwarm", center=0)

plt.title("Correlation Matrix between Classes - SGDClassifier")

plt.show()

results = []

for name, clf in models.items():

    clf.fit(X_train_v, y_train)

    pred = clf.predict(X_test_v)

    acc = accuracy_score(y_test, pred)

    f1  = f1_score(y_test, pred, average="macro")

    results.append((name, acc, f1))

results.sort(key=lambda x: x[1], reverse=True)

print("\n=== Model comparison ===")

for name, acc, f1 in results:

    print(f"{name:25s}  accuracy={acc:.4f}  macroF1={f1:.4f}")

acc = accuracy_score(y_test, y_pred)

print("Accuracy SGDClassifier:", round(acc * 100, 2), "%")

#  Accuracy du SGD en particulier

sgd_acc = [r[1] for r in results if r[0].startswith("SGDClassifier")][0]

print(f"\n SGDClassifier accuracy = {sgd_acc:.4f}")



