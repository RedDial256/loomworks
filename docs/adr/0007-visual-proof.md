# ADR 0007: Visual proof in PRs

- Status: Proposed, backed by the runs on PR #104.
- Date: 2026-11-10
- Issue: #69 (T33 spike)

PRs that touch components or the template app showed only unit tests. The goal is screenshots of the sandbox (`templates/app`) on iOS and Android, light and dark, on the PR itself.

## Findings

Stack: Expo SDK 58, React Native 0.88.1, Maestro CLI (latest at the run), GitHub-hosted `ubuntu-latest` and `macos-latest` (Xcode 26.6) runners.

The app needs no coordinates and no agent to be driven: every screen has a deep link (`loom://sandbox`, `loom://sandbox/<id>`, from `scheme` in `app.json`), and the theme mode starts at `system`, so the device appearance picks the theme.

### Candidates

| Tool | iOS | Android | Runs where | Driving | Fit |
| --- | --- | --- | --- | --- | --- |
| [Maestro](https://docs.maestro.dev) | Simulator | Emulator | macOS for iOS; Linux or macOS for Android; local and CI | YAML flows: `openLink`, `tapOn` by text, `swipe` in percent, `takeScreenshot`, `startRecording` | **Chosen** for CI: one flow for both platforms, no LLM in the loop |
| [Argent](https://argent.swmansion.com) (Software Mansion) | Simulator, device | Emulator, device | macOS host (Xcode); CI through Argent Cloud ($299/month per runner) | An agent through MCP; tests recorded and replayed | Kept for local, agent-driven checks (used for ADR 0004). Not for per-PR CI: macOS host and the paid cloud |
| [agent-device](https://github.com/callstackincubator/agent-device) (Callstack, MIT) | Simulator, device | Emulator, device | Node 22.12+; local, and CI by replaying `.ad` scripts | Accessibility tree refs (`@e5`), coordinates as fallback; exports Maestro YAML | Same niche as Argent for local agent work; its CI path ends in Maestro anyway. Not run |
| [screenmap](https://github.com/aleqsio/screenmap) (MIT) | Simulator | **No** ("Android is not yet supported") | macOS only; GitHub Action | Argent flows plus deep links; optional LLM agent explores the rest | Closest to the goal (sticky comment, before/after diff), but iOS only and wants an EAS simulator build per PR. Not run |

Only Maestro was run end to end. The others are compared from their docs (linked); the Argent row also draws on its use in ADR 0004.

### The run (Maestro on GitHub Actions)

`.github/workflows/visual-proof.yml` on PR #104:

- Android, `ubuntu-latest`: `expo prebuild`, `assembleRelease` for `x86_64` (12 to 16 min, no cache), API 35 emulator through `reactivecircus/android-emulator-runner` with KVM, Maestro (6 to 12 min with the emulator boot). About 20 min in all.
- iOS, `macos-latest` (iPhone 17 Pro simulator, iOS 26.4): `expo prebuild` and a Release simulator build with `xcodebuild` (about 30 min, no cache), simulator boot (3 to 5 min), Maestro (about 22 min). About 60 min in all.
- Report, `ubuntu-latest`: publishes the PNGs under `pr-<n>/<sha>/` on the orphan branch `visual-proof` and keeps one sticky PR comment with a table per demo (iOS and Android, light and dark). Under a minute.

The repository is public, so standard runners, macOS included, cost no minutes ([GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). On a private repository macOS minutes bill at ten times the Linux rate.

What did not work, and the fix:

- Maestro saves `takeScreenshot` files under `~/.maestro/tests/<run>/<flow>/takeScreenshot/`, not next to the flow or in the working directory. The workflow copies them from there.
- Maestro's `setDarkMode` did not reach the app: iOS stayed light and Android stayed dark. The workflow sets the appearance itself (`xcrun simctl ui <udid> appearance`, `adb shell cmd uimode night`) and runs one flow per theme.
- The API 35 Google APIs image showed "Pixel Launcher isn't responding" over the app, which also swallowed the scroll. The workflow disables the launcher and sets `hide_error_dialogs`.
- A link sent right after `launchApp` landed on Home (Android), and the first link of a run could leave Home only after the screenshot (iOS). The flow waits for the tab bar, then for the Home text to go.
- iOS asks "Open in Loom?" for a custom scheme link, sometimes only after a delay, which shifted every later screenshot by one screen. The flow waits up to 4 s for the prompt on iOS and taps `Open`.
- Once each, outside the app: the iOS driver missed Maestro's default start timeout (raised with `MAESTRO_DRIVER_STARTUP_TIMEOUT`), an Android launch failed after the night mode switch (the launch is retried), and the emulator image download came back corrupt ("Error on ZipFile unknown archive"; a re-run passed).
- Each link pushes a screen, so the iOS back button shows the previous demo's title. Cosmetic; left as is.

### Stable output

Runs of the same app code, compared pixel by pixel, with a slow `swipe` (75% to 25% of the height in 1.5 s) between pages:

- iOS dark: 24 of 33 screenshots matched. The others: the three `Spinner` pages (it always spins, by design) and scrolled pages of `Button`, `Input`, theme colors and the grid.
- Android light and dark: every first page matched apart from the status bar clock and the fading scroll indicator at the right edge; scrolled pages of `Input`, theme colors and the grid moved by a few dozen pixels. Animations are off in the emulator, so `Spinner` and `Skeleton` matched.
- Maestro's `scroll`, used before the swipe, flung further and varied more.

Scrolled pages are the weak spot: a swipe is a gesture, not a scroll offset. A fixed offset would need a hook in the app (for example a `scrollTo` from a link parameter), which the template should not carry for CI alone.

So byte equality is not the bar. A reviewer reads the table, and compares with an earlier push of the PR when needed: each push keeps its own folder on the `visual-proof` branch.

## Decision

- Maestro, in `.github/workflows/visual-proof.yml`, on every PR that touches `packages/ui`, `templates/app` or the workflow, and on demand. Fork PRs get the workflow artifacts but no comment, as they get no write token.
- `scripts/visual-proof/flow.mjs` writes the flow from `templates/app/src/sandbox/demos.ts`, so `loom add` needs no edit here; `report.mjs` drops repeated scroll pages and writes the comment.
- Images live on the orphan `visual-proof` branch, never on `main`, so the comment can show them inline; the workflow artifacts keep them too.
- Locally, an agent checks a change with Argent (or agent-device) on the developer's simulator and emulator; the same Maestro flow also runs locally (`maestro test`) when a reviewer wants the CI screenshots without CI.
- T41 (accessibility audit) takes its screenshots from this comment.

Not done, for later tickets: build caching (Gradle, CocoaPods, DerivedData, the emulator image) or reusing T38's EAS simulator build, which would cut most of the iOS hour; a run on `main` to diff against; pruning old `pr-<n>` folders; short recordings (`startRecording`) for interactions.
