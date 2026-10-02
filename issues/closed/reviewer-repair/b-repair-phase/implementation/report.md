# Report: b-repair-phase

Base `6ab5e82`. Head `08545ec`. Mode: subagents, one wave of three units (briefs 1-3 in this folder).

## Commits

- `79270f9` u2: `check.repair` section in check-issue.
- `22f5258` u3: check.repair in implement-issue, watch-issues and the guide.
- `659391f` u1: `check.repair` phase routing and counting, with tests.
- `08545ec` A: `skills/check-issue/SKILL.md:57`. The base-run stop now says "creating no repair or merge path" instead of "no path to check.fix or merge". The old wording became stale once a review fix routes to `check.repair`, and `check.repair` points to this paragraph.

## Changed files and reasons

- `src/routing.ts`: `check.repair` added to the enum after `check.review`, with route `{ skill: 'check-issue', slots: ['B'], next: ['merge', 'check.fix', 'failed'] }`. `check.review.next` is now `merge, check.repair, failed`, and `failed.next` gains `check.repair` (D1).
- `src/phase.ts`: a fix aggregate now goes to `check.repair`. The increment and the cap moved to `check.repair -> check.fix`, and the failure records `phase: 'check.repair'` (D2, D3).
- `skills/watch-issues/scripts/observe.ts`: added the `check.repair` enum entry (D4).
- `tests/phase.test.ts`:
  - The review test is rewritten for the new route, B-only re-check, the cap and recovery.
  - New test: `check.repair -> merge` stays uncounted, and `failed -> check.repair` works.
  - The cap test now starts from `check.repair`.
  - The wrong-seat table has a `check.repair`/A entry.
- `tests/next.test.ts`: the swapped-seat dispatch test has a `check.repair` step, prompted to pane B.
- `skills/check-issue/SKILL.md`:
  - The description, prompt line, check.review finish (`check.repair` for fix) and footer routing are updated.
  - The new `## check.repair` section covers: scope, exceptions, `Handed to A`, the operator-actions pointer (D6), fail-first commits, before/after evidence, the base-run pointer, proof plus checks, the `review-B.md` entry, and the two finishes (D5, D7).
- `skills/implement-issue/SKILL.md`: the check.fix input is decided by the newest `review-B.md` entry. A `Handed to A` list limits A to those items, red merge checks are the finding, and otherwise A repairs every recorded Fix (D8).
- `skills/watch-issues/SKILL.md:34`: seat list `check.repair B`.
- `docs/guide/phases.md`: table rows, the fix sentence, the diagram, the recovery sentence and the check-issue repair text (D10).
- `docs/guide/idea.md`: seat table row and the export-csv sentence.
- `docs/guide/setup.md:58`: the cap counts handoffs to A.
- `docs/guide/cheat.md`: the check-issue row says B repairs most findings.

## Criteria to evidence

| Criterion | Evidence |
|---|---|
| 1 | `bun test tests/phase.test.ts`: 41 pass, 0 fail. Tests: "review fix routes to check.repair, B hands to A, rechecks only B, caps handoffs and permits operator restart", "check.repair hands B to merge uncounted and failed recovers to check.repair", "fix cap records attempts failure", "check.repair refuses a --slot A move without changing state or log". |
| 2 | `bun test tests/next.test.ts -t "swapped seats"`: 1 pass. Expects `check-issue post-repair slot=B phase=check.repair leaf=<path>` on pane B. |
| Red first (1, 2) | With `src/` checked out at `HEAD~1` in the u1 worktree, `bun test tests/phase.test.ts tests/next.test.ts` gave 184 pass and 5 fail. The 5 failures are exactly the new and changed tests listed above. The worker edited code and tests together, so A ran this red proof. |
| 3 | `sed -n '/^## check.repair/,/^## Printed footer/p' skills/check-issue/SKILL.md`, judged item by item against plan D5: scope, exceptions, `Handed to A`, the operator pointer with no restated rule, fail-first commits, before/after evidence, base-run pointer, proof plus checks without `merge_checks`, `review-B.md` entry, and the two finishes. All present. The listed docs describe the same flow (diffs in `22f5258`). |
| D4 | `rg -n "'check.repair'" skills/watch-issues/scripts/observe.ts src/routing.ts` shows both enums. |
| Stale sweep | `rg -n "check\.fix" skills docs/guide README.md`: no remaining line says a review fix goes straight to `check.fix`. Remaining hits are A's check.fix phase, merge red checks and B's handoff. |

## Commands

- `bun run format`: exit 0, no diff.
- `bun run typecheck`: exit 0.
- `bun test`: 355 pass, 0 fail, 15 files. Wall time 122s.
- `test_changed` with `AKROGON_BASE=6ab5e82`: 241 pass, 0 fail, 4 files. Wall time 84s, rerun at head `08545ec`.

The format, typecheck and full-suite run was at `659391f`. `08545ec` changes prose only.

## Known limitations

- B's repair has no second reader before merge. This is accepted by design (Q3).
- On a mixed batch that trips the cap, the failure reason is "fix rounds exhausted", and the open operator action is only in `review-B.md` (plan D6).
- `observe.ts` is outside `tsconfig.json` `include`. Its enum is kept in sync by hand, which the D4 grep checks.
- A review seat still on the old skill text that requests `check.fix` with a verdict gets the "Illegal move" refusal listing `check.repair`, and must retry (D11).

## Unverified criteria

None.
