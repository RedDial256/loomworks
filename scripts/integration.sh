#!/usr/bin/env bash
# Integration test: fresh Expo project -> loom init (theme + useThemeMode) -> loom add background box text spinner divider card field text-field date-time-input input switch debounce boolean pressable timeout button (+ a11y, capitalize, skeleton, reduced-motion) -> tsc + lint.
# Usage: scripts/integration.sh [sdk] [workdir]   (build the CLI first: pnpm --filter @red_dial/loom build)
set -euo pipefail

SDK="${1:-58}"
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

# `text` pulls `skeleton` and `reduced-motion`, `button` pulls `capitalize`; the lint step fails if their folders are missing.
echo "::group::loom add background box text spinner divider card field text-field date-time-input input switch debounce boolean pressable timeout button"
node "$LOOM" add background box text spinner divider card field text-field date-time-input input switch debounce boolean pressable timeout button
echo "::endgroup::"

# Expo writes this on the first `expo start`; the template does not typecheck without it.
echo '/// <reference types="expo/types" />' > expo-env.d.ts

# The SDK 58 template's own `app-tabs.web.tsx` fails tsc (expo-router's TabTrigger slot vs RN 0.88's strict `Pressable` ref), so it is left out.
cat > tsconfig.check.json <<'JSON'
{ "extends": "./tsconfig.json", "exclude": ["node_modules", "src/components/app-tabs.web.tsx"] }
JSON

echo "::group::tsc --noEmit"
npx tsc --noEmit -p tsconfig.check.json
echo "::endgroup::"

# Only the files loom wrote: the template itself fails `expo lint` (react-hooks/set-state-in-effect on SDK 57).
echo "::group::expo lint"
npx expo lint src/theme src/components/background src/components/box src/components/text src/components/skeleton src/components/divider src/components/card src/components/field src/components/text-field src/components/date-time-input src/components/input src/components/switch src/components/spinner src/utils/a11y src/utils/capitalize src/hooks/reduced-motion src/hooks/debounce src/hooks/boolean src/components/pressable src/hooks/timeout src/components/button index.ts babel.config.js || { node -e '
const ru=require(require.resolve("@expo/require-utils",{paths:[require.resolve("expo/package.json")]}));
const r=ru.resolveFrom(process.cwd(),"eslint",{skipNodePath:false});console.log("DEBUG resolved",r);
try{const m=ru.loadModuleSync(r);console.log("DEBUG keys",Object.keys(m));}catch(e){console.log("DEBUG load error",e);}
console.log("DEBUG exts",Object.keys(require("module")._extensions));
'; ls node_modules/eslint; exit 1; }
echo "::endgroup::"

echo "Integration test passed (SDK $SDK) in $APP"
