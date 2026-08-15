#!/bin/sh
set -e

echo "Waiting for database to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=60
until node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$connect()
  .then(() => {
    console.log('DB_OK');
    process.exit(0);
  })
  .catch((e) => {
    console.log('DB_NOT_READY:', e.message);
    process.exit(1);
  });
" > /dev/null 2>&1; do
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
