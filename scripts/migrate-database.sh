#!/bin/bash
# Database Migration Script from DigitalOcean to AWS RDS
# This script helps migrate your PostgreSQL database from DigitalOcean to AWS

set -e

echo "========================================="
echo "Database Migration Script"
echo "DigitalOcean -> AWS RDS"
echo "========================================="
echo ""

# Check for required tools
command -v pg_dump >/dev/null 2>&1 || { echo "Error: pg_dump is required but not installed. Install PostgreSQL client tools."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "Error: psql is required but not installed. Install PostgreSQL client tools."; exit 1; }

# Get DigitalOcean database credentials
echo "Enter DigitalOcean PostgreSQL credentials:"
read -p "Host: " DO_HOST
read -p "Port [5432]: " DO_PORT
DO_PORT=${DO_PORT:-5432}
read -p "Database name: " DO_DATABASE
read -p "Username: " DO_USER
read -sp "Password: " DO_PASSWORD
echo ""
echo ""

# Get AWS RDS credentials
echo "Enter AWS RDS PostgreSQL credentials:"
echo "(Get these from: terraform output)"
read -p "Host: " AWS_HOST
read -p "Port [5432]: " AWS_PORT
AWS_PORT=${AWS_PORT:-5432}
read -p "Database name: " AWS_DATABASE
read -p "Username: " AWS_USER
read -sp "Password: " AWS_PASSWORD
echo ""
echo ""

# Create backup directory
BACKUP_DIR="./db-backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

echo "Step 1: Dumping database from DigitalOcean..."
PGPASSWORD="$DO_PASSWORD" pg_dump \
  -h "$DO_HOST" \
  -p "$DO_PORT" \
  -U "$DO_USER" \
  -d "$DO_DATABASE" \
  --no-owner \
  --no-acl \
  -F plain \
  -f "$BACKUP_FILE"

echo "✓ Database backup saved to: $BACKUP_FILE"
echo ""

echo "Step 2: Restoring database to AWS RDS..."
PGPASSWORD="$AWS_PASSWORD" psql \
  -h "$AWS_HOST" \
  -p "$AWS_PORT" \
  -U "$AWS_USER" \
  -d "$AWS_DATABASE" \
  -f "$BACKUP_FILE"

echo "✓ Database restored successfully!"
echo ""

echo "========================================="
echo "Migration Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify data in AWS RDS"
echo "2. Update your application to use new RDS endpoint"
echo "3. Test thoroughly before switching DNS"
echo "4. Keep DigitalOcean backup until you're confident"
echo ""
echo "Backup location: $BACKUP_FILE"
