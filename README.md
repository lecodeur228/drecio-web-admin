# Drecio Admin — console ops (`drecio-web-admin`)

App Next.js dédiée à l’admin. Même backend FastAPI (`/v1/admin/*`).

## Périmètre

- Vue d’ensemble (comptes)
- Utilisateurs (rôles)
- **Système** (sous-menus) : état, modèles IA, fonctionnalités, placements, prompts
- Finance
- Réglages admin

## Dev

```bash
cd drecio-web-admin
pnpm install
pnpm dev
```

Ouvre [http://localhost:3001](http://localhost:3001).

Prérequis : FastAPI `:8000`, compte `role=admin`, CORS avec `http://localhost:3001`.

## Déploiement Vercel

Repo GitHub : [`lecodeur228/drecio-web-admin`](https://github.com/lecodeur228/drecio-web-admin) — **Root Directory** = vide (`.`).

1. Vercel → **Add New Project** → importer `lecodeur228/drecio-web-admin`.
2. Framework : Next.js · Install / Build via `vercel.json`.
3. Variables : copie [`.env.vercel.example`](./.env.vercel.example) (Production + Preview).
4. Point crucial :
   ```
   FASTAPI_URL=https://drecio-fastapi-2f683991.fastapicloud.dev
   ```
5. Après le 1er deploy, mets `NEXT_PUBLIC_APP_URL` (admin) et `NEXT_PUBLIC_SELLER_APP_URL` (studio).
6. Ajoute l’origine admin dans `CORS_ORIGINS` côté FastAPI Cloud (voir README studio).
7. Sur **Supabase** → Redirect URLs : `https://ADMIN.vercel.app/auth/callback`.
