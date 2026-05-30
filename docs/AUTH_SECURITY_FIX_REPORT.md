# Frontend Auth Security Fix Report

## Completed changes

1. Google callback page no longer requires `?token=`.
   - It restores the server-set HttpOnly session cookie via `/api/auth/session`.
   - Then it requests `/auth/user` and updates the auth store.
   - Any legacy `?token=` is immediately removed from the browser URL.

2. Facebook callback page received the same hardening.

3. API client no longer calls `/auth/refresh` when there is no known session.
   - This reduces noisy refresh failures on `/login`, `/register`, password pages, and OAuth callback pages.

4. Login and register forms now ignore duplicate submissions while loading.

## Verification

After deployment, OAuth redirects should look like:

```text
/auth/google/callback
/auth/facebook/callback
```

They should not look like:

```text
/auth/google/callback?token=...
/auth/facebook/callback?token=...
```
