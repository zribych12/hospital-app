# 🏥 HôpitalApp — Application hospitalière fullstack

Application web complète de gestion hospitalière : médecins, patients, rendez-vous, et prise de RDV publique.

## Stack technique

| Couche      | Technologie                          |
|-------------|--------------------------------------|
| Frontend    | Angular 17+ (standalone, TailwindCSS)|
| Backend     | Node.js + Express.js (REST)          |
| Base de données | MongoDB + Mongoose               |
| Auth        | JWT (access 15min + refresh 7j) + bcrypt |

---

## Structure du projet

```
hospital-app/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── models/          # Schémas Mongoose (User, Patient, RendezVous, ConsultationNote)
│   │   ├── controllers/     # Logique métier
│   │   ├── services/        # Services réutilisables
│   │   ├── routes/          # Routes Express
│   │   ├── middlewares/     # Auth JWT + rôle + gestion erreurs
│   │   └── seed/            # Données de test
│   ├── server.js
│   └── package.json
└── frontend/                # Angular 17
    └── src/app/
        ├── core/            # Models, services, guards, interceptors
        ├── shared/          # Composants réutilisables
        └── features/        # Modules par domaine
            ├── auth/        # Page de login
            ├── admin/       # Dashboard admin + gestion médecins
            ├── medecin/     # Dashboard + patients + planning + fiche
            ├── public/      # Prise de RDV sans auth (stepper)
            └── errors/      # Pages 403 / 404
```

---

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** ≥ 6.x (local ou Atlas)
- **Angular CLI** ≥ 17 (`npm install -g @angular/cli`)

---

## Démarrage rapide

### 1. Backend

```bash
cd hospital-app/backend

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
copy .env.example .env
# Éditez .env : renseignez MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET

# Démarrer MongoDB (si local)
mongod

# Injecter les données de test
npm run seed

# Démarrer en mode développement
npm run dev
```

Le backend écoute sur **http://localhost:5000**

### 2. Frontend

```bash
cd hospital-app/frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

Le frontend est disponible sur **http://localhost:4200**

> Le proxy Angular redirige `/api/*` → `http://localhost:5000/api/*`

---

## Comptes de test (après seed)

| Rôle    | Email                            | Mot de passe   |
|---------|----------------------------------|----------------|
| Admin   | admin@hopital.fr                 | `Admin@2024`   |
| Médecin | bernard.martin@hopital.fr        | `Medecin@2024` |
| Médecin | sophie.leroy@hopital.fr          | `Medecin@2024` |

---

## Routes API

### Authentification
| Méthode | Route              | Description              | Auth |
|---------|-------------------|--------------------------|------|
| POST    | /api/auth/login    | Connexion                | Non  |
| POST    | /api/auth/refresh  | Renouveler access token  | Non  |
| POST    | /api/auth/logout   | Déconnexion              | Oui  |
| GET     | /api/auth/me       | Profil courant           | Oui  |

### Utilisateurs (admin)
| Méthode | Route                                  | Description                    |
|---------|----------------------------------------|--------------------------------|
| GET     | /api/users/medecins                    | Liste des médecins             |
| POST    | /api/users/medecins                    | Créer un médecin               |
| PATCH   | /api/users/medecins/:id/toggle-status  | Activer/Désactiver             |
| PATCH   | /api/users/medecins/:id/reset-password | Réinitialiser le mot de passe  |

### Patients
| Méthode | Route                    | Description                        |
|---------|--------------------------|------------------------------------|
| GET     | /api/patients            | Liste paginée (filtrée)            |
| GET     | /api/patients/:id        | Fiche + consultations              |
| POST    | /api/patients            | Créer un patient                   |
| PUT     | /api/patients/:id        | Modifier un patient                |
| PATCH   | /api/patients/:id/notes  | Mettre à jour notes + statut       |

### Rendez-vous
| Méthode | Route                        | Description                      |
|---------|------------------------------|----------------------------------|
| GET     | /api/rendez-vous             | Liste (filtrée par date/statut)  |
| GET     | /api/rendez-vous/creneaux    | Créneaux disponibles             |
| POST    | /api/rendez-vous             | Créer un RDV                     |
| PUT     | /api/rendez-vous/:id         | Modifier un RDV                  |
| PATCH   | /api/rendez-vous/:id/annuler | Annuler un RDV                   |

### Public (sans authentification)
| Méthode | Route                    | Description                 |
|---------|--------------------------|-----------------------------|
| GET     | /api/public/medecins     | Liste des médecins actifs   |
| GET     | /api/public/creneaux     | Créneaux disponibles        |
| POST    | /api/public/rendez-vous  | Prise de RDV publique       |

### Statistiques
| Méthode | Route              | Description               | Rôle    |
|---------|--------------------|---------------------------|---------|
| GET     | /api/stats/medecin | KPIs médecin + graphiques | medecin |
| GET     | /api/stats/admin   | KPIs administrateur       | admin   |

---

## Routes Angular

| Route                    | Composant              | Accès      |
|--------------------------|------------------------|------------|
| /login                   | LoginComponent         | Public     |
| /admin/dashboard         | AdminDashboardComponent| Admin      |
| /admin/medecins          | MedecinsComponent      | Admin      |
| /admin/patients          | PatientsReadonlyComponent | Admin   |
| /medecin/dashboard       | MedecinDashboardComponent | Médecin |
| /medecin/patients        | PatientsComponent      | Médecin    |
| /medecin/patients/:id    | FichePatientComponent  | Médecin    |
| /medecin/planning        | PlanningComponent      | Médecin    |
| /rendez-vous             | RendezVousPublicComponent | Public  |
| /403                     | ForbiddenComponent     | Public     |

---

## Fonctionnalités

### Interface Médecin
- ✅ Dashboard avec KPIs (patients suivis, RDV du jour, en attente, taux de présence)
- ✅ Graphique donut : répartition des pathologies (Chart.js)
- ✅ Graphique line : évolution consultations 30 jours
- ✅ Liste des prochains RDV du jour
- ✅ Tableau patients paginé avec filtres (statut, pathologie)
- ✅ Badges colorés par statut (vert/orange/rouge/bleu)
- ✅ Fiche patient complète avec notes médicales éditables
- ✅ Historique des consultations
- ✅ Planning hebdomadaire avec code couleur par type de RDV
- ✅ Création/modification/annulation de RDV

### Interface Admin
- ✅ Dashboard avec statistiques globales
- ✅ Gestion des médecins (créer, activer/désactiver, réinitialiser MDP)
- ✅ Mot de passe temporaire affiché une seule fois à la création
- ✅ Soft delete (actif: false) — pas de suppression définitive
- ✅ Consultation des patients en lecture seule

### Prise de RDV publique (`/rendez-vous`)
- ✅ Stepper en 4 étapes
- ✅ Sélection du médecin + créneaux disponibles dynamiques
- ✅ Numéro de référence unique affiché à la confirmation

### Sécurité
- ✅ JWT (access token 15min + refresh token 7j)
- ✅ Refresh automatique via interceptor Angular
- ✅ Logout automatique sur 401
- ✅ Guards `authGuard` + `roleGuard` sur toutes les routes protégées
- ✅ Page 403 dédiée
- ✅ Validation des inputs (express-validator côté backend)
- ✅ Gestion centralisée des erreurs

---

## Variables d'environnement (backend)

| Variable               | Description                          | Défaut                           |
|------------------------|--------------------------------------|----------------------------------|
| `PORT`                 | Port du serveur                      | `5000`                           |
| `MONGO_URI`            | URI MongoDB                          | `mongodb://localhost:27017/hospital_db` |
| `JWT_SECRET`           | Secret JWT access token              | **Obligatoire en production**    |
| `JWT_REFRESH_SECRET`   | Secret JWT refresh token             | **Obligatoire en production**    |
| `JWT_EXPIRES_IN`       | Durée access token                   | `15m`                            |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token               | `7d`                             |
| `EMAIL_HOST`           | Serveur SMTP                         | `smtp.gmail.com`                 |
| `EMAIL_PORT`           | Port SMTP                            | `587`                            |
| `EMAIL_USER`           | Email expéditeur (optionnel)         | —                                |
| `EMAIL_PASS`           | Mot de passe SMTP (optionnel)        | —                                |
| `FRONTEND_URL`         | URL du frontend (CORS)              | `http://localhost:4200`          |

---

## Production

```bash
# Build Angular
cd frontend
npm run build
# Les fichiers sont dans dist/hospital-app/

# Servir les fichiers statiques depuis Express
# Ajouter dans backend/src/app.js :
# app.use(express.static(path.join(__dirname, '../../frontend/dist/hospital-app/browser')));
```
