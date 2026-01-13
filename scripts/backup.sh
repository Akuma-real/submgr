#!/usr/bin/env bash
set -euo pipefail

# 配置
DB_PATH="${DB_PATH:-./data/submgr.db}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_REPO="${BACKUP_REPO:-}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

DATE=$(date +%Y%m%d_%H%M%S)
SNAP="${BACKUP_DIR}/submgr_${DATE}.db"
GZ="${SNAP}.gz"

mkdir -p "$BACKUP_DIR"

# 1. 一致性快照
echo "Creating snapshot..."
sqlite3 "$DB_PATH" ".backup '${SNAP}'"

# 2. 压缩
echo "Compressing..."
gzip -c "$SNAP" > "$GZ"
rm "$SNAP"

echo "Backup created: $GZ"

# 3. 推送到私有仓库（如果配置了）
if [[ -n "$BACKUP_REPO" && -d "$BACKUP_REPO" ]]; then
  echo "Pushing to backup repo..."
  cp "$GZ" "$BACKUP_REPO/"
  cd "$BACKUP_REPO"
  git add .
  git commit -m "backup: ${DATE}" || true
  git push || echo "Push failed, will retry next time"
fi

# 4. 清理旧备份
echo "Cleaning old backups (>${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "submgr_*.db.gz" -mtime +${RETENTION_DAYS} -delete

echo "Done."
