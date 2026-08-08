#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma@6.16.2 migrate deploy

echo "Starting backend server..."
npm start
