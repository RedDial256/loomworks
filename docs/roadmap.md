# Roadmap

Tickets, their scope and blockers live in the [GitHub issues](https://github.com/RedDial256/loomworks/issues) (`TNN: …`). Order follows tracer bullets: one thin end-to-end slice first, then widen.

| Phase | Goal | Tickets |
|---|---|---|
| 0 | Monorepo, Expo compatibility spike, CI | T01 to T03 |
| 1 | Tracer bullet: manifest, `loom init`, `loom add`, `Box` and `Text`, integration test | T04 to T08 |
| 2 | Accessibility and primitives | T09 to T16 |
| 3 | Interactive components | T17 to T23 |
| 4 | Expo SDK 58, template app, `weaver`, demos, `Input` with date and time, `Background` | T24 to T36 |
| 5 | Quality and release | not ticketed |

## Phase 5 outline

- If Expo SDK 59 exists, keep 58 and add 59.
- Accessibility audit once all v1 components exist: VoiceOver and TalkBack per component in the sandbox, WCAG AA contrast for theme roles in both themes, touch targets of at least 44 pt / 48 dp, reduced motion, font scaling. Findings filed as issues.
- Scaffold integration test, Expo SDK matrix and `engines` validation.
- Release pipeline, user docs, first alpha.

## Not in v1

`loom diff`, remote registry, `Modal`/`Sheet`, `Toast`, `Select`, `Checkbox`/`Radio`, lists, template mirror repo.
