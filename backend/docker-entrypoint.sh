#!/bin/sh
set -e

echo "Running database migrations..."
/app/node_modules/.bin/prisma migrate deploy

echo "Starting backend server..."
npm start
