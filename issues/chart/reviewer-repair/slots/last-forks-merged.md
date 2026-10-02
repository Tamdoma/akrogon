# Merged: operator-only exit and round budget

## Fork 1 trace (framework log, emdash-launch)
- 18:47/18:48 failed/recovery was a seat-start "agent name taken" race, not an operator item. (B) A had read it as part of the operator chain. (A)
- 20:10 B stopped correctly (review-B.md:252-258,299-306); its `--reason` led with base-red, the scope item second. (C) 20:12-20:16 four no-slot recoveries by session 9983ec1e, A re-failed after 6-25 s each, nothing changed between. (A,B,C) The operator aide recovered before the authorization reached A; delivery was blocked by approval review. (B) Repeating the stop was correct seat behavior. (B)
- 10-02 after recovery reset fix_rounds, A reviewed again and wrote the stray repo as Fix F2 "operator action only" and told check.fix not to fail on it (review-A.md:152-156,176). (A,B,C)
- The 403 blocker was not permanent: B later deleted the repo with existing credentials (report.md:315,322). (B)

## Fork 1 findings
- The stop rules (`check-issue:27`, `merge-issue:27`, `implement-issue:33`) cover the seat's own step, not a finding; A's review step needed no operator, so A did not stop. (C) A's instruction overrode the skill in practice. (B)
- The item came mixed with a real local Fix; stopping would have blocked a doable repair. (C)
- Recovery is the flap source: `src/phase.ts:185-187` and `docs/guide/phases.md:73` say recovery follows resolution, `skills/watch-issues/SKILL.md:38` forbids recovering human prerequisites; nothing enforces it. (A,B,C)
- Operator-gated work sat inside done-criterion C8 (live mutations, list-proven cleanup); chart-issues already requires human-only prerequisites before a leaf opens. (A)
- Command refusal: decline, the command cannot tell whether a scope was granted or authorization delivered. (A,B,C)
- Fix bar: B declines changing severity (operator ownership changes disposition to failed, the criterion still blocks, `check-issue:51`). C proposes one line "an operator-only item is never a Fix", listed under Operator actions. A proposed similar. Agreement: never routed to A as a repair; if it gates a criterion, merge waits for it. (A,B,C)
- Ordering: B stops immediately even in a mixed batch. C repairs doable Fixes first, then one failed stop naming every operator action. (held)
- Operator action named first in `--reason` (C); exact command plus the error proving the seat cannot run it (C, review-A.md:153); recovery only after the action is delivered (B).

## Fork 2
- Recovery reset: keep fix_rounds across failed recovery (A,B,C). Remove the reset arm at `src/phase.ts:110-112`. Exception: a leaf failed by the cap itself ("fix rounds exhausted", `src/phase.ts:248`) still needs a way out (C); B: distinguish a new round from a paid remainder at the cap (B R3).
- Count B repairs: no (A,C), the cap bounds handoffs and an in-pass B repair makes none; counting needs a new state field and B self-reporting. Yes (B): one round per batch through an atomic repair-start op that checks the cap and increments fix_rounds before B edits; otherwise B batches are unbounded and recovery after a B repair at 0 asks both reviewers again. (held)
- Tests: `tests/phase.test.ts:824-837` asserts the reset; `tests/next.test.ts:1765-1795`; cap boundary `tests/phase.test.ts:1099-1117`. Docs `docs/guide/phases.md:73`. No state shape change for the reset fix. (B,C)
