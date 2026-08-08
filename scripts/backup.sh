#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER="${CONTAINER:-gradhire-postgres-1}"
DB_NAME="${DB_NAME:-gradhire}"
DB_USER="${DB_USER:-gradhire}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/gradhire_$TIMESTAMP.sql.gz"

echo "Starting backup of $DB_NAME from container $CONTAINER..."
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "Backup saved to $BACKUP_FILE"

find "$BACKUP_DIR" -name "gradhire_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
echo "Cleaned up backups older than $RETENTION_DAYS days"
