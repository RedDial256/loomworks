# ADR 0007: Visual proof in PRs

- Status: Proposed. The agent workflow is pending its first real run; the CI run below was done on PR #104.
- Date: 2026-11-12
- Issue: #69 (T33 spike)

PRs that touch components or the template app showed only unit tests. The goal is screenshots, and short recordings for interactions, of the sandbox (`templates/app`) on iOS and Android, light and dark, on the PR itself.

## Findings

Stack: Expo SDK 58, React Native 0.88.1.

The app needs no coordinates to be driven: every screen has a deep link (`loom://sandbox`, `loom://sandbox/<id>`, from `scheme` in `app.json`), and the theme mode starts at `system`, so the device appearance picks the theme.

### Candidates

| Tool | iOS | Android | Runs where | Driving | Fit |
| --- | --- | --- | --- | --- | --- |
| [agent-device](https://incubator.callstack.com/agent-device/docs/commands) (Callstack, MIT) | Simulator, device | Emulator, device | The developer's machine (macOS for iOS); CI through `.ad` replays | CLI any agent can call: `open <url>`, `settings appearance light\|dark`, `screenshot`, `record start\|stop`, accessibility refs (`@e5`) | **Chosen**: one CLI for both platforms, theme and deep links built in, no MCP setup. [Expo documents it](https://docs.expo.dev/agents/agent-device/) |
| [Argent](https://argent.swmansion.com) (Software Mansion) | Simulator, device | Emulator, device | macOS host; CI through Argent Cloud ($299/month per runner) | MCP server and CLI for an agent; opens deep links | Works for the same job (used for ADR 0004); proprietary binaries, and its docs do not cover appearance or screenshots to files. Fallback |
| [screenmap](https://github.com/aleqsio/screenmap) (MIT) | Simulator | **No** ("Android is not yet supported") | GitHub Action on macOS runners | Argent flows plus deep links; optional LLM agent | iOS only, and a CI job again. Rejected |
| [Maestro](https://docs.maestro.dev) | Simulator | Emulator | macOS for iOS, Linux for Android; local and CI | YAML flows | Run end to end in CI (below). Rejected for PRs |

### Tried: every demo in CI with Maestro

A workflow on PR #104 built the app on GitHub runners and took every demo, light and dark, on both platforms, then posted the table as a PR comment. It worked, but:

- It took about 20 min on Linux and 60 min on macOS per push (free on this public repository, ten times the Linux rate on a private one), mostly native builds without a cache.
- It captured every page of every demo, while a PR changes a few. The reviewer had to find the relevant screens in 100+ images.
- It needed many workarounds, each found by a failed run: Maestro's `setDarkMode` did not reach the app, the Android image showed a "Pixel Launcher isn't responding" dialog over it, the first link after launch could stay on Home, iOS asked "Open in Loom?" for each link and sometimes late, and the iOS driver, an app launch and an emulator image download each failed once.
- Scrolled pages and `Spinner` never matched between runs (first pages did), so the images could not be diffed byte for byte anyway.

What carries over: deep links plus the device appearance reach every screen in both themes; images for a PR live best on an orphan branch, so the comment can show them inline without touching `main`.

## Decision

- The agent that does a ticket adds the visual proof: it picks the screens the PR changes, captures them with agent-device on the iOS simulator and Android emulator in both themes (recordings for interactions), checks them, and posts one PR comment. The steps are the [`visual-proof` skill](../../.claude/skills/visual-proof/SKILL.md).
- `scripts/visual-proof/publish.mjs` pushes the captures to `pr-<n>/<sha>/` on the orphan `visual-proof` branch and prints the comment table.
- It runs where the simulators are: the developer's Mac. A cloud session without them asks the user to run it there.
- No CI job. T41 (accessibility audit) uses the same skill.
