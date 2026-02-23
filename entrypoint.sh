#!/bin/sh
set -e

echo "🔄 Running Prisma db push..."
node /app/node_modules/prisma/build/index.js db push --skip-generate

echo "✅ Database ready. Starting app..."
exec node server.js
