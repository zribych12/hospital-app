# Guide d'installation — HôpitalApp

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| MongoDB | ≥ 6.x |

---

## 1. Installer MongoDB

### Windows

1. Télécharger l'installeur MSI sur [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Lancer l'installeur → choisir **Complete** → cocher **Install MongoDB as a Service**
3. Vérifier que MongoDB tourne :

```powershell
Get-Service -Name MongoDB
# Status doit être : Running
```

Si le service n'est pas démarré :

```powershell
Start-Service -Name MongoDB
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### macOS

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## 2. Cloner le projet

```bash
git clone https://github.com/zribych12/hospital-app.git
cd hospital-app
```

---

## 3. Configurer le Backend

```bash
cd backend
npm install
```

### Variables d'environnement

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Ouvrir `.env` et renseigner les valeurs :

```env
PORT=5000

# URI MongoDB locale
MONGO_URI=mongodb://localhost:27017/hospital-app

# Secrets JWT (changer en production)
JWT_SECRET=change_this_secret_jwt
JWT_REFRESH_SECRET=change_this_secret_refresh

# Optionnel — email (laisser vide pour désactiver)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Injecter les données de test

```bash
npm run seed
```

### Démarrer le backend

```bash
npm run dev
```

Le backend démarre sur **http://localhost:5000**

---

## 4. Configurer le Frontend

Dans un **nouveau terminal** :

```bash
cd frontend
npm install
npm start
```

L'application est disponible sur **http://localhost:4200**

> Le proxy Angular redirige automatiquement `/api/*` → `http://localhost:5000/api/*`

---

## 5. Comptes de test (créés par le seed)

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
copy .env.example .env   # puis éditer MONGO_URI
npm run seed
npm run dev

# Terminal 2 — Frontend
cd hospital-app/frontend
npm install
npm start
```

Ouvrir **http://localhost:4200** dans le navigateur.
