#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma@6.16.2 db push --accept-data-loss

echo "Starting backend server..."
npm start
