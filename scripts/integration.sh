#!/usr/bin/env bash
# Integration test: fresh Expo project -> loom init -> loom add box text spinner (+ a11y, skeleton, reduced-motion) -> tsc + lint.
# Usage: scripts/integration.sh [sdk] [workdir]   (build the CLI first: pnpm --filter @red_dial/loom build)
set -euo pipefail

SDK="${1:-57}"
WORKDIR="${2:-$(mktemp -d)}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOOM="$ROOT/packages/cli/dist/bin.mjs"
APP="$WORKDIR/app"

[ -f "$LOOM" ] || { echo "Missing $LOOM; build the CLI first." >&2; exit 1; }
export CI=1 # non-interactive: conflicts fail instead of prompting

echo "::group::create-expo-app (SDK $SDK)"
npx -y create-expo-app@5.0.0 "$APP" --template "default@sdk-$SDK" --yes
echo "::endgroup::"

cd "$APP"
echo "::group::loom init"
node "$LOOM" init
echo "::endgroup::"

# `text` pulls `skeleton` and `reduced-motion`; the lint step fails if their folders are missing.
echo "::group::loom add box text spinner"
node "$LOOM" add box text spinner
echo "::endgroup::"

# Expo writes this on the first `expo start`; the template does not typecheck without it.
echo '/// <reference types="expo/types" />' > expo-env.d.ts

echo "::group::tsc --noEmit"
npx tsc --noEmit
echo "::endgroup::"

# Only the files loom wrote: the SDK 57 template itself fails `expo lint` (react-hooks/set-state-in-effect).
echo "::group::expo lint"
npx expo lint src/theme src/components/box src/components/text src/components/skeleton src/components/spinner src/utils/a11y src/hooks/reduced-motion index.ts babel.config.js
echo "::endgroup::"

echo "Integration test passed (SDK $SDK) in $APP"
