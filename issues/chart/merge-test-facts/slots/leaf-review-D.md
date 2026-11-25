# Leaf review: slot D, verify-test-facts

One defect. Dissent already recorded in `## Taken` is not repeated.

## D1. Criterion 4's reused half cannot be proved through the real CLI, because current code never writes a reused command row

Brief criterion 4: "Blocked and reused command rows carry neither field. Proof: own test through the real CLI." The blocked half is reachable by CLI. The reused half is not. No code path in this repo writes a command row with `reused` set, so an implementer told to build from these files alone cannot produce the row the proof needs.

Evidence (read 2026-11-25):

- `src/verify.ts` `verifyRunSchema` declares `reused` on a command row, and readers test it (`slowEligible`, main-red matching, `src/flaky.ts` `flips`), but no writer in `src/` sets it. Whole-receipt reuse is a different path: `verify` finds an older green row via `greenRun`, prints `reuse receipt <run>`, and returns without writing any new row.
- `tests/verify.test.ts` names this directly: `a same-tree retry re-executes every unblocked command and writes no reused entry`. The only test rows with `reused` set are hand-seeded ledger fixtures, for example `the receipt schema accepts both old entries and entries carrying a reused source run`.
- Real ledgers confirm the field is legacy: framework `issues/verify-runs.jsonl` holds 18 command rows with `reused`, the newest I sampled dated 2026-10-26, about a month before the current code state.

Consequence if the leaf is built as written: the implementer either hunts for a CLI route that does not exist, silently proves only the blocked half, or invents a new reused-row writer to satisfy a proof sentence, which is outside this leaf's ownership and against its exclusions. The binding rule itself ("a row marked `reused` gets neither field") can hold by construction, because only `commandRow` will write the new fields from a command's own output. Criterion 4's proof sentence is what is wrong: the reused half needs a seeded-ledger proof like criterion 6's, or it should leave the criterion.
