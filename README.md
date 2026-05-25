# EasyInternat

Application de gestion de residence CMC avec React, Laravel API et MySQL.

## Fonctionnalites

- Authentification Laravel Sanctum.
- Espaces admin, responsable filles/garcons et stagiaire.
- Gestion des demandes, stagiaires, chambres, paiements, sorties et reclamations.
- Dashboard avec statistiques.
- Export PDF via DomPDF.
- Interface React servie par Laravel apres build.

## Installation

```bash
git clone https://github.com/ah-la/EasyInternat.git
cd EasyInternat
```

### Backend Laravel

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

API et application : http://127.0.0.1:8000

Si votre MySQL n'utilise pas le port `3306`, modifiez `DB_PORT` dans `backend/.env`.
Le fichier `backend/.env.example` est seulement un modele public : copiez-le vers `.env`, puis remplacez `your_database_name`, `your_database_user` et `your_database_password` par vos propres valeurs locales.

### Frontend React

Pour developper le frontend separement :

```bash
cd frontend
npm install
npm run dev
```

Pour reconstruire l'interface React servie par Laravel :

```bash
cd frontend
npm install
npm run build
```

Puis copier le contenu de `frontend/dist` vers `backend/public` si necessaire. Une version build est deja incluse dans `backend/public` pour lancer rapidement le projet avec `php artisan serve`.

## Comptes demo

- Admin : `admin@cmc.test` / `password`
- Responsable filles : `filles@cmc.test` / `password`
- Responsable garcons : `garcons@cmc.test` / `password`
- Stagiaire : `stagiaire@cmc.test` / `password`

## A ne pas publier

Les dossiers `node_modules/`, `vendor/`, les fichiers `.env`, logs, caches, bases locales et fichiers temporaires sont ignores par Git.
