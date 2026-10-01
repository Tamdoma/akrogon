# Plan: failed-stop-guard

## Context

An operator stop (`check.fix -> failed`) was undone 0.9s later by a seat's in-flight
`phase <slug> check.review --slot A`. `transition` in `src/phase.ts` skips the slot
check for a failed leaf and `routing.failed.next` allows every active phase, so the
leaf went back to review with a red criterion and `fix_rounds` reset. This leaf adds
a guard: any `akrogon phase` call carrying an explicit `--slot` on a failed leaf is
refused before any state, log, git or herdr effect. Slot-less recovery and entering
`failed` with `--slot` from an active phase are unchanged. Debate is off; this plan
is synthesized directly from the brief and locked design. No brief/design conflict found.

## Decisions

- D1: Guard lives in `transition` (`src/phase.ts`), immediately after the
  merged-terminal check and before the legal-move check. Every explicit-slot call on
  a failed leaf gets the same refusal.
- D2: Guard branches on `explicitSlot` (the parsed `--slot`), not on the inferred
  `slot`. Single-seat inference must neither trigger nor bypass it.
- D3: Guard refuses all requested phases, including `failed` itself. A
  failed-to-failed call with `--slot` gets the guard text, not `Illegal move`.
- D4: Error text is exactly `Leaf is failed. A seat cannot resume it. Operator
  recovery omits --slot after the blocker is resolved.` plus ` Reason: <reason>`
  appended when `state.failure.reason` exists. A failed leaf with no `failure`
  record still refuses with the sentence alone.
- D5: Entering `failed` with `--slot` from an active phase is unchanged.
  Slot-less recovery from `failed` (operator or watch) is unchanged.
- D6: No changes to `commitMove`, `src/routing.ts`, `src/next.ts` failed entries,
  any seat skill, the watch skill, or any file under `issues/`.
- D7: Tests extend `tests/phase.test.ts`; no new test file. Criterion 1 is one
  test with the five listed calls. Criterion 2 is one incident-sequence test that
  fails first on current code.
- D8: Docs add one sentence each in `docs/guide/problems.md` (the `The leaf is
  failed.` section) and `docs/guide/phases.md` (the failed recovery paragraph):
  a call carrying `--slot` cannot move a failed leaf, recovery omits `--slot`.

## Read-first paths

- `src/phase.ts` (transition, guard site after merged check)
- `src/routing.ts` (`routing.failed.next`, `requiredSlots`)
- `src/state.ts` (`failure` optional even in `failed`)
- `tests/phase.test.ts` (existing failed and recovery tests, CLI fixture style)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `fakeHerdr`)
- `tests/fake-herdr.ts` (call log via `<db>.calls`)
- `docs/guide/problems.md`, `docs/guide/phases.md` (insertion points)
- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md` (area context)

## Needed interfaces

- `transition(repo, leaf, requested, explicitSlot, verdict, reason)`: guard reads
  only `state.phase === 'failed'` and `explicitSlot !== undefined`; throws before
  any `saveState`, `logMove`, git check, or herdr call.
- `state.failure?.reason`: optional; missing record still refuses cleanly (D4).
- Test helpers: `leaf(f, slug, 'failed', extra)` builds failed leaves with
  `failure: { cause, phase, slot, reason }` or none; `cli(f, args, f.root,
  herdr.env)` runs the real CLI; `herdrCalls(db)` reads `<db>.calls`;
  `state.yaml` bytes snapshot plus `issues/log.jsonl` bytes snapshot prove no effect.

## Acceptance criteria

- C1: On a failed leaf, `check.review --slot A`, `implement --slot B`,
  `merge --slot B --verdict ready`, one leaf with `failure.cause: attempts`, and
  one failed leaf with no `failure` record each exit non-zero. stderr holds the
  recorded `failure.reason` when present and always the D4 sentence. `state.yaml`
  and `issues/log.jsonl` bytes are unchanged; the fake herdr records no call.
- C2: Real CLI on a fixture leaf at `check.fix`: `phase <slug> failed --slot A
  --reason "x"` prints `moved failed`; then `phase <slug> check.review --slot A`
  exits non-zero and the leaf stays `failed` with `fix_rounds` unchanged.
- C3: Slot-less recovery keeps current behavior; existing recovery tests pass unchanged.
- C4: Entering `failed` with `--slot` from an active phase keeps current behavior;
  existing tests for it pass unchanged.
- C5: `docs/guide/problems.md` and `docs/guide/phases.md` each add one sentence
  per D8.
- C6: Every configured blocking `checks` command passes, including the resolved
  changed-tests command.

## Ordered checklist

1. `src/phase.ts` (C1, C2): add the D1 guard throwing the D4 text. Verify with the
   two new tests below; confirm existing stop and recovery tests still pass.
2. `tests/phase.test.ts` (C1): one test, five failed leaves, one refused call each
   per C1; assert exit code, stderr (sentence plus reason when present), unchanged
   `state.yaml`/`log.jsonl` bytes, and empty `herdrCalls`. Verify with
   `bun test tests/phase.test.ts`.
3. `tests/phase.test.ts` (C2): one test running the C2 sequence through the real
   CLI with herdr env; assert `moved failed`, then non-zero, phase still `failed`,
   `fix_rounds` unchanged. Verify it fails first on current code (second call
   prints `moved check.review`), then passes with the guard.
4. `tests/phase.test.ts` (C3, C4): leave existing recovery and stop tests
   untouched; they must pass as-is. Covers blocked dirty-tree kept, attempts
   dirty-tree refused, issue-file refusal, tab rename back, and stop-with-slot.
5. `docs/guide/problems.md` (C5): append one D8 sentence in `The leaf is failed.`
   after the resume example. Verify by reading; no new links.
6. `docs/guide/phases.md` (C5): append one D8 sentence to the `Failed can resume
   at any active phase` paragraph. Verify by reading; no new links.
7. Blocking checks (C6): run `bun run format`, `bun test`, `bun run typecheck`,
   and the resolved changed-tests command. Verify all exit zero.

## Docs affected

- `docs/guide/problems.md`: human operator guide, add one D8 sentence (C5).
- `docs/guide/phases.md`: human operator guide, add one D8 sentence (C5).
- No agent skill doc is affected; the design excludes skill text changes.

## Proof map

| Criterion | Proof command | Failure it catches | Size | Rerun trigger |
| --- | --- | --- | --- | --- |
| C1 | `bun test tests/phase.test.ts` (new five-call test) | Late seat write with `--slot` resurrects a failed leaf | seconds | `src/phase.ts` or the test changes |
| C2 | `bun test tests/phase.test.ts` (new incident-sequence test) | The observed stop-then-review race moves failed to review | seconds | `src/phase.ts` or the test changes |
| C3 | `bun test tests/phase.test.ts` (existing recovery tests) | Guard breaks slot-less recovery | seconds | Guard edited |
| C4 | `bun test tests/phase.test.ts` (existing stop tests) | Guard blocks entering failed with `--slot` | seconds | Guard edited |
| C5 | Read both guide sections | Operator tries `--slot` recovery on a failed leaf | seconds | Docs edited |
| C6 | `bun run format`, `bun test`, `bun run typecheck`, resolved changed-tests command | Regression outside the touched tests | minutes | Before handoff |

Changed-tests command (resolve `AKROGON_BASE` first):
`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`

## Open limitations

`--slot` states intent, not identity, so a seat omitting it passes. A stop then
deliberate recovery inside one seat pass is not covered. The `fix_rounds` reset on
recovery is out of scope.

## Dependencies

None. Single ordered change; no cross-leaf ordering needed.

## Credentials

The design names no secret variable, so no env presence check is needed.
