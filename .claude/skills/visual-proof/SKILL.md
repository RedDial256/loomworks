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
npx expo run:android
```

Use [agent-device](https://incubator.callstack.com/agent-device/docs/commands) (`npm i -g agent-device`; `agent-device doctor`). [Argent](https://argent.swmansion.com) also works if it is set up.

## 3. Capture

Every screen goes straight to its deep link, so no tapping through menus:

```sh
agent-device settings appearance light --platform ios
agent-device open "loom://sandbox/button" --platform ios
agent-device screenshot shots/ios/light/button.png --platform ios
```

- Repeat per screen, per theme (`light`, `dark`) and per platform (`ios`, `android`). The theme mode starts at `system`, so the device appearance sets it.
- Name each file `shots/<platform>/<theme>/<screen>.png`. The screen name says what it shows: `button`, `button-pending`, `input-error`.
- Long demos: scroll to the changed section rather than taking every page.
- Interactions: `agent-device record start shots/<platform>/<theme>/<screen>.mp4`, act, `agent-device record stop`. Keep them short.
- Look at every capture before publishing: wrong screen, a system dialog over the app, or the wrong theme mean a retake.

## 4. Publish

```sh
node scripts/visual-proof/publish.mjs shots <pr-number> > comment.md
```

It pushes the files to `pr-<n>/<sha>/` on the orphan `visual-proof` branch (never `main`) and prints a table for the PR comment. Post it as one comment and, on later pushes, edit that comment instead of adding new ones. Delete `shots/` and `comment.md` afterwards; they are not committed.
