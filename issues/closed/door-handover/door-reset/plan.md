# Plan: door-reset

Debate: no — synthesis from brief + design + live surfaces.

## Acceptance criteria (from brief)

- **C1** Live run per kind (claude, codex, pi): two handed items on one autopilot door A; after the first chart A creates the second chart folder (INTAKE.md + CHART.md with mode record), appends the `handover` entry to every handed open chart, runs the helper, ends its turn; with no operator input the same pane/process holds a new session, appends `continue autopilot (handover <time>)` with its own session id and starts the second chart. Layout/pane ids unchanged. For claude, a second fresh session without the start prompt asks the operator.
- **C2** Helper exits non-zero and sends nothing when the pane's agent is not claude/codex/pi or the session differs from the one A passed.
- **C3** Reset sent only after the kind's proven turn end (claude `turn_duration`, codex `task_complete`/`turn_aborted` of the last `task_started`, pi hook authority idle/done); nothing sent when still open at the bound or when the session changed; the case is logged.
- **C4** Start prompt only after a different session appears; codex gets one harmless check prompt first; unconfirmed reset is logged and no start prompt is sent.
- **C5** A stalled start/check prompt is logged as failure; every step is one line in the log named by the `handover` entry; no step is retried.
- **C6** Skill rules, mode-record shape and chart guide describe the handover step, both new entries, supported kinds and "handover queued" footer; attended-mode text otherwise unchanged.

## Decisions

- **D1 Two-process helper.** `door-reset.ts` parent validates pane kind + session, refuses non-zero with nothing sent and no log, then spawns itself detached (stdout/stderr appended to `<log>`), prints `queued`, exits 0. Child runs the step sequence synchronously when env `DOOR_RESET_INLINE=1` — this is how the tests drive the full child logic in-process; production runs detached. Steps stop at first failure, each writes one JSON line (`step`, `result`, context) to the log.
- **D2 Turn-end readers reused, not duplicated.** Export `claudeTurnOpen`, `codexRollout`, `codexEnded`, `piAuthority` from `peer-wait.ts` (currently private) — no behavior change. For the helper, codex "turn ended" = rollout of the passed session shows `task_complete`/`turn_aborted` for the last `task_started` after a byte boundary taken at helper start; pi = `piAuthority(row)` and status not `working`; claude = `!claudeTurnOpen(session)`.
- **D3 Bounds via env.** `DOOR_RESET_TURN_BOUND_MS` (default 600_000) and `DOOR_RESET_CONFIRM_MS` (default 60_000), poll ~1 s. Tests set small bounds to exercise open-turn and unconfirmed-reset exits without sleeps.
- **D4 Prompt contracts.** Reset command (`/clear` claude, `/new` codex+pi) and codex check prompt are sent as plain `herdr agent prompt <pane> <text>` — instant commands that must not require `working`. Start prompt uses `--wait --until working --timeout 5000`; a `timeout`/`agent_prompt_stalled` failure is logged `prompt_stalled` and stops the child. This requires relaxing fake-herdr's prompt contract (D5).
- **D5 fake-herdr extension.** `agent prompt` accepts prompts without wait flags (the flag check applies only when `--wait` is passed); `promptScript` entries accept `session` (and optionally `agent_status`) so a reset effect is applied to the db and visible in `agent list`. Minimal, additive.
- **D6 Skill guide additions.** SKILL.md `## Autopilot` gains the handover paragraph (when it triggers, folder creation, the appended entry format, helper run, fresh-A matching rule `latest mode entry = handover`, `continue autopilot (handover <time>)`, supported kinds, fell-back-to-attended behavior); `## Printed footer` gains `Next: none handover queued to a fresh A in <pane>` for the handover pass end. shapes.md mode-record line gains the two new entry forms + a paragraph. docs/guide/chart.md `## Autopilot` gains a short handover paragraph. Attended text untouched.
- **D7 Codex check prompt.** Fixed harmless text asking for no chart work (e.g. "Reply OK") — its only job is exposing the new session; it is not the start prompt and is never retried.
- **D8 Seats record.** Fresh A's new session produces a second `seat: A` entry (same pane) appended when herdr shows the session — existing rule covers it; no code change, verified live in C1.

## Read-first

- `skills/chart-issues/scripts/peer-wait.ts` — turn-end readers to export (D2)
- `skills/chart-issues/scripts/peer-ask.ts` — prompt contract and exchange seeding conventions
- `tests/fake-herdr.ts`, `tests/peer-wait.test.ts` — fake db shape, waitScript/promptScript, HOME fixture pattern
- `issues/chart/door-handover/slots/reset-probe/proto.ts` — prior-art child flow (prototype, not product)
- `skills/chart-issues/SKILL.md` `## Autopilot` + `## Printed footer`, `skills/chart-issues/assets/shapes.md` mode record, `docs/guide/chart.md` `## Autopilot`

## Interface

```
bun skills/chart-issues/scripts/door-reset.ts <A pane> <A session> <log> <start prompt>
env: DOOR_RESET_INLINE=1 (tests), DOOR_RESET_TURN_BOUND_MS, DOOR_RESET_CONFIRM_MS
```

Child steps (first failure stops, one JSON line each):
1. `wait-turn-end` bound by TURN_BOUND → fail `turn open`
2. `recheck-identity` → fail `identity changed`
3. `send-reset` (`/clear` | `/new`) → fail `reset refused`
4. codex only: `send-check-prompt --wait --until working --timeout 5000`
5. `wait-new-session` bound by CONFIRM → `reset unconfirmed`, stop
6. `send-start-prompt --wait --until working --timeout 5000` → fail `prompt_stalled`

## Checklist

### Wave 1 (2 units, disjoint paths)

- **U1 Helper + tests** — owns `skills/chart-issues/scripts/door-reset.ts`, `skills/chart-issues/scripts/peer-wait.ts` (exports only), `tests/fake-herdr.ts`, `tests/door-reset.test.ts`. Shared test resource: none beyond the file-local fake db. Order inside unit: commit failing tests first, then product code. Covers C2–C5.
- **U2 Docs** — owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. No shared resource, no dependency. Covers C6.

### Wave 2 (1 unit)

- **U3 Live run (C1)** — depends on U1+U2 landed on the leaf branch. Three real harness sessions side by side on one throwaway herdr tab (own scratch repo + log each), driven exactly as the brief states. No owned product paths; shared live resource: operator herdr + harness logins (claude Max, codex, pi) — the only named shared resource, so serial by nature.

## Verification map

| Criterion | Observation | Command | Size | Rerun trigger |
|---|---|---|---|---|
| C2 | non-zero exit, empty log, zero `agent prompt` calls in fake `.calls` for wrong kind / wrong session | `bun test tests/door-reset.test.ts -t "refuses"` | seconds | helper validation change |
| C3 | log `turn open` at bound; `identity changed`; prompts sent only after turn end | `bun test tests/door-reset.test.ts -t "turn"` | seconds | turn-end reader change |
| C4 | `reset unconfirmed` stops before start prompt; codex check-prompt order in `.calls` | `bun test tests/door-reset.test.ts -t "confirm"` | seconds | confirm-flow change |
| C5 | `prompt_stalled` line on stalled start prompt; single attempt per step (no duplicate calls) | `bun test tests/door-reset.test.ts -t "stalled"` | seconds | prompt contract change |
| happy path | all six steps logged, prompts in order (reset → check(codex) → start) | `bun test tests/door-reset.test.ts -t "handover"` | seconds | any step change |
| C6 | literal `handover <time>`, `continue autopilot (handover`, `handover queued` present in the three docs | `bun test tests/door-reset.test.ts -t "docs"` | seconds | wording change |
| C1 | three live panes: new session appended `continue autopilot (handover <time>)` and second chart started; claude fresh session without prompt asks operator | live run per brief (throwaway tab, three harnesses, scratch repos) | hours (operator-visible) | any release-candidate helper/docs change |
| regression | `bun test tests/peer-wait.test.ts` (exports must not change behavior) + `typecheck` | `bun test tests/peer-wait.test.ts && bun run typecheck` | minutes | peer-wait edit |

## Implementation notes

- 2026-10-17 (check.fix F2): the strict C2 rule is restored — the parent refuses non-zero with no log and nothing sent whenever the pane's session differs from the passed one; `heldBefore` is removed. A session change discovered after validation is still caught by the child's `wait-turn-end` identity check and logged `identity changed`.
- 2026-10-17 (check.fix F3): design interface step 4 already requires, after the codex check prompt, a bounded wait for idle or done before `wait-new-session`/`send-start-prompt`; the helper gains a `wait-check-end` step using `herdr agent wait --until idle --until done` bounded by the turn bound. The fake-herdr non-idle prompt guard is restored; a start prompt sent while the check turn is working is rejected.

## Red-test evidence

`tests/door-reset.test.ts` (12 tests) run before the helper exists — `akrogon run-check --name door-reset-red` → `check door-reset-red: 1`, log `implementation/check-door-reset-red-1792257062405-922032.log`: 9 failures for missing helper/docs behavior (C2–C6 happy paths and guards), 3 incidental passes to re-verify at green.

## Affected docs

- Agent docs: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`
- Human docs: `docs/guide/chart.md`
- `skills/chart-issues/assets/questions.md` and README: no change (no handover-related text needed)

## Notes for review

- `merge_checks` empty for this repo; `checks` (format/test/typecheck) run by the leaf's own gates. The brief names no whole-suite requirement; only the targeted files above plus `peer-wait.test.ts` regression.
- Stated limitation carried from design: a one-off harness notice can swallow the start prompt (logged `prompt_stalled`); a turn-end signal that never arrives leaves A untouched and is logged.

## Implementation notes

- 2026-10-17 check.repair F1: specify the start prompt's pane, handover time, next item, absolute chart folder and absolute skill path, and require the fresh session to match that prompt to the latest handover entry before continuing, as required by brief “The fresh A matches the prompt to the latest mode entry” and design decision 3a.
- 2026-10-17 check.repair F4: defer the initial seats.yaml of a next chart pre-created for handover to fresh A on entry, with opened and the first span beginning then, as required by design “Next chart folder”: “The fresh A writes its seats.yaml and opens its first span on entry”.
