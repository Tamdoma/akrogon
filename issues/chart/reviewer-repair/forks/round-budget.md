# Round budget

## Question
Q1 Do B repairs count against the `fix_rounds` cap, and does failed recovery stop resetting the counter that decides whether A reviews again?

### Carries
- `src/phase.ts:107-112` increments only on check.review to check.fix and resets on failed recovery; `src/routing.ts:42-44` uses the counter to pick B-only re-check.
- A B repair inside its own pass makes no check.fix move, so counting it needs a state change (C rebuttal X4).
- Related: `repair-authority.md`.

## Findings
- emdash-launch: 3 repair rounds and 5 failed recoveries, cap of 3 never fired, A reviewed its own repair after recovery. (A,B,C)

Round 1 (2026-10-02): same files as `operator-only-exit.md`.
- Reset arm at `src/phase.ts:110-112`; the cap guards only review to check.fix (`:237-248`); merge to check.fix neither counts nor hits the cap (B).
- Keep fix_rounds across failed recovery (A,B,C). Held: C resets after a cap failure ("fix rounds exhausted", `src/phase.ts:248`) so a capped leaf can be retried; B rejects replenishing and allows only finishing an already started round. With the count kept at the cap, a recovery into check.fix gives one A repair and a B-only re-check; another `fix` fails it again (A).
- Count B repairs: no (A,C), the cap bounds handoffs between passes and an in-pass B repair makes none. Yes (B): one round per batch through a new atomic repair-start that checks the cap and increments before B edits, after both initial verdicts, with a reviewed-head batch record so resume or B-to-A handoff does not double-charge, and merge-origin batches counted too.
- A recovery into check.review at count 0 asks both reviewers again; that is a recovery-target case not covered by either answer (C).
- Tests: `tests/phase.test.ts:824-837` (reset), `tests/next.test.ts:1765-1795`, `tests/phase.test.ts:1099-1117` (cap). Docs `docs/guide/phases.md:73`. No state shape change for the reset fix (B,C).

## Taken
Operator 2026-10-02, verbatim: "1a | 2a | 3a |"

- Q2 2a: failed recovery keeps `fix_rounds`, with no exception for a cap failure. At the cap each recovery gives one more repair and a B-only re-check. Reason: simplest, stops recovery from refilling the budget and from making A review its own repair. Foreclosed: reset after cap failure (C).
- Q3 3a: B's in-pass repairs do not count against `fix_rounds`; only routed check.fix trips count. Reason: the cap bounds handoffs and an in-pass B repair makes none; no new state. Foreclosed: repair-start batch accounting (B). Accepted: B repair work inside one pass has no count limit; checks before merge still apply.
