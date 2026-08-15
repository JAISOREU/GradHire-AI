#!/bin/sh
set -e

echo "Waiting for database to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=60
until /app/node_modules/.bin/prisma db execute --stdin <<'SQL' > /dev/null 2>&1; do
  SELECT 1;
SQL
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "Database did not become ready in time"
    exit 1
  fi
  echo "Database not ready yet... (attempt $ATTEMPTS/$MAX_ATTEMPTS)"
  sleep 2
done

echo "Database is ready. Checking for failed migration recovery..."
if /app/node_modules/.bin/prisma migrate status 2>&1 | grep -q '20260815001346_add_job_ingestion.*failed'; then
  echo "Resolving failed migration 20260815001346_add_job_ingestion..."
  /app/node_modules/.bin/prisma migrate resolve --applied 20260815001346_add_job_ingestion 2>/dev/null || true
fi

echo "Running database migrations..."
/app/node_modules/.bin/prisma migrate deploy

echo "Starting backend server..."
node dist/main.js
