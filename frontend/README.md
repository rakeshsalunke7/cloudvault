# CloudVault Frontend

Production-style React frontend for the CloudVault Spring Boot backend.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

## Architecture

The frontend talks only to the existing Spring Boot API. It does not use Supabase, Firebase, or a browser-side storage provider.

```text
React / Vite
    |
    v
Spring Boot REST API
    |
    +--> MySQL metadata
    +--> Backblaze B2 file storage
```

## Local setup

1. Make sure the CloudVault Spring Boot backend is running on port `8080`.
2. Copy `.env.example` to `.env` if you need a different API URL.
3. Install dependencies:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

The default frontend URL is `http://localhost:5173`.

## Authentication

Email/password login calls `/api/auth/login` and stores the returned CloudVault JWT locally for the current development architecture.

Google login starts at `/oauth2/authorization/google` and the current backend redirects to `/oauth-success?token=...`. The OAuth callback is isolated in `src/pages/OAuthSuccess.tsx` so it can later be replaced with a one-time-code exchange without changing the rest of the application.

## Implemented frontend areas

- Login / registration
- Google OAuth callback
- Protected routing
- Dashboard
- Files and folders
- Upload with 50 MB validation
- Download and delete
- Filename search
- Sharing and permissions
- Public links
- Shared-with-me view
- Activity timeline
- Storage usage
- File preview for images and PDFs using authenticated downloads
- Light/dark theme
- Responsive desktop/mobile layout
- Loading, empty, error and confirmation states

## Important backend assumptions

The API layer is centralized in `src/api/` so endpoint adjustments are isolated. The current paths follow the CloudVault backend structure built alongside this project, including `/api/auth/*`, `/api/files/*`, `/api/folders`, `/api/shares/*`, and `/api/activity`.

No real secrets belong in the frontend. Only `VITE_API_BASE_URL` should be configured here.
