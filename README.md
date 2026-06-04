# EasyInternat

Application web de gestion de residence CMC avec Laravel API, React, MySQL et authentification Sanctum.

## Resume

EasyInternat permet de gerer les demandes d'internat, les stagiaires, les chambres, les paiements, les sorties, les reclamations et les responsables filles/garcons. L'application contient aussi un dashboard avec statistiques, notifications, exports Excel/PDF et historique des actions.

## Fonctionnalites

- Authentification Laravel Sanctum avec roles `admin`, `responsable` et `stagiaire`.
- Scoping automatique filles/garcons pour les responsables.
- Demandes publiques avec verification du candidat CMC et upload du certificat de residence.
- Acceptation de demande avec creation du compte stagiaire et affectation de chambre.
- Gestion des stagiaires, chambres, paiements, sorties et reclamations.
- Calcul automatique des paiements `Paye`, `A payer`, `En retard`.
- Detection des sorties en retard et blocage des sorties actives multiples.
- Reponse aux reclamations avec date, auteur et historique.
- Dashboard avec statistiques, graphiques, notifications et donnees recentes.
- Historique admin des actions sensibles.
- Exports Excel depuis les tableaux et exports PDF cote Laravel.

## Prerequis

- PHP 8.2+
- Composer
- MySQL
- Node.js 18+
- npm

## Installation Backend

### Option A - Depuis Git

```bash
git clone https://github.com/ah-la/EasyInternat.git
cd EasyInternat/backend
composer install
copy .env.example .env
php artisan key:generate
```

### Option B - Depuis un ZIP local

Si le projet est livre sous forme ZIP, extraire l'archive puis ouvrir le dossier:

```bash
cd gestion-residence-cmc-pro2/backend
composer install
copy .env.example .env
php artisan key:generate
```

Configurer la base de donnees dans `backend/.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_residence_cmc
DB_USERNAME=root
DB_PASSWORD=
```

Puis lancer :

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Application Laravel + frontend build : `http://127.0.0.1:8000`

## Installation Frontend

Pour travailler sur React separement :

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

`frontend/.env` doit contenir :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Frontend dev : `http://localhost:5173`

Important : le backend Laravel doit rester lance sur `http://127.0.0.1:8000`, sinon la connexion et les appels API ne fonctionneront pas.

## Build Pour Laravel

Pour reconstruire React et copier le build vers `backend/public` :

```bash
cd frontend
npm run build:laravel
```

## Comptes Demo

| Espace | Email | Mot de passe |
| --- | --- | --- |
| Admin | `admin@cmc.test` | `password` |
| Responsable filles | `filles@cmc.test` | `password` |
| Responsable garcons | `garcons@cmc.test` | `password` |
| Stagiaire principal | `stagiaire@cmc.test` | `password` |

Autres comptes stagiaires demo avec le meme mot de passe `password` :

- `bennani.salma@cmc.test`
- `rami.imane@cmc.test`
- `amrani.nour@cmc.test`
- `omar.yassine@cmc.test`
- `alaoui.mehdi@cmc.test`
- `fassi.hamza@cmc.test`
- `berrada.anas@cmc.test`
- `naciri.othmane@cmc.test`

## Parcours Demo Jury

1. Se connecter en admin avec `admin@cmc.test` / `password`.
2. Montrer le dashboard : statistiques, notifications, graphiques et exports Excel.
3. Ouvrir `Demandes`, accepter une demande et affecter une chambre.
4. Ouvrir `Stagiaires`, consulter un profil, verifier chambre/paiements/reclamations/sorties.
5. Ouvrir `Chambres`, montrer capacite, occupants et blocage des chambres pleines.
6. Ouvrir `Paiements`, ajouter un paiement et verifier le statut du stagiaire.
7. Ouvrir `Sorties`, marquer une sortie comme retournee.
8. Ouvrir `Reclamations`, repondre a une reclamation.
9. Ouvrir `Responsables`, activer/desactiver un responsable.
10. Ouvrir `Historique`, montrer la tracabilite des actions admin.
11. Se connecter comme responsable filles puis montrer qu'il ne voit que les donnees filles.
12. Se connecter comme stagiaire puis creer une sortie ou une reclamation.

## Schema Base De Donnees

- `users` : comptes admin, responsables et stagiaires avec role, categorie, statut actif et derniere connexion.
- `stagiaires` : profil stagiaire, CIN, filiere, genre, categorie, chambre et compte utilisateur lie.
- `stagiaires_centre` : candidats valides par le centre, utilises pour verifier les demandes publiques.
- `demandes` : demandes d'internat, certificat de residence, statut et motif de refus.
- `chambres` : numero, etage, categorie filles/garcons, capacite et statut.
- `paiements` : paiements reels enregistres. Les statuts en retard/non paye sont calcules par `PaymentStatusService`.
- `sorties` : date/heure de sortie, retour prevu, motif, contact et statut.
- `reclamations` : sujet, message, statut, reponse admin, date et responsable de la reponse.
- `action_histories` : journal des actions importantes avec utilisateur, cible, description et metadata.
- `personal_access_tokens` : tokens Laravel Sanctum.

## Routes Principales API

| Route | Methode | Role | Description |
| --- | --- | --- | --- |
| `/api/login` | POST | Public | Connexion et creation token Sanctum |
| `/api/logout` | POST | Auth | Suppression du token courant |
| `/api/demandes` | POST | Public | Envoyer une demande d'internat |
| `/api/verify-candidat` | POST | Public | Verifier CIN/numero inscription |
| `/api/dashboard` | GET | Admin/responsable | Statistiques dashboard |
| `/api/demandes` | GET/PUT/DELETE | Admin/responsable | Gestion des demandes |
| `/api/demandes/{id}/accept` | POST | Admin/responsable | Accepter et creer stagiaire |
| `/api/demandes/{id}/refuse` | POST | Admin/responsable | Refuser une demande |
| `/api/stagiaires` | API resource | Admin/responsable | Gestion stagiaires |
| `/api/chambres` | API resource | Admin/responsable | Gestion chambres |
| `/api/paiements` | API resource | Admin/responsable | Gestion paiements |
| `/api/sorties` | API resource | Admin/responsable/stagiaire | Suivi sorties |
| `/api/reclamations` | API resource | Admin/responsable/stagiaire | Suivi reclamations |
| `/api/responsables` | API resource | Admin | Gestion responsables |
| `/api/actions` | GET | Admin | Historique des actions |
| `/api/pdf/{type}` | GET | Admin/responsable | Export PDF |

## Tests

```bash
cd backend
php artisan test
```

Les tests couvrent le scoping filles/garcons, les demandes, certificats, chambres, paiements, sorties, reclamations, responsables et dashboard.

```bash
cd frontend
npm run build
```

## Politique Paiements

La table `paiements` stocke seulement les paiements reels payes. Les statuts `A payer` et `En retard` sont calcules automatiquement selon les mois couverts et la date courante. Cette approche evite de creer des lignes fictives pour les impayes.

## Troubleshooting

- Erreur `Identifiants incorrects` alors que le compte est correct : verifier que Laravel tourne sur `http://127.0.0.1:8000`.
- En mode frontend dev, creer `frontend/.env` avec `VITE_API_URL=http://127.0.0.1:8000/api`.
- Certificats introuvables : lancer `php artisan storage:link`.
- MySQL refuse la connexion : verifier `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
- Warning PHP `openssl already loaded` : verifier la configuration PHP, mais ce warning ne bloque pas l'application.
- Apres modification React : lancer `npm run build:laravel` pour mettre a jour `backend/public`.

## Livraison Professionnelle

Ne pas publier :

- `.env`
- `vendor/`
- `node_modules/`
- `frontend/dist/`
- logs, caches, bases locales et fichiers temporaires

Garder :

- `.env.example`
- `composer.lock`
- `package-lock.json`
- migrations, seeders, tests et README

En production, utiliser `APP_DEBUG=false` et des mots de passe forts. Les comptes `password` sont uniquement des comptes demo.
