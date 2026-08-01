#!/usr/bin/env bash
set -euo pipefail

echo "=== LOUSHA Build Script ==="

# 1. Prisma: push schema to DB & generate client
echo "[1/5] Prisma db push + generate..."
npx prisma db push --skip-generate
npx prisma generate

# 2. Next.js build (produces .next/standalone/)
echo "[2/5] Next.js build..."
npx next build

# 3. Copy static assets into standalone
echo "[3/5] Copy static assets..."
cp -r .next/static .next/standalone/.next/

# 4. Copy public directory into standalone
echo "[4/5] Copy public directory..."
cp -r public .next/standalone/

# 5. Copy Prisma engine & client into standalone (CRITICAL for production)
echo "[5/5] Copy Prisma files into standalone..."

# prisma/schema.prisma
mkdir -p .next/standalone/prisma
cp prisma/schema.prisma .next/standalone/prisma/

# node_modules/.prisma/client (generated client)
mkdir -p .next/standalone/node_modules/.prisma
cp -r node_modules/.prisma/client .next/standalone/node_modules/.prisma/

# node_modules/@prisma/client (wrapper)
mkdir -p .next/standalone/node_modules/@prisma
cp -r node_modules/@prisma/client .next/standalone/node_modules/@prisma/

# @prisma/engines — library engine binary (needed at runtime)
if [ -d "node_modules/@prisma/engines" ]; then
  mkdir -p .next/standalone/node_modules/@prisma/engines
  cp -r node_modules/@prisma/engines/* .next/standalone/node_modules/@prisma/engines/
fi

# .prisma/client/libquery_engine-* (engine binary bundled with client)
# This is often the actual engine file that Prisma loads at runtime
if ls node_modules/.prisma/client/libquery_engine-* 1>/dev/null 2>&1; then
  cp node_modules/.prisma/client/libquery_engine-* .next/standalone/node_modules/.prisma/client/
fi

# 6. Sync upload files to public/uploads in standalone
echo "[6/5] Sync upload files..."
if [ -d "upload" ]; then
  mkdir -p .next/standalone/public/uploads
  cp -r upload/* .next/standalone/public/uploads/ 2>/dev/null || true
  mkdir -p public/uploads
  cp -r upload/* public/uploads/ 2>/dev/null || true
fi

echo "=== Build complete ==="
