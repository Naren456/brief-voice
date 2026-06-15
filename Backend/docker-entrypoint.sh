#!/bin/sh
set -e

mkdir -p /app/data /app/uploads
npx prisma db push --skip-generate

exec "$@"
