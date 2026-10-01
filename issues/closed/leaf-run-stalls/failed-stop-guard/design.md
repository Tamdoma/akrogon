# Design: failed-stop-guard

## Binding decisions, verbatim

### failed-stop-race (issues/chart/leaf-run-stalls/forks/failed-stop-race.md)
Operator 2026-10-01, verbatim: "1a." Earlier, on whether this keeps the operator out of the loop: "I want to be removed as much as possible from the entire process. The reason why I have watch-issues skill and agent in a separate tab is to only occasionally help while I'm asleep. Is this in line with the change?" Answered yes: 1a keeps the watch's slot-less recovery.

Q1 1a. In `transition`, when `state.phase === 'failed'` and an explicit `--slot` is given, refuse before any state, log or herdr effect with "Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved." plus the recorded reason. Entering `failed` with a slot is unchanged. Recovery without a slot, by the operator or the watch (watch-issues SKILL.md:38-39), is unchanged. One recovery line each in docs/guide/problems.md and phases.md.
Reason: `--slot` already separates seat calls (every seat call in plan-issue, implement-issue, check-issue, merge-issue carries it) from recovery calls (every documented recovery and every recovery test omits it). Martin Kleppmann, "How to do distributed locking" (2016): the store that owns the state rejects a late writer.
Foreclosed: 1b `--from <phase>` compare-and-set (new flag across 4 skills). Seat re-read wording (leaves the window open). Operator-order rules (the door's own v1 instruction got this wrong).
Limits: `--slot` states intent, not identity, so a seat omitting it passes. A stop then deliberate recovery inside one seat pass is not covered. The `fix_rounds` reset on recovery is out of scope.

### Excluded binding decisions
- red-criterion, provider-death and leaf-split answers belong to chart-audit-rules and seat-exit-rules. This leaf changes no skill text.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

No auth, backend service, secret, browser flow or chain stage is involved. The cheapest sufficient proof is the existing CLI test style in `tests/phase.test.ts` (fixture repo from `tests/helpers.ts`, fake herdr from `tests/fake-herdr.ts`), extended rather than adding a file. Criterion 1 is one test with the five listed calls. The guard branches only on `failed` plus an explicit slot, so a full phase-by-slot matrix adds nothing (C D8). Criterion 2 reproduces the observed incident: slot B ran this exact sequence on current code in a fixture on 2026-10-01 and got `moved failed` then `moved check.review` (slots/failed-stop-race-B.md), so the test fails first on the current code. Criteria 3 and 4 are existing tests left unchanged. Docs lines are checked by reading.

## Leaf architecture
Owned: `src/phase.ts` (`transition`, the guard placed right after the merged-terminal check at line 184 and before the legal-move check at line 185, so every `--slot` call on a failed leaf gets the same refusal (C D10)), `tests/phase.test.ts`, `docs/guide/problems.md`, `docs/guide/phases.md`.
Literal interfaces: test the parsed explicit slot (`explicitSlot`), not the slot inferred for single-seat phases (`src/phase.ts:198`). Error text: "Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved." plus the recorded `failure.reason` when present. `failure` is optional even in `failed` (`src/state.ts:57`), so a missing record still refuses cleanly (B F3).
Excluded: `commitMove` (also performs valid seat stops), `src/next.ts` failed entries for delivery failures, `src/routing.ts`, `skills/watch-issues/SKILL.md`, every seat skill's `--slot` lines, any file under `issues/`.
Dependencies: none.
