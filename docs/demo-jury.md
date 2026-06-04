# Scenario de demonstration jury - EasyInternat

Objectif: montrer que le projet n'est pas seulement un CRUD, mais une plateforme
complete de gestion de residence avec roles, workflows, securite et reporting.

## Preparation

1. Lancer le backend:

   ```bash
   cd backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. Ouvrir `http://127.0.0.1:8000`.
3. Verifier que les comptes demo fonctionnent:

   - admin: `admin@cmc.test`
   - responsable filles: `filles@cmc.test`
   - responsable garcons: `garcons@cmc.test`
   - stagiaire: `stagiaire@cmc.test`
   - mot de passe: `password`

## Demo en 10 minutes

1. **Landing page**
   - Montrer le formulaire de demande.
   - Expliquer que seuls les candidats presents dans `stagiaires_centre` peuvent envoyer une demande valide.

2. **Connexion admin**
   - Se connecter avec `admin@cmc.test`.
   - Montrer le dashboard: stats, notifications, graphiques.

3. **Demandes**
   - Ouvrir la page Demandes.
   - Accepter une demande.
   - Montrer creation du compte stagiaire + affectation automatique de chambre.

4. **Chambres**
   - Montrer capacite, occupants et categories filles/garcons.
   - Expliquer le blocage des chambres pleines.

5. **Paiements**
   - Ajouter un paiement.
   - Expliquer que les paiements stockent les vrais mois payes et que le retard est calcule automatiquement.

6. **Sorties**
   - Montrer une sortie en cours.
   - Expliquer la detection automatique du retard.
   - Expliquer que le systeme bloque une deuxieme sortie active pour le meme stagiaire.

7. **Reclamations**
   - Repondre a une reclamation.
   - Montrer `reponse_at` et `reponse_by`.

8. **Historique**
   - Ouvrir Historique.
   - Montrer les actions sensibles tracees.

9. **Responsable filles/garcons**
   - Se connecter comme responsable filles.
   - Montrer que les donnees garcons ne sont pas visibles.

10. **Stagiaire**
    - Se connecter comme stagiaire.
    - Declarer une sortie.
    - Envoyer une reclamation.

## Phrase de conclusion

EasyInternat centralise la gestion de residence CMC, securise les acces par
role, automatise les controles importants comme la capacite des chambres et les
retards, et donne a l'administration une vision claire via dashboard, exports et
historique.
