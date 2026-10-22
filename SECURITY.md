# Security policy

This repository is public. Do not commit passwords, OAuth client secrets, service-role keys, production environment files, real patient records, appointment exports, or other sensitive data.

For any future patient-facing functionality:
- Enforce access in the database/backend, not only in the browser UI.
- Enable and verify Row Level Security on all patient and appointment tables.
- Keep privileged keys server-side only.
- Minimize collected health information and define retention and deletion procedures.
- Test authorization, redirects, session expiry, and booking concurrency before launch.

Please do not report real patient information in public issues.
