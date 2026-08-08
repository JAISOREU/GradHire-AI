#!/usr/bin/env bash
set -euo pipefail

CONTAINER="${CONTAINER:-gradhire-postgres-1}"
DB_NAME="${DB_NAME:-gradhire}"
DB_USER="${DB_USER:-gradhire}"

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring $BACKUP_FILE into $DB_NAME..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER" psql -U "$DB_USER" "$DB_NAME"
echo "Restore complete."
