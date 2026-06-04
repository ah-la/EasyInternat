# Demo jury - EasyInternat

Ce scenario permet de presenter EasyInternat en 10 minutes avec un fil clair:
probleme, solution, roles, securite, workflow et reporting.

## Preparation

1. Installer le backend et lancer Laravel:

   ```bash
   cd backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. Ouvrir l'application:

   ```text
   http://127.0.0.1:8000
   ```

3. Comptes demo:

   | Role | Email | Mot de passe |
   | --- | --- | --- |
   | Admin | `admin@cmc.test` | `password` |
   | Responsable filles | `filles@cmc.test` | `password` |
   | Responsable garcons | `garcons@cmc.test` | `password` |
   | Stagiaire | `stagiaire@cmc.test` | `password` |

## Script de presentation

### 1. Introduction

EasyInternat est une application SaaS interne pour la gestion de la residence
CMC. Elle centralise les demandes, chambres, stagiaires, paiements, sorties,
reclamations, responsables et rapports.

### 2. Landing page et demande publique

- Montrer le formulaire de demande.
- Expliquer la verification du candidat par CIN et numero d'inscription.
- Expliquer l'upload obligatoire du certificat de residence.

### 3. Espace admin

- Se connecter avec `admin@cmc.test`.
- Montrer le dashboard: statistiques, notifications, graphiques.
- Montrer la navigation principale.

### 4. Demandes

- Ouvrir Demandes.
- Accepter une demande.
- Expliquer que le systeme cree le compte stagiaire et affecte une chambre.

### 5. Chambres et capacite

- Ouvrir Chambres.
- Montrer categories filles/garcons, capacite, occupants.
- Expliquer le blocage des chambres pleines.

### 6. Paiements

- Ajouter un paiement.
- Expliquer que la table stocke les paiements reels et que les retards sont
  calcules automatiquement.

### 7. Sorties

- Montrer les sorties.
- Expliquer la detection automatique du retard.
- Expliquer le blocage des sorties actives multiples.

### 8. Reclamations

- Repondre a une reclamation.
- Montrer le statut, la reponse, la date et l'auteur de la reponse.

### 9. Historique des actions

- Ouvrir Historique.
- Montrer les actions sensibles tracees.

### 10. Responsable et stagiaire

- Se connecter comme responsable filles et montrer que les garcons ne sont pas
  visibles.
- Se connecter comme stagiaire et declarer une sortie/reclamation.

## Conclusion orale

EasyInternat reduit le travail manuel, securise les acces par role, automatise
les controles importants et donne une vision claire de la residence via
dashboard, exports et historique.
