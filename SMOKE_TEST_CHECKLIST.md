# Deployment Smoke Test Checklist

Use this checklist before a release and immediately after deployment. Replace all example domains with the actual deployment URLs. Never paste access tokens, passwords, Supabase service-role keys, or other secrets into this file, screenshots, issue comments, terminal history, or browser console output.

## 1. Backend local production smoke test

From `backend`, use a local `.env` containing valid backend-only configuration. In PowerShell:

```powershell
$env:NODE_ENV = "production"
npm start
```

In a second terminal, check the public and protected responses:

```powershell
Invoke-RestMethod http://localhost:3000/health

try {
  Invoke-RestMethod http://localhost:3000/route-that-does-not-exist
} catch {
  $_.ErrorDetails.Message
}

try {
  Invoke-RestMethod http://localhost:3000/api/v1/vehicles
} catch {
  $_.ErrorDetails.Message
}
```

- [ ] `npm start` runs `node src/server.js` and the server starts successfully.
- [ ] `/health` returns HTTP 200 with `status`, `environment`, `uptime`, and `timestamp`.
- [ ] The unknown route returns HTTP 404 with a safe JSON response.
- [ ] `/api/v1/vehicles` without a bearer token returns HTTP 401.
- [ ] Neither error response contains a stack trace, internal Supabase message, raw error object, file path, or secret.
- [ ] Stop the server and clear the temporary override with `Remove-Item Env:NODE_ENV`.

## 2. Frontend build smoke test

From `frontend`, configure browser-safe production values and run:

```powershell
npm run test:run
npm run build
```

- [ ] The test suite passes.
- [ ] The production build completes without errors.
- [ ] `dist/` is created and remains ignored by Git.
- [ ] Build output does not display secrets.

## 3. Frontend preview smoke test

From `frontend`, after a successful build:

```powershell
npm run preview
```

- [ ] Vite prints a local preview URL, normally `http://localhost:4173/`.
- [ ] The preview URL loads the application shell.
- [ ] Directly opening `/login`, `/dashboard`, and `/vehicles` does not produce a static-host 404.
- [ ] Browser developer tools show no uncaught errors.

## 4. Authentication smoke test

- [ ] A valid development-only test user can sign in.
- [ ] Invalid credentials show a safe message and do not reveal Supabase internals.
- [ ] The dashboard loads after successful authentication.
- [ ] Refreshing a protected page keeps a valid session.
- [ ] Logout clears the session and returns to the login flow.
- [ ] An invalid or expired session redirects safely without a redirect loop.
- [ ] No password or access token appears in the UI or console logs.

## 5. RBAC smoke test

Use separate non-production accounts for each role.

- [ ] Viewer: can list/view vehicles and sees no create, edit, estimate, or delete controls.
- [ ] Analyst: can create, edit, and estimate, but cannot delete.
- [ ] Admin: can create, edit, estimate, and delete.
- [ ] Calling a forbidden backend operation directly returns HTTP 403 even if the UI control is hidden.
- [ ] Changing a role-like request body, query value, or header does not elevate permissions.

## 6. Vehicle CRUD smoke test

Use a disposable smoke-test vehicle record.

- [ ] Create accepts valid make, model, and year data.
- [ ] List displays the new record.
- [ ] View returns the correct record.
- [ ] Edit persists an allowed change.
- [ ] Invalid data returns a safe validation response.
- [ ] Admin delete removes the disposable record only after confirmation.
- [ ] Requesting the deleted record returns HTTP 404.

## 7. Price estimation smoke test

- [ ] Analyst or admin can open the estimate form.
- [ ] Default estimate options produce a result.
- [ ] Explicit valid costs/rates produce a result and visible breakdown.
- [ ] Invalid negative values are rejected safely.
- [ ] The updated estimated import cost and selling price persist after refresh.
- [ ] Viewer cannot call the estimate endpoint successfully.

## 8. CORS smoke test

Production `CORS_ORIGIN` accepts a comma-separated allowlist, for example:

```text
CORS_ORIGIN=https://frontend-domain.com,https://preview-domain.com
```

- [ ] The deployed frontend origin receives the expected `Access-Control-Allow-Origin` header.
- [ ] Each intentionally configured preview origin is allowed.
- [ ] An unconfigured origin receives no allow-origin header.
- [ ] Production does not use `*` and does not silently fall back to localhost.
- [ ] Origins use their canonical scheme and host, without paths or trailing slashes.

## 9. Secret exposure checklist

- [ ] No `.env` or `.env.*.local` file is tracked by Git.
- [ ] Only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_API_BASE_URL` are supplied to the frontend.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists only in backend secret storage.
- [ ] Example environment files contain placeholders only.
- [ ] Frontend source, `dist/`, browser storage inspection, UI, console, and network responses contain no service-role key or password.
- [ ] Production API errors contain no stack, raw error object, internal Supabase message, or server file path.
- [ ] Any credential accidentally exposed during testing is rotated before release.

## 10. Post-deployment smoke test checklist

- [ ] `/health` is reachable over HTTPS and reports the production environment.
- [ ] The frontend is reachable over HTTPS and calls the intended HTTPS API URL.
- [ ] Login, refresh persistence, logout, and expired-session handling work.
- [ ] Dashboard and vehicles pages load, including direct URL refreshes.
- [ ] Viewer, analyst, and admin permissions match the RBAC checklist.
- [ ] Disposable vehicle create, edit, estimate, and admin delete work.
- [ ] Allowed and denied CORS origins behave as expected.
- [ ] Hosting logs and browser tools contain no secrets or unexpected errors.
- [ ] Monitoring uses `/health`, and the production process restarts cleanly when tested through the hosting platform.
