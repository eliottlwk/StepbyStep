# Arborescence et fonctionnalités MVP — Step by Step

Arborescence proposée (niveau fichier)

- `index.html` — point d'entrée
- `package.json` — manifest
- `src/`
  - `main.jsx` — bootstrap React
  - `StepByStepApp.jsx` — composant principal (existant)
  - `pages/`
    - `Dashboard.jsx` — vue tableau de bord
    - `Tasks.jsx` — liste des tâches
    - `TaskDetail.jsx` — détail d'une tâche + sous‑tâches
    - `Progress.jsx` — vue progression & historique
    - `Onboarding.jsx` — onboarding réutilisable
  - `components/`
    - `Header.jsx` — header global
    - `Modal.jsx` — modal générique
  - `lib/`
    - `api.js` — stub client API / Supabase
  - `styles/` — styles globaux (si besoin)
- `db/001_init.sql` — migration MPD
- `docs/architecture.md` — architecture & endpoints
- `docs/arborescence.md` — (ce fichier)
- `README.md`

Fonctionnalités utiles au MVP

- Onboarding léger (présentation + commencer)
- Création d'une tâche principale
- Découpage automatique en micro‑tâches (template)
- Affichage d'une micro‑tâche à la fois (task flow)
- Marquage d'une sous‑tâche comme complétée
- Progression par tâche (pourcent)
- Tableau de bord : prochaine étape + stats rapides
- Liste des tâches et détail (réordonnage basique possible)
- Historique des tâches complétées
- Paramètres basiques (notifications, rythme) — stub
- Persistance (MVP) : Supabase/Postgres ou backend minimal
- Tests : unitaires composants + E2E scénario principal

Priorités (pour une version pour demain)

1. Intégrer UI existante en tant que PWA locale (done)
2. Ajouter pages `Dashboard`, `Tasks`, `TaskDetail` (squelette)
3. Ajouter `lib/api.js` stub pour remplacer stockage en mémoire
4. Mettre à jour README et docs d'arborescence
5. (Optionnel) Connecter à Supabase pour persistance rapide
