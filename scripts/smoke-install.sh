#!/usr/bin/env bash
# Dry-run `shadcn add` for every registry item into a scratch consumer
# project, so a dependency the CLI cannot resolve fails CI instead of a
# customer's install.
#
#   scripts/smoke-install.sh local          # built r/ served on localhost (PRs)
#   scripts/smoke-install.sh github <ref>   # logo-dev/logo-api/<item>#<ref>
#
# Local mode rewrites our logo-dev/logo-api/<item> dependencies to the
# localhost copy. Without that, the CLI resolves them from main — a #ref on
# the requested item does not carry to its dependencies — and a PR would
# test main's dependency graph instead of its own.
#
# STYLE picks the consumer's components.json style (default: new-york).
set -euo pipefail

MODE="${1:-local}"
REF="${2:-main}"
STYLE="${STYLE:-new-york}"
SHADCN="${SHADCN:-shadcn@latest}"
PORT="${PORT:-4873}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT

items() {
  node -e 'for (const i of require(process.argv[1]).items) console.log(i.name)' \
    "$ROOT/registry.json"
}

if [[ "$MODE" == "local" ]]; then
  mkdir -p "$WORK/r"
  for file in "$ROOT"/r/*.json; do
    sed "s#\"logo-dev/logo-api/\\([a-z-]*\\)\"#\"http://127.0.0.1:$PORT/\\1.json\"#g" \
      "$file" >"$WORK/r/$(basename "$file")"
  done
  (cd "$WORK/r" && exec python3 -m http.server "$PORT" --bind 127.0.0.1 \
    >/dev/null 2>&1) &
  SERVER_PID=$!
  disown "$SERVER_PID"
  for _ in $(seq 1 50); do
    curl -sf "http://127.0.0.1:$PORT/registry.json" >/dev/null && break
    sleep 0.1
  done
  if ! curl -sf "http://127.0.0.1:$PORT/registry.json" >/dev/null; then
    echo "Local registry server did not start on port $PORT" >&2
    exit 1
  fi
fi

APP="$WORK/app"
mkdir -p "$APP/app" "$APP/lib"
cat >"$APP/package.json" <<'JSON'
{ "name": "smoke-app", "private": true,
  "dependencies": { "next": "*", "react": "*", "react-dom": "*" } }
JSON
cat >"$APP/tsconfig.json" <<'JSON'
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./*"] } } }
JSON
echo '@import "tailwindcss";' >"$APP/app/globals.css"
cp "$ROOT/lib/utils.ts" "$APP/lib/utils.ts"
cat >"$APP/components.json" <<JSON
{
  "\$schema": "https://ui.shadcn.com/schema.json",
  "style": "$STYLE",
  "rsc": true,
  "tsx": true,
  "tailwind": { "css": "app/globals.css", "baseColor": "neutral",
                "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": { "components": "@/components", "utils": "@/lib/utils",
               "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
}
JSON

failed=0
for item in $(items); do
  if [[ "$MODE" == "local" ]]; then
    source="http://127.0.0.1:$PORT/$item.json"
  else
    source="logo-dev/logo-api/$item#$REF"
  fi
  if output=$(cd "$APP" && npx -y "$SHADCN" add "$source" --dry-run --yes 2>&1); then
    echo "ok    $item"
  else
    echo "FAIL  $item ($source)"
    echo "$output" | sed 's/^/      /'
    failed=1
  fi
done
exit "$failed"
