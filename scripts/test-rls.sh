#!/usr/bin/env bash
# Aplica migrations num banco PostgreSQL descartável e executa os testes SQL/RLS.
# Uso: TEST_DATABASE_URL=postgres://user:pass@host:5432/postgres pnpm test:rls
set -euo pipefail
cd "$(dirname "$0")/.."
ADMIN_URL="${TEST_DATABASE_URL:-postgres://postgres:postgres@localhost:5432/postgres}"
DB="zaniva_rls_test"
TEST_URL="${ADMIN_URL%/*}/$DB"

psql "$ADMIN_URL" -qX -v ON_ERROR_STOP=1 -c "drop database if exists $DB" -c "create database $DB"
trap 'psql "$ADMIN_URL" -qX -c "drop database if exists $DB" >/dev/null' EXIT

run() { psql "$TEST_URL" -qX -v ON_ERROR_STOP=1 -o /dev/null -f "$1" 2>&1 | sed -E "s/^psql:[^ ]+ NOTICE:  //"; return "${PIPESTATUS[0]}"; }
run supabase/tests/00_supabase_shim.sql
for f in supabase/migrations/*.sql; do echo "migration: $f"; run "$f"; done
for f in supabase/tests/0[1-9]*.sql supabase/tests/[1-9]*.sql; do echo "test: $f"; run "$f"; done
echo "ALL RLS/SQL TESTS PASSED"
