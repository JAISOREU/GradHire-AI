# Gradture — Local Setup Guide

## Problem
Sign in and registration return "Request failed. Please try again." because the backend cannot connect to PostgreSQL.

## Root Cause
PostgreSQL is not installed or running on this machine. The backend requires a PostgreSQL database to handle authentication and all data operations.

## Solution: Install PostgreSQL

### Option A: Install PostgreSQL locally (recommended for development)

1. Download PostgreSQL 16 for Windows:
   https://www.postgresql.org/download/windows/

2. During installation, set a password for the `postgres` superuser (remember it).

3. After installation, open `pgAdmin` or `psql` and create the database:
   ```sql
   CREATE DATABASE gradhire;
   ```

4. Update `backend/.env` with your credentials:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gradhire
   ```

5. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

6. Start the backend:
   ```bash
   cd backend
   npm run start:dev
   ```

7. In a separate terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Option B: Use Docker Desktop

1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/

2. Start Docker Desktop and wait for it to be ready.

3. Run the full stack:
   ```bash
   docker-compose up --build
   ```

This will start PostgreSQL, backend, recommendation service, and frontend automatically.

### Option C: Use a cloud database (Railway/Supabase)

If you don't want to install PostgreSQL locally:

1. Create a PostgreSQL database on Railway or Supabase
2. Copy the connection string
3. Update `backend/.env`:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/gradhire
   ```
4. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
5. Deploy backend to Railway

## Verify Setup

After starting the backend, verify:
```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{"status":"healthy","service":"gradture-backend","version":"0.1.0"}
```

Then try logging in at http://localhost:5173/login
