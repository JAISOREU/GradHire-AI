#!/bin/sh
set -e

echo "Waiting for database to be ready..."
for i in 1 2 3 4 5; do
  if node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$queryRaw\`SELECT 1\`.then(() => {
      console.log('Database is ready');
      process.exit(0);
    }).catch(() => {
      console.log('Database not ready yet, retrying...');
      process.exit(1);
    });
  "; then
    break
  fi
  sleep 3
done

echo "Running database migrations..."
for i in 1 2 3 4 5; do
  if /app/node_modules/.bin/prisma migrate deploy; then
    break
  fi
  echo "Migration attempt $i failed, retrying in 5s..."
  sleep 5
done

echo "Starting backend server..."
node dist/main.js
