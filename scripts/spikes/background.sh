#!/usr/bin/env bash
# T31 spike app (ADR 0004): fresh SDK 58 app -> loom init -> loom add box text -> spike screen as the only route -> tsc.
# Usage: scripts/spikes/background.sh [workdir]   (build the CLI first: pnpm --filter @red_dial/loom build)
# Then, in the app: npx expo run:ios / npx expo run:android (development build; Expo Go does not run Unistyles).
set -euo pipefail

WORKDIR="${1:-$(mktemp -d)}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOOM="$ROOT/packages/cli/dist/bin.mjs"
APP="$WORKDIR/background-spike"

[ -f "$LOOM" ] || { echo "Missing $LOOM; build the CLI first." >&2; exit 1; }
export CI=1

npx -y create-expo-app@5.0.0 "$APP" --template default@sdk-58 --yes
cd "$APP"
node "$LOOM" init
node "$LOOM" add box text

# Only the spike route: drop the template's tabs and screens.
rm -rf src/app src/components/app-tabs*.tsx
mkdir -p src/app
cp "$ROOT/scripts/spikes/background/index.tsx" src/app/index.tsx
cat > src/app/_layout.tsx <<'TSX'
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
TSX

echo '/// <reference types="expo/types" />' > expo-env.d.ts
npx tsc --noEmit

echo "Spike app ready in $APP"
