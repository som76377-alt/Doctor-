# Doctor — Clinic Website

A clean, mobile-first foundation for a professional clinic website. The repository starts intentionally minimal: no demo theme, decorative icon pack, sample patient data, or unapproved clinic branding.

## Stack

- **Astro 7 + TypeScript** — fast, content-first website foundation
- **Tailwind CSS 4** — utility styling through the official Vite plugin
- **Supabase JS** — prepared client foundation for authentication and database access
- **Prettier + Astro plugin** — consistent formatting
- **GitHub Actions** — automatic type/framework checks and production builds on pushes and pull requests

## Current status

The initial project structure and clean placeholder homepage are committed. This is a foundation, not a live clinic booking or login system. Google OAuth, appointment workflows, database schema and access policies, custom domain, deployment, and real clinic content still require configuration and testing.

## Requirements

- Node.js 22.22 or newer (Node 22 LTS recommended)
- npm

## Start locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` if/when a Supabase project is created.
3. Start the development server: `npm run dev`
4. Run framework and TypeScript checks: `npm run check`
5. Create a production build: `npm run build`
6. Preview the build: `npm run preview`

## Environment variables

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Only Supabase's public/publishable key belongs in browser-facing variables. **Never put a service-role/secret key in a `PUBLIC_` variable or commit credentials.** The client is not active until valid project values are provided.

## Safety and launch gates

Before accepting real appointments:

- Create a database schema with unique/transaction-safe slot booking rules.
- Enable and test Supabase Row Level Security for every table containing patient or appointment information.
- Configure Google OAuth, authorized origins, callback URLs, and allowed redirects.
- Add clear consent, privacy notice, retention rules, and a process for access/correction/deletion requests as applicable.
- Do not collect detailed medical histories or sensitive clinical information in a basic public contact form.
- Test keyboard access, screen readers, mobile layouts, error states, duplicate bookings, time zones, cancellation, and staff permissions.
- Configure a production domain, HTTPS, backups, and monitoring.

No credentials or real patient data should be committed to this public repository.
