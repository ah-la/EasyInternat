# Schema base de donnees - EasyInternat

Ce diagramme resume les tables principales et les relations du projet.

```mermaid
erDiagram
    USERS ||--o| STAGIAIRES : "compte"
    CHAMBRES ||--o{ STAGIAIRES : "heberge"
    STAGIAIRES ||--o{ PAIEMENTS : "paie"
    STAGIAIRES ||--o{ SORTIES : "declare"
    STAGIAIRES ||--o{ RECLAMATIONS : "envoie"
    USERS ||--o{ ACTION_HISTORIES : "effectue"
    USERS ||--o{ RECLAMATIONS : "repond"

    USERS {
        bigint id PK
        string name
        string email UK
        string telephone
        string password
        string role
        string category
        boolean is_active
        timestamp last_login_at
    }

    STAGIAIRES {
        bigint id PK
        bigint user_id FK
        string nom
        string prenom
        string cin UK
        string telephone
        string genre
        string filiere
        bigint chambre_id FK
        string category
    }

    CHAMBRES {
        bigint id PK
        string numero UK
        string etage
        string category
        integer capacite
        string statut
    }

    DEMANDES {
        bigint id PK
        string nom
        string prenom
        string cin
        string numero_inscription
        string email
        string telephone
        string genre
        string filiere
        string certificat_residence
        string statut
        text motif_refus
    }

    STAGIAIRES_CENTRE {
        bigint id PK
        string nom
        string prenom
        string cin UK
        string numero_inscription UK
        string filiere
        string genre
    }

    PAIEMENTS {
        bigint id PK
        bigint stagiaire_id FK
        string mois
        decimal montant
        string statut
        string mode_paiement
        string numero_recu
        date date_paiement
    }

    SORTIES {
        bigint id PK
        bigint stagiaire_id FK
        date date_sortie
        time heure_sortie
        date date_retour
        time heure_retour_prevue
        string contact
        text motif
        string statut
    }

    RECLAMATIONS {
        bigint id PK
        bigint stagiaire_id FK
        string type
        string sujet
        text message
        text reponse_admin
        timestamp reponse_at
        bigint reponse_by_id FK
        string statut
    }

    ACTION_HISTORIES {
        bigint id PK
        bigint user_id FK
        string action
        string target_type
        bigint target_id
        text description
        json metadata
    }
```

## Notes metier

- `users.role` definit l'espace: admin, responsable ou stagiaire.
- `users.category` et `stagiaires.category` separent filles et garcons.
- `paiements` stocke les paiements reels deja effectues.
- Les statuts `A payer` et `En retard` sont calcules par `PaymentStatusService`.
- `sorties.statut_effectif` est calcule par le model `Sortie` selon la date et l'heure de retour prevue.
- `action_histories` garde une trace des actions sensibles.
