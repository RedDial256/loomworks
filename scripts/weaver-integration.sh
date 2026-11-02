#!/usr/bin/env bash
# Integration test: weaver --yes (template, tooling, install, loom init + add, git) -> tsc + lint + format check.
# Usage: scripts/weaver-integration.sh [workdir]   (build first: pnpm --filter @red_dial/loom --filter @red_dial/create-weaver build)
set -euo pipefail

WORKDIR="${1:-$(mktemp -d)}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEAVER="$ROOT/packages/create-weaver/dist/bin.mjs"
APP="$WORKDIR/weaver-app"

[ -f "$WEAVER" ] || { echo "Missing $WEAVER; build loom and weaver first." >&2; exit 1; }
export CI=1
# What `npm create` sets; weaver installs with the package manager named here.
export npm_config_user_agent="npm/$(npm --version) node/$(node --version)"
git config --global user.name >/dev/null || export GIT_AUTHOR_NAME=weaver GIT_AUTHOR_EMAIL=weaver@example.com GIT_COMMITTER_NAME=weaver GIT_COMMITTER_EMAIL=weaver@example.com

echo "::group::weaver --yes"
node "$WEAVER" "$APP" --yes
echo "::endgroup::"

cd "$APP"
echo "::group::tsc --noEmit"
npx tsc --noEmit
echo "::endgroup::"

echo "::group::eslint"
npx eslint . --max-warnings 0
echo "::endgroup::"

echo "::group::prettier --check"
npx prettier --check .
echo "::endgroup::"

[ -z "$(git status --porcelain)" ] || { git status --short; echo "Uncommitted files after weaver" >&2; exit 1; }
echo "Weaver integration test passed in $APP"
