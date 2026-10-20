# Intake: state-unknown-keys

## Scope

One leaf's unreadable or extended `state.yaml` no longer stops akrogon commands for other leaves.

Part of a six-chart pass opened 2026-10-18 over seeds #102-#108; sibling charts: paid-proof-bounds, merge-stacks, owner-completion, state-unknown-keys, criterion-outcomes, sync-identical-ignored. No dependency between them.

## Provenance

- GitHub: Tamdoma/akrogon#102
- Operator: 2026-10-18 chart-issues invocation
- Operator: 2026-10-18 split round answer

## Source: operator 2026-10-18 invocation

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## Source: operator 2026-10-18 split round

> 1a | 2a | 3a | 4a

Round answered 2026-10-18: 1a fold #103 and #108 into one chart; 2a order #107, #104, #103+#108, #102, #105, #106; 3a leave the two flaky tests out; 4a no framework replay-resume chart now.

## Source: Tamdoma/akrogon#102

# One leaf state.yaml with unknown keys makes every akrogon command fail for the whole repo

Source: Tamdoma/akrogon#102
URL: https://github.com/Tamdoma/akrogon/issues/102

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

In the framework repo, seat A of leaf `shown-prop-coverage` added two unknown keys to its own `state.yaml` during `implement` (lines 30-33):

```
reported: true
notes:
  - 'slot A plan: binding-prop resolution moves to _shared/libraries/binding-resolution; ...'
```

After that every akrogon command in the repo (`status`, `next`, `phase`, `config`, `run-check`) failed with `ZodError`, `unrecognized_keys`, keys `reported` and `notes`, path `[]`.

Other leaves were stopped by it. Seat B of `upgrade-replay` could not run `akrogon config`, `akrogon run-check`, or its handoff `akrogon phase upgrade-replay check.fix --slot B`. Each exited 1 with the same error (`issues/closed/test-paths-with-spaces/upgrade-replay/upgrade-replay/review-B.md:58-60` in the framework repo).

After the operator removed the keys, `akrogon next --all` prompted the same leaf again. The seat added the keys back, and the whole repo broke a second time.

## Location

akrogon leaf state loading: `src/state.ts` (`readState`, `leavesUnder`, `allLeaves`) in release `~/.akrogon/releases/9e0df5b049fdcbe71bdd85d55e28d2955f9c2595`. Leaf: `issues/open/forms-wiring/shown-prop-coverage/shown-prop-coverage/state.yaml` in Tamdoma/tamdoma-framework.

## Reproduction

1. Add an unknown top-level key to any leaf's `state.yaml` under `issues/open` or `issues/closed`.
2. Run any akrogon command for a different leaf in the same repo.

Seen twice on 2026-10-17/18. The second time came from re-prompting the same seat with `next --all`.

## Expected behavior

One leaf's bad `state.yaml` does not stop commands for other leaves, and a seat cannot leave `state.yaml` in a state that akrogon refuses to read.

## Urgency

High while it happens: every leaf in the repo stops, including merges and handoffs, and a watch cannot dispatch anything. Workaround: the operator removes the keys by hand, runs `akrogon phase shown-prop-coverage implement --slot A`, and avoids `next --all` until the seat is past the step that writes the keys.

## Suspected cause

Supported hypothesis:

- **Main condition:** `allLeaves` (`src/state.ts:153`) loads every leaf under `issues/open` and `issues/closed` through `leavesUnder` -> `readState` (`src/state.ts:117-129`). `readState` parses with `stateSchema`, which is a `z.strictObject` (`src/state.ts:76-77`). Its only allowance is a hard-coded skip of `priority`, `slot`, `failed_notified` and `solo`. Because of that, one unknown key in one leaf throws for every command that builds the inventory.
- **Contributing condition:** a seat can write `state.yaml` directly. Nothing stopped seat A from adding `reported` and `notes`. Re-prompting the seat repeated the same write.

Whose view: both. The reporter saw the repo-wide failure. The agent traced the strict parse.

Files read:
- `src/state.ts:76-160` in the installed release `~/.akrogon/releases/9e0df5b0…`. This is an installed copy, not the akrogon source checkout. Its link to `/home/ivan/Work/infra/akrogon` HEAD was not verified.
- The leaf `state.yaml`.
- `upgrade-replay/review-B.md`.

Not inspected:
- Why the seat wrote those keys. The seat transcript and the implement skill text were not read.
- Whether another guard (hook or permission) is meant to stop seats from writing `state.yaml`.

Related reports: none found. Searched Tamdoma/akrogon, all states:
- `--author @me` created since 2026-10-16, limit 30: #95-#101, none cover this.
- Keyword queries "unrecognized_keys state.yaml", "state.yaml schema", "unknown keys leaf" and "ZodError", limits 8-10. Only #14 came back. It covers state-field hygiene, a different defect.

## Agent findings

Opening map merged with attribution: issues/chart/paid-proof-bounds/slots/map-merged.md, sections for #102.
