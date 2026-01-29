# Architecture — Step by Step (prototype)

Stack recommandé pour le MVP
- Frontend : React + Vite (PWA-friendly)
- Backend/BDD/Auth : Supabase (Postgres géré + Auth + Realtime) — permet prototype rapide
- Tests : Jest + React Testing Library (unit), Playwright (E2E)
- CI/CD : GitHub Actions -> déploiement Vercel (frontend)

Structure du repo
- `src/` : application React (composants, pages)
- `db/` : migrations SQL (init)
- `docs/` : diagrammes, architecture, MCD

Principaux endpoints (si backend custom)
- `POST /auth/sign-up`, `POST /auth/sign-in`
- `GET /projects`, `POST /projects`
- `GET /projects/:id/tasks`, `POST /tasks`, `PATCH /tasks/:id`
- `POST /subtasks`, `PATCH /subtasks/:id`
- `POST /sessions` (start), `PATCH /sessions/:id` (end)

Note rapide : le prototype livré ici est un frontend autonome (données en mémoire). Pour persister, on peut :

1. Connecter le frontend à Supabase (client JS) et utiliser `db/001_init.sql` comme référence de schéma.
2. Ou créer un backend Node/Express minimal qui expose les endpoints ci‑dessus et utilise Postgres.
