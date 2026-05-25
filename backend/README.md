# Backend EasyInternat

API Laravel pour la gestion de la residence CMC.

## Demarrage

```bash
composer install
php artisan migrate --seed
php artisan serve
```

## Configuration

Copier `.env.example` vers `.env`, puis ajuster la base de donnees :

```env
DB_DATABASE=gestion_residence_cmc
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:5174,127.0.0.1:5174
SESSION_DOMAIN=localhost
```

## Routes principales

- `/api/login`
- `/api/dashboard`
- `/api/stagiaires`
- `/api/chambres`
- `/api/paiements`
- `/api/sorties`
- `/api/reclamations`
- `/api/demandes`
- `/api/responsables`
