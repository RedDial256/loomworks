---
name: visual-proof
description: Attach screenshots (and short recordings for interactions) of the affected sandbox screens, iOS and Android, light and dark, to a PR that changes packages/ui or templates/app. Use before asking for review on such a PR.
---

# Visual proof for a PR

Why this way, and what was tried first: [ADR 0007](../../../docs/adr/0007-visual-proof.md).

Needs a Mac with Xcode (iOS simulator) and an Android emulator. A session without them (a cloud container) asks the user to run this on their machine.

## 1. Pick the screens

Only what the PR changes, not every demo:

- `packages/ui/src/components/<name>/`: the demos that render it. The ids are in `templates/app/src/sandbox/demos.ts`; search the `*.demo.tsx` files for the component to find demos that use it inside another one.
- `packages/ui/src/theme/`: the `theme-*` demos, plus one or two component demos that show the change.
- `templates/app/src/`: the screens of the changed files (home, sandbox grid, demo screen).
- State that only shows after an action (pressed, focused, an error, an open picker): drive the app there, or record it.

## 2. Run the app

```sh
pnpm bootstrap
cd templates/app
LANG=en_US.UTF-8 npx expo run:ios
npx expo run:android   # needs ANDROID_HOME in the shell
```

`expo run` may rewrite `app.json`; do not commit that.

Use [agent-device](https://incubator.callstack.com/agent-device/docs/commands) (`npm i -g agent-device`; `agent-device doctor`). [Argent](https://argent.swmansion.com) also works if it is set up.

## 3. Capture

Every screen goes straight to its deep link, so no tapping through menus:

```sh
agent-device settings appearance light --platform ios
agent-device open "loom://sandbox/button" --platform ios
agent-device screenshot shots/ios/light/button.png --platform ios
```

- Repeat per screen, per theme (`light`, `dark`) and per platform (`ios`, `android`).
- The device appearance sets the theme only while the app's theme mode is `System`. A device can keep `Light` or `Dark` saved from an earlier run: open `loom://` (Home) and `agent-device press 'text="System"'` first.
- iOS asks "Open in “Loom”?" on the first link: `agent-device alert accept --platform ios`.
- A LogBox toast can cover the first shot of a development build: `agent-device react-native dismiss-overlay`, then retake.
- Press by selector, not by ref (refs such as `@e9` go stale after one press). Add the role when a label matches twice: `press 'role=switch label="Dark mode"'`.
- Name each file `shots/<platform>/<theme>/<screen>.png`. The screen name says what it shows: `button`, `button-pending`, `input-error`.
- Long demos: scroll to the changed section rather than taking every page.
- Interactions: `agent-device record start shots/<platform>/<theme>/<screen>.mp4`, act, `agent-device record stop` (run it again if it times out). Keep them short, delete the `*.gesture-telemetry.json` it leaves, and check the clip with `agent-device record contact-sheet <mp4> --out <png>`.
- Look at every capture before publishing: wrong screen, a system dialog over the app, or the wrong theme mean a retake.

## 4. Publish

```sh
node scripts/visual-proof/publish.mjs shots <pr-number> > comment.md
```

It pushes the files to `pr-<n>/<sha>/` on the orphan `visual-proof` branch (never `main`), with the checkout's `core.sshCommand` if it has one, and prints a table for the PR comment. Post the comment as the same GitHub account that owns that key. Post it as one comment and, on later pushes, edit that comment instead of adding new ones. Delete `shots/` and `comment.md` afterwards; they are not committed.
