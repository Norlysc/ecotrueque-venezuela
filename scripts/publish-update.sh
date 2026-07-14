#!/bin/bash
set -e
echo "🌿 Publicando actualización OTA..."
npx tsc --noEmit
npm test -- --passWithNoTests
eas update --branch production --message "$(git log -1 --pretty=%B)" --platform all
echo "✅ Actualización publicada"
