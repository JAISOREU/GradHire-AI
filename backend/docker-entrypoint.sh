#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until /app/node_modules/.bin/prisma migrate status > /dev/null 2>&1; do
  echo "Database not ready yet..."
  sleep 2
done

echo "Checking for failed migration recovery..."
if /app/node_modules/.bin/prisma migrate status 2>&1 | grep -q '20260815001346_add_job_ingestion.*failed'; then
  echo "Resolving failed migration 20260815001346_add_job_ingestion..."
  /app/node_modules/.bin/prisma migrate resolve --applied 20260815001346_add_job_ingestion 2>/dev/null || true
fi

echo "Running database migrations..."
/app/node_modules/.bin/prisma migrate deploy

echo "Starting backend server..."
node dist/main.js
