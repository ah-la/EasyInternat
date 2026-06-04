# Checklist livraison - EasyInternat

Utiliser cette checklist avant d'envoyer le projet ou de le presenter.

## Code

- [ ] `frontend/src/pages/StagiaireSortie.jsx` utilise `logoutUser()`.
- [ ] `frontend/src/pages/StagiaireReclamation.jsx` utilise `logoutUser()`.
- [ ] Aucun logout frontend ne se contente uniquement de vider `sessionStorage`.
- [ ] Les fichiers sources importants sont conserves.
- [ ] Aucun commit automatique n'a ete fait par erreur.

## Tests et build

- [ ] Backend: `php artisan test` passe.
- [ ] Frontend: `npm.cmd run build` passe.
- [ ] L'application s'ouvre sur `http://127.0.0.1:8000`.
- [ ] Les comptes demo fonctionnent.

## ZIP final propre

Generer le ZIP final:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/make-release.ps1
```

Verifier le contenu:

```bash
tar -tf outputs/gestion-residence-cmc-pro2-clean.zip | rg ".env|.git|vendor|node_modules|frontend/dist"
```

Resultat attendu: aucun resultat.

Le ZIP final ne doit pas contenir:

- [ ] `.env`
- [ ] `.git`
- [ ] `backend/vendor`
- [ ] `frontend/node_modules`
- [ ] `frontend/dist`
- [ ] logs
- [ ] caches
- [ ] database locale
- [ ] `.phpunit.cache`

Le ZIP final doit contenir:

- [ ] code backend
- [ ] code frontend
- [ ] `composer.lock`
- [ ] `package-lock.json`
- [ ] `README.md`
- [ ] `docs/README-DEMO.md`
- [ ] `docs/CHECKLIST-LIVRAISON.md`
- [ ] `docs/ERD.md`

## Demo jury

- [ ] Dashboard pret.
- [ ] Demandes avec certificat pretes.
- [ ] Chambres avec capacite pretes.
- [ ] Paiements prets.
- [ ] Sorties et retard prets.
- [ ] Reclamations pretes.
- [ ] Historique admin pret.
- [ ] Role responsable filles/garcons teste.
- [ ] Espace stagiaire teste.

## Securite

- [ ] `.env` absent du ZIP final.
- [ ] `APP_DEBUG=false` documente pour production.
- [ ] Logout serveur via `/api/logout`.
- [ ] Comptes demo presentes comme comptes de demonstration seulement.
