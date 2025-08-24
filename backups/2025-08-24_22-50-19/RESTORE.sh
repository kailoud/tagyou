#!/bin/bash

# TagYou System Restore Script
# This script restores the backup to the main directory

echo "🔄 TagYou System Restore Script"
echo "================================"

# Check if we're in the backup directory
if [[ ! -f "BACKUP_SUMMARY.md" ]]; then
    echo "❌ Error: Please run this script from the backup directory"
    echo "Usage: cd backups/2025-08-24_22-50-19 && ./RESTORE.sh"
    exit 1
fi

# Confirm restore
echo "⚠️  WARNING: This will overwrite existing files in the main directory"
read -p "Are you sure you want to restore? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Get the parent directory (main project directory)
MAIN_DIR="$(dirname "$(dirname "$(pwd)")")"

echo "📁 Restoring to: $MAIN_DIR"

# List of critical files to restore
CRITICAL_FILES=(
    "index.html"
    "script.js"
    "styles.css"
    "avatar-system.js"
    "supabase-config-secret.js"
    "supabase-auth-service.js"
    "admin-panel.html"
    "admin-panel.js"
    "tagyou-data-service.js"
    "carnivals-table.sql"
    "package.json"
    "netlify.toml"
)

# Restore critical files
echo "📋 Restoring critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        cp "$file" "$MAIN_DIR/"
        echo "✅ Restored: $file"
    else
        echo "⚠️  Warning: $file not found in backup"
    fi
done

echo ""
echo "✅ Restore completed!"
echo "📁 Files restored to: $MAIN_DIR"
echo ""
echo "🔧 Next steps:"
echo "1. Test the application: open http://localhost:3000"
echo "2. Check authentication functionality"
echo "3. Verify admin panel: open http://localhost:3000/admin-panel.html"
echo ""
echo "📖 See BACKUP_SUMMARY.md for system details"
