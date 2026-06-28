#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# DR Backup & Restore Drill (T084a)
# Creates a full system backup and documents the restore procedure
# ============================================================

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/${TIMESTAMP}"
PG_DATABASE="${PG_DATABASE:-meter_pulse}"
PG_HOST="${PG_HOST:-127.0.0.1}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-postgres}"
SKIP_PG="${SKIP_PG:-false}"

mkdir -p "${BACKUP_PATH}"

echo "=== DR Backup Drill: ${BACKUP_PATH} ==="

# Step 1: Database dump (PostgreSQL)
if [ "${SKIP_PG}" != "true" ]; then
  echo "[1/5] Dumping PostgreSQL database ${PG_DATABASE}..."
  PGPASSWORD="${PG_PASSWORD}" pg_dump \
    -h "${PG_HOST}" \
    -p "${PG_PORT}" \
    -U "${PG_USER}" \
    -d "${PG_DATABASE}" \
    --schema=sim_system \
    --no-owner \
    --no-acl \
    --format=custom \
    -f "${BACKUP_PATH}/meter_pulse.dump" 2>&1
  
  # Verify dump
  pg_restore -l "${BACKUP_PATH}/meter_pulse.dump" > /dev/null 2>&1 && \
    echo "  ✅ Database dump verified" || \
    echo "  ⚠️  Dump file may be incomplete"
fi

# Step 2: Copy configuration files
echo "[2/5] Backing up configuration..."
cp -r ./src "${BACKUP_PATH}/src" 2>/dev/null || echo "  ⚠️  No src directory"
cp -r ./prisma "${BACKUP_PATH}/prisma" 2>/dev/null || echo "  ⚠️  No prisma directory"
cp .env "${BACKUP_PATH}/.env" 2>/dev/null || echo "  ⚠️  No .env file"
cp package.json "${BACKUP_PATH}/package.json" 2>/dev/null || echo "  ⚠️  No package.json"

# Step 3: Test results
echo "[3/5] Backing up test results..."
cp -r ./reports "${BACKUP_PATH}/reports" 2>/dev/null || echo "  ⚠️  No reports directory"

# Step 4: Manifest
echo "[4/5] Creating manifest..."
cat > "${BACKUP_PATH}/MANIFEST.md" << EOF
# DR Backup Manifest
**Date:** $(date)
**Database:** ${PG_DATABASE}@${PG_HOST}:${PG_PORT}
**Files:** $(ls -la "${BACKUP_PATH}/" | wc -l)

## Contents
- \`meter_pulse.dump\` — PostgreSQL custom-format dump (sim_system schema)
- \`src/\` — Backend source code
- \`prisma/\` — Prisma schema and migrations
- \`.env\` — Environment configuration
- \`package.json\` — Dependencies manifest

## Restore Procedure
1. Restore database: \`pg_restore -h <host> -p <port> -U <user> -d <database> --schema=sim_system ${BACKUP_PATH}/meter_pulse.dump\`
2. Restore source: \`cp -r ${BACKUP_PATH}/src/* ./src/\`
3. Restore prisma: \`cp -r ${BACKUP_PATH}/prisma/* ./prisma/\`
4. Install deps: \`npm install\`
5. Run migrations: \`npx prisma migrate deploy\`
6. Verify: \`npm run build && npm test\`
EOF

# Step 5: Validation
echo "[5/5] Validating backup..."
BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" 2>/dev/null | cut -f1 || echo "unknown")
echo "  Backup size: ${BACKUP_SIZE}"
echo "  Backup path: $(pwd)/${BACKUP_PATH}"

echo ""
echo "=== DR Backup Complete ==="
echo "To restore, follow instructions in ${BACKUP_PATH}/MANIFEST.md"
