# Drecio Admin — console ops (`drecio-web-admin`)

App Next.js dédiée à l’admin. Même backend FastAPI (`/v1/admin/*`).

## Périmètre

- Vue d’ensemble (comptes)
- Utilisateurs (rôles)
- **Système** (sous-menus) :
  - État
  - Modèles IA
  - Fonctionnalités (photo / vidéo on-off)
  - Prompts
- Réglages admin

Pas de suivi des articles, générations ni paiements — ça reste côté studio vendeur.

## Dev

```bash
cd drecio-web-admin
pnpm install
pnpm dev
```

Ouvre [http://localhost:3001](http://localhost:3001).

Prérequis : FastAPI `:8000`, compte `role=admin`, CORS avec `http://localhost:3001`.
