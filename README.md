# AlgoBio — Plateforme d’expérimentation en bio-informatique (Alignement, Mutations & Classification IA)

**Binôme :** JARDI Siham & HASSAOUI Aya  
**Encadrant :** Mr. LACHGAR Mohammed  
**Université :** Université Cadi Ayyad — École Normale Supérieure, Marrakech (Département Informatique)

---

## À propos

**AlgoBio** est une plateforme pédagogique et expérimentale de **bio-informatique** permettant de :
- saisir et valider des **séquences ADN**,
- exécuter des algorithmes d’**alignement** (ex. *Needleman–Wunsch*),
- effectuer une recherche de similarité de type **BLAST simplifié**,
- simuler des **mutations** (substitution, insertion, délétion) et mesurer leur impact,
- classer automatiquement une séquence via un module **IA** (famille virale) entraîné sur un dataset annoté (*Hugging Face*).

L’objectif principal est de fournir une **interface unifiée**, claire et interactive pour **apprendre**, **tester**, **visualiser** et **conserver l’historique** des résultats, dans une architecture **modulaire** basée sur des **microservices**.

---

## Mots-clés

Bio-informatique · ADN · Alignement · Similarité · Mutations · Microservices · IA · Classification

---

## Fonctionnalités

### 1) Authentification (Auth MS)
- Inscription / Connexion
- Sécurisation via **JWT**
- Protection des endpoints

### 2) Gestion des séquences (Sequence MS)
- Saisie / import (FASTA, texte…)
- Validation stricte : caractères autorisés (A, T, C, G) + contraintes longueur/format
- Stockage + consultation + réutilisation

### 3) Alignement & similarité (Alignment MS)
- Alignement global **Needleman–Wunsch**
- Résultats interprétables :
  - alignement final (avec gaps),
  - score,
  - % identité,
  - mismatches & gaps
- Similarité **BLAST simplifié**

### 4) Mutations (Mutation MS)
- Simulation : substitution / insertion / délétion
- Taux paramétrable
- Comparaison avant/après :
  - score,
  - identité,
  - similarité 

### 5) Classification IA (IA Classifier MS)
- Classification d’une séquence ADN (ex. famille virale)
- Résultat : **classe prédite + Top-K probabilités**
- Sauvegarde des prédictions dans la base

### 6) Historique & traçabilité
- Historique des séquences, alignements, mutations, prédictions IA
- Consultation, comparaison, export (selon implémentation)

---

## Architecture microservices

<img width="877" height="443" alt="image" src="https://github.com/user-attachments/assets/4e91bd54-6674-413d-a9d8-af340eb5a74f" />


La plateforme est structurée en **microservices indépendants**, chacun responsable d’un domaine métier :

- **Auth MS** : comptes & sécurité (JWT)
- **Sequence MS** : validation / stockage / gestion des séquences
- **Alignment MS** : alignement global + similarité
- **Mutation MS** : simulation & analyse d’impact
- **IA Classifier MS** : classification ML sur séquences ADN

Communication via **API REST (JSON)**.  
Le frontend orchestre les appels via **Fetch/Axios**.

---

## Technologies

### Backend (Microservices)
- **Spring Boot (Java 21)** (services principaux)
- **FastAPI (Python)** (microservice IA)
- **PostgreSQL**

### IA / ML
- **scikit-learn**
- HashingVectorizer (k-mers char n-grams)
- Classifieur final : **LinearSVC calibré (CalibratedClassifierCV)**

### Frontend
- **React** (UI)
- Vite
- Composants UI (Card, Button, Dialog, etc.)

---

## Dataset & Modèle IA

- **Dataset :** `DNA-LLM/virus_detailed_clean` (Hugging Face)
- **Tâche :** classification de séquences ADN en **famille virale**
- Nettoyage : caractères {A,T,C,G,N}, normalisation, filtre longueur minimale
- Filtrage des classes rares (ex. < 20 échantillons)

### Résumé performance (exemple)
Comparaison expérimentale de modèles sur le dataset :
- MultinomialNB : Accuracy faible (non adapté)
- LogisticRegression : intermédiaire
- SGDClassifier : intermédiaire
- **LinearSVC** : meilleur compromis (Accuracy élevée + meilleur Macro-F1)

---

## Installation (Local)

### Prérequis
- **Java 21+**
- **Node.js 18+**
- **Python 3.x**
- **PostgreSQL** 

---

## Base de données

La base stocke :
- utilisateurs,
- séquences validées,
- résultats d’alignement,
- simulations de mutations,
- prédictions IA,
- historique des expérimentations.

ORM recommandé côté Spring : **Hibernate/JPA**  
Côté FastAPI : **SQLAlchemy**

---

## Lancer le microservice IA (FastAPI)

### 1) Installer les dépendances

```bash
pip install -r requirements.txt
```

### 2) Entraîner le modèle

```bash
python train_model.py
```

Cela génère :

•virus_model.pkl

•virus_vectorizer.pkl

•meta.pkl

### 3) Démarrer l’API

```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Endpoints principaux
GET /health → status

POST /predict → prédiction IA

GET /classifications?limit=50 → historique

GET /classifications/{id} → détail

---

## Lancer le frontend

```bash
npm install
npm run dev
```

Le frontend propose :

saisie ou import de séquence,

bouton de classification,

affichage Top-K + barre de confiance,

import depuis l’historique .

---

## Scénarios d’usage

### Scénario 1 — Validation & stockage
L’utilisateur saisit une séquence

La plateforme vérifie format/longueur

La séquence est stockée et réutilisable

### Scénario 2 — Alignement
Choisir deux séquences

Exécuter Needleman–Wunsch

Obtenir alignement + score + % identité

### Scénario 3 — BLAST simplifié
Exécuter une similarité rapide sur fragments

Détecter correspondances locales

### Scénario 4 — Mutation
Appliquer substitution/insertion/délétion

Comparer avant/après

Mesurer impact (score, identité…)

### Scénario 5 — Classification IA
Soumettre séquence au classifieur

Obtenir famille + probabilités (Top-K)

Sauvegarder dans l’historique

---

## Points forts / Innovation

Combinaison alignement global + similarité type BLAST

Simulation de mutations contrôlée + comparaison automatique

Historique complet pour traçabilité & reproductibilité

Architecture microservices évolutive

Module IA 

---

## Roadmap (Perspectives)

Alignement local Smith–Waterman

Paramètres avancés : pénalité de gap, matrices de substitution

Explicabilité IA (explications plus riches)

Export des résultats (CSV/PDF)

---

## Auteurs & contact

JARDI Siham — s.jardi1352@uca.ac.ma

HASSAOUI Aya — a.hassaoui9598@uca.ac.ma

---

## Licence

Ce projet est sous licence MIT.

Voir le fichier LICENSE.

---

## Liens utiles

FastAPI : https://fastapi.tiangolo.com/

Spring Boot : https://spring.io/projects/spring-boot

Hugging Face : https://huggingface.co/

Dataset : https://huggingface.co/datasets/DNA-LLM/virus_detailed_clean

---

## Video Demonstrative

https://youtu.be/CdyGQl5bcRY


















