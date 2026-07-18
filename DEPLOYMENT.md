# Deployment Guide

The React frontend and Express backend are separate applications. Deploy them independently and connect them through environment variables.

## Local development

1. Copy `frontend/.env.example` to `frontend/.env` and provide the three browser-safe values.
2. Copy `backend/.env.example` to `backend/.env` and provide the Supabase backend credentials.
3. Start the API from `backend` with `npm run dev`.
4. Start Vite from `frontend` with `npm run dev`.
5. Open `http://localhost:5173`. The API normally runs at `http://localhost:3000`.

## Frontend environment variables

- `VITE_SUPABASE_URL`: the Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the browser-safe publishable/anonymous key.
- `VITE_API_BASE_URL`: the deployed Express API prefix, including `/api/v1`.

Vite embeds all `VITE_*` values in the browser bundle. Never place `SUPABASE_SERVICE_ROLE_KEY`, passwords, or other backend secrets in frontend variables.

## Backend environment variables

Use the values documented in `backend/.env.example`. Production requires:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGIN`, containing one or more comma-separated trusted frontend origins

Do not add a trailing slash to CORS origins. The configuration normalizes accidental trailing slashes, but explicit canonical URLs are easier to audit.

## Build and start commands

Frontend:

```sh
cd frontend
npm ci
npm run test:run
npm run build
npm run preview
```

Publish `frontend/dist` on a static host. `frontend/vercel.json` supplies a React Router fallback for Vercel.

Backend:

```sh
cd backend
npm ci
npm test
npm start
```

The backend starts with `node src/server.js`. Configure the platform health check to use `/health`.

## Production checks

1. Confirm the frontend uses the production API URL and Supabase project.
2. Confirm `CORS_ORIGIN` lists only the deployed frontend origins; never use `*` for this authenticated API.
3. Add the deployed frontend URL to the Supabase authentication URL configuration.
4. Sign in with viewer, analyst, and admin test accounts.
5. Verify viewer can only read vehicles, analyst can create/edit/estimate, and admin can also delete.
6. Refresh `/dashboard` and `/vehicles` directly to verify SPA routing.
7. Confirm a signed-out API request returns 401 and a disallowed role receives 403 without being signed out.
8. Inspect browser logs and network responses to ensure no access token, password, or service-role key is printed.

## Smoke testing

Use [`SMOKE_TEST_CHECKLIST.md`](SMOKE_TEST_CHECKLIST.md) for the local production, preview, authentication, RBAC, CRUD, estimation, CORS, secret-exposure, and post-deployment checks. Complete the automated tests and build first, then record manual checks separately for every deployed environment.

## Security reminders

- Supabase manages browser session persistence. The application does not write tokens to custom storage keys.
- Every protected API request obtains the current session and sends `Authorization: Bearer <access-token>`.
- Frontend role checks improve navigation only; Express remains the authorization authority.
- A backend 401 signs the browser session out safely. A 403 displays a permission error without signing the user out.
- Rotate any credential that is accidentally committed or exposed in logs.
