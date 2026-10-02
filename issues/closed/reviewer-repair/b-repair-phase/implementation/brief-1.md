# Brief 1: check.repair command routing, counting and tests (U1)

## 1. Goal

Add phase `check.repair` (slot B) to the akrogon command. A `fix` review aggregate goes to `check.repair` without counting. Only `check.repair -> check.fix` counts against `fix_rounds` and is capped. Plan decisions D1, D2, D3, D4, D11.

## 2. Numbered acceptance criteria

1. `src/routing.ts`: the `phaseSchema` enum has `'check.repair'` right after `'check.review'`. `check.review.next` is `['merge', 'check.repair', 'failed']`. There is a new entry `'check.repair': { skill: 'check-issue', slots: ['B'], next: ['merge', 'check.fix', 'failed'] }`. `failed.next` includes `'check.repair'` (insert it after `'check.review'`). `requiredSlots` is unchanged, so `check.review` needs only B when `fix_rounds > 0`.
2. `src/phase.ts`:
   - When all required `check.review` verdicts are recorded and any is `fix`, the destination is `check.repair`. Otherwise it is `merge`.
   - `commitMove` increments `fix_rounds` only when `to === 'check.fix' && recorded.phase === 'check.repair'`.
   - Cap: a `check.fix` request from `check.repair` while `state.fix_rounds >= repo.config.fix_rounds` moves to `failed` with failure `{ cause: 'attempts', phase: 'check.repair', slot: <slot, which is B>, reason: 'fix rounds exhausted' }`.
   - Moves to `check.fix` from `merge` or from `failed` stay uncounted and uncapped, as today.
3. `skills/watch-issues/scripts/observe.ts`: its local `phaseSchema` enum gets `'check.repair'` right after `'check.review'`. Nothing else in that file changes.
4. Tests in `tests/phase.test.ts`:
   - Rewrite the test at line 93, "review aggregates verdicts, rechecks only B, caps repairs and permits operator restart" (config `fix_rounds: 1`). New title, for example "review fix routes to check.repair, B hands to A, rechecks only B, caps handoffs and permits operator restart". It asserts this sequence:
     1. A `merge --verdict nits` gives `recorded`.
     2. B `check.repair --verdict fix` gives `moved check.repair`, with `fix_rounds` 0.
     3. `merge --slot A` is refused (non-zero exit) and B `merge`/`check.fix` stays possible.
     4. B `check.fix` gives `moved check.fix`, with `fix_rounds` 1.
     5. A `check.review` gives exit 0.
     6. An A `merge --verdict ready` is refused, because only B re-checks.
     7. B `check.repair --verdict fix` gives `moved check.repair`, with `fix_rounds` still 1.
     8. B `check.fix` (with the fakeHerdr env) gives `moved failed`, with `failure` matching `{ cause: 'attempts', phase: 'check.repair', slot: 'B', reason: 'fix rounds exhausted' }` and `fix_rounds` 1.
     9. Operator recovery to `implement` keeps `fix_rounds` 1.
     10. Keep the merge-origin `conflict`/`capped` assertions unchanged, since they stay uncounted.
     11. The first log line now matches `{ from: 'check.review', to: 'check.repair', slot: 'B', verdict: { A: 'nits', B: 'fix' }, fix_rounds: 0 }`. Keep the other existing log fields the test asserts, such as `session: null`, adjusted only where the route changed.
   - Add to that test or a new small test:
     - A leaf in `check.repair` gets B `merge`, giving `moved merge` with `fix_rounds` unchanged.
     - A leaf in `failed` (no `--slot`) recovers to `check.repair`, giving `moved check.repair`.
   - Change the test at line 1098, "fix cap records attempts failure": the leaf starts in `check.repair` with `fix_rounds: 1`, and the command is `['phase', 'cap', 'check.fix', '--slot', 'B']` with no verdict. Expect `moved failed` and failure `{ cause: 'attempts', phase: 'check.repair', slot: 'B', reason: 'fix rounds exhausted', delivery: 'shown' }`.
   - Add `{ phase: 'check.repair', slot: 'A' }` to the wrong-seat table at about line 1287.
5. Test in `tests/next.test.ts`, test at line 1765, "merge, check.fix and post-repair review dispatch to their swapped seats":
   - Add a step that sets the state to `phase: 'check.repair', prompted: {}`, resets the panes to idle the same way the other steps do, runs `next`, and expects the last prompt to equal `{ pane: state.pane.B!, text: \`check-issue post-repair slot=B phase=check.repair leaf=${path}\` }`.
   - Update the title to include check.repair, and update the final pane-order assertion to include the new prompt.
6. `bun run typecheck` passes, and `bun test tests/phase.test.ts tests/next.test.ts` passes.

## 3. Read-first list

- `src/routing.ts` (whole file, 44 lines).
- `src/phase.ts:87-131` (`commitMove`, increment at line 107) and `:170-246` (`transition`, aggregation at 226-231, cap at 232-245).
- `skills/watch-issues/scripts/observe.ts:6-16`.
- `tests/phase.test.ts:93-130`, `:825-840`, `:1098-1117`, `:1287-1305`.
- `tests/next.test.ts:1765-1810`.
- `tests/helpers.ts` for `fixture`, `leaf`, `cli`, `fakeHerdr` and `yaml`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

Pattern to copy: the existing review test at `tests/phase.test.ts:93` for the cli/readState assertion style.

## 4. Change list and needed interfaces

- `src/routing.ts`: enum, `check.review.next`, new `check.repair` route, `failed.next`.
- `src/phase.ts`:
  - Line 107: `fix_rounds: to === 'check.fix' && recorded.phase === 'check.repair' ? recorded.fix_rounds + 1 : recorded.fix_rounds`.
  - Line 229: `'check.fix'` becomes `'check.repair'`.
  - Cap: `destination === 'check.fix' && state.phase === 'check.repair' && state.fix_rounds >= repo.config.fix_rounds`.
  - The failure literal's `phase` becomes `'check.repair'`.
- `skills/watch-issues/scripts/observe.ts`: add the enum entry.
- `tests/phase.test.ts` and `tests/next.test.ts`: as in criteria 4 and 5.
- Interfaces:
  - Seat review fix finish: `akrogon phase <slug> check.repair --slot <A|B> --verdict fix`.
  - B's finishes: `merge --slot B` and `check.fix --slot B`.
  - `check.repair` takes no `--verdict`. The existing guard at `src/phase.ts:214` already forbids it.
  - The dispatch prompt is built generically at `src/next.ts:460`, so do not edit `src/next.ts`.
- Owned paths: `src/routing.ts`, `src/phase.ts`, `skills/watch-issues/scripts/observe.ts`, `tests/phase.test.ts`, `tests/next.test.ts`.
- Must land first: nothing.
- Shared test resource: none (local fixture repos only).

## 5. Do-not, reasons and exceptions

- Do not edit `src/next.ts`, `src/state.ts`, `src/status.ts` or any skill prose and docs. Dispatch is generic, and other units own the prose.
- Do not add a state field. The design locks "no new state field".
- Do not change `merge` routing or the `merge -> check.fix` uncounted behavior. The design excludes it.
- Do not change `requiredSlots`. The B-only re-check already follows from `fix_rounds >= 1`.
- Do not add prose or wording assertions. Assert stdout `moved <phase>`/`recorded`, exit codes, state fields and log fields only. A lesson shows wording tests couple behavior to prose.

Reasons and exceptions: these exclusions keep this unit to the locked design. If a test elsewhere in the suite breaks because it assumed the old route, fix that test only if it is in your owned files. Otherwise return a mismatch with evidence instead of editing it. The exception is a revised brief from A.

## 6. Ordered steps

1. Edit the tests first (criteria 4 and 5) and run them to see them red: `bun test tests/phase.test.ts tests/next.test.ts`.
2. Edit `src/routing.ts` (criterion 1).
3. Edit `src/phase.ts` (criterion 2).
4. Edit `observe.ts` (criterion 3).
5. Run the tests to green, then `bun run typecheck` and `bun run format`.
6. Run the changed-test command below, then commit your chunk with a message like `b-repair-phase u1: check.repair phase routing and counting`, with no co-author line.

Advisory size: 5 files, under 25 turns.

## 7. Commands

`AKROGON_BASE=6ab5e82b6cee3986ce635fdae406f6440a92956d bash -c ': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"'`

## 8. Done-when, evidence and report

Done when every criterion above holds and the commands are green. Paste the results. Scenarios use the temporary fixture repos from `tests/helpers.ts`, with herdr faked at one boundary.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
