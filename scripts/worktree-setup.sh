#!/usr/bin/env bash
# Prepares a checkout (main or a git worktree) for work: installs dependencies and builds the CLI.
# Idempotent: skips steps that are already done. Usage: scripts/worktree-setup.sh [dir] [--quiet]
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
QUIET=0
for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=1 ;;
    *) DIR="$(cd "$arg" && git rev-parse --show-toplevel)" ;;
  esac
done
cd "$DIR"

log() { [ "$QUIET" = 1 ] || echo "$@"; }

# Non-interactive shells (hooks, agents) do not load nvm; pick the version in .nvmrc.
if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  set +u
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh" --no-use
  nvm use --silent >/dev/null || nvm install >&2
  set -u
fi

# node_modules/.modules.yaml is written last by pnpm, so it marks a finished install.
if [ ! -f node_modules/.modules.yaml ]; then
  log "Installing dependencies in $DIR"
  pnpm install --frozen-lockfile --prefer-offline >&2
fi

# integration.sh runs the built CLI.
if [ ! -f packages/cli/dist/bin.mjs ]; then
  log "Building @red_dial/loom"
  pnpm --filter @red_dial/loom build >&2
fi

log "Ready: $DIR"
