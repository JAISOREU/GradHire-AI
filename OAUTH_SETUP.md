# OAuth Setup Guide

This document explains how to configure Google, GitHub, and LinkedIn OAuth for the Gradture application.

## Environment Variables

Create or update `backend/.env` with the following variables:

```bash
# OAuth — Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth — GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# OAuth — LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Backend URL (for OAuth callbacks)
BACKEND_URL=http://localhost:3000
```

**Important:**
- Never commit `.env` to Git. Use `.env.example` for placeholders only.
- OAuth client secrets are **server-side only**. Do not expose them through `VITE_*` variables.
- In production, set `BACKEND_URL` to your actual backend domain (e.g., `https://api.gradture.com`).

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/v1/auth/oauth/google/callback`
   - Production: `https://your-backend-domain.com/api/v1/auth/oauth/google/callback`
7. Copy the **Client ID** and **Client Secret** to your `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Gradture
   - **Homepage URL**: `http://localhost:5173` (development) or `https://your-frontend-domain.com` (production)
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/oauth/github/callback`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**
6. Add to your `.env`:
   ```bash
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

---

## LinkedIn OAuth Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app or select an existing one
3. Go to **Auth** tab and enable **OAuth 2.0**
4. Add redirect URLs:
   - Development: `http://localhost:3000/api/v1/auth/oauth/linkedin/callback`
   - Production: `https://your-backend-domain.com/api/v1/auth/oauth/linkedin/callback`
5. Request the following permissions (scopes):
   - `openid`
   - `profile`
   - `email`
6. Copy the **Client ID** and **Client Secret** to your `.env`:
   ```bash
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

---

## Frontend Routes

The OAuth flow uses these frontend routes:

- **`/login`** — Login page with OAuth buttons
- **`/register`** — Registration page with OAuth buttons
- **`/auth/callback`** — OAuth callback handler (processes success/error and redirects)

---

## OAuth Flow

1. User clicks "Continue with Google/GitHub/LinkedIn" on the login or register page
2. Frontend calls `POST /api/v1/auth/oauth/{provider}` to get the authorization URL
3. Frontend redirects the user to the provider's authorization page
4. User authorizes Gradture
5. Provider redirects to `http://localhost:3000/api/v1/auth/oauth/{provider}/callback?code=...&state=...`
6. Backend exchanges the code for tokens and fetches user info
7. Backend finds or creates the Gradture user
8. Backend sets auth cookies and redirects to `/auth/callback?success=true`
9. Frontend reads the success parameter and refreshes the auth session
10. User is redirected to their dashboard

---

## Security Notes

- OAuth state is validated to prevent CSRF attacks
- Client secrets are never exposed to the frontend
- OAuth identities are stored separately from the core user record
- Existing accounts with matching verified emails are linked safely
- Token rotation and secure HTTP-only cookies are used for sessions

---

## Testing

1. Start the backend server: `cd backend && npm run start:dev`
2. Start the frontend server: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/login` or `http://localhost:5173/register`
4. Click any OAuth button and complete the authorization flow
5. Verify you are redirected back to the app and logged in

---

## Troubleshooting

- **"Invalid or expired OAuth state"**: Ensure the backend can set cookies (check `secure`/`sameSite` settings for your domain)
- **"OAuth authorization failed"**: Verify the client ID/secret and callback URL in the provider's dashboard
- **Redirect loops**: Check that `BACKEND_URL` matches the actual backend URL
- **CORS errors**: Ensure `CORS_ORIGIN` in backend `.env` includes your frontend URL
