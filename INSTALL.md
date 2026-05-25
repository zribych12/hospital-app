# Guide d'installation — HôpitalApp

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |

> **Pas besoin de MongoDB** — le projet utilise une base de données en mémoire (MockModel).

---

## 1. Cloner le projet

```bash
git clone https://github.com/zribych12/hospital-app.git
cd hospital-app
```

---

## 2. Installer le Backend

```bash
cd backend
npm install
```

### Variables d'environnement

Copier le fichier d'exemple :

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Le fichier `.env` par défaut fonctionne sans modification (base en mémoire, secrets JWT déjà définis).

### Démarrer le backend

```bash
npm run dev
```

Le backend démarre sur **http://localhost:5000**

---

## 3. Installer le Frontend

Dans un **nouveau terminal** :

```bash
cd frontend
npm install
```

### Démarrer le frontend

```bash
npm start
```

L'application est disponible sur **http://localhost:4200**

> Le proxy Angular redirige automatiquement `/api/*` → `http://localhost:5000/api/*`

---

## 4. Comptes de test

Les données sont chargées automatiquement au démarrage du backend.

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@hospital.fr | `Admin123!` |
| Médecin | medecin1@hospital.fr | `Medecin123!` |

---

## Résumé des commandes

```bash
# Terminal 1 — Backend
cd hospital-app/backend
npm install
npm run dev

# Terminal 2 — Frontend
cd hospital-app/frontend
npm install
npm start
```

Ouvrir **http://localhost:4200** dans le navigateur.
