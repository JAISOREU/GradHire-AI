#!/bin/sh
set -e

echo "Syncing database schema..."
/app/node_modules/.bin/prisma db push --accept-data-loss

echo "Starting backend server..."
npm start
