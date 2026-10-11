# Review A: seat-retry

Base: `c53f619` · Reviewed head: `eea5223` · Diff: `c53f619..eea5223` (6 files: `src/next.ts`, `tests/next.test.ts`, `tests/status.test.ts`, 3 guide files)

## Evidence

- Read `plan.md`, `design.md`, `implementation/report.md`; full diff inspected hun by hunk.
- Implementation evidence: `bun test --timeout=30000` 794 pass / 0 fail; `--changed` 389/0; `tsc` clean (report.md; verified by rerunning `bun test tests/next.test.ts -t <red cases>` earlier in the pass history — now green, and the 794-run is recorded).
- `grep -rn "put the leaf into failed\|count toward failure\|needs a usable seat" docs/` → 0 hits.
- `grep -n "commitMove\|retryable(" src/next.ts` → `retryable` only at :908 (`mergeNotice`), `commitMove` only in merge reconciliation — no delivery-path callers remain.
- `src/phase.ts:376` `cause: 'attempts'` is the unrelated fix-rounds cap; `phase` moves clear `delivery_error` (phase.test.ts :1486) — unaffected.
- Reconcile gate verified by reading: `pendingOffset` implies `delivery_error[slot]` exists (state.ts :22-29), so the `!` on `.session` is safe; recorded `session === null` can never equal a live session `value`, forcing a resend — matches brief wording "different or missing session".
- No `AREA.md` in the diff; changed behavior's doc page (`docs/guide/next.md`) was opened and updated. `docs/guide/state.md:58` and `in-practice.md:87` describe `failure`-recorded recoveries for other causes — still true.
- Tests: rewritten cases assert state/phase/call counts, not prose; planned reds from plan.md all pass; no planned test skipped or filtered (full suite ran whole).

## Findings

### Fix

**F1 — `docs/guide/problems.md:78` still teaches delivery-fault recovery.** Line: "For CSV export, missing permission may need an operator action. Broken quoting needs code repair. A failed prompt needs delivery diagnosis. Repeating the same recovery without new evidence does not resolve any of those causes." The sentence sits under "Failure is a recorded stop" — a list of causes an operator may find behind a `failed` leaf. After this leaf, a seat prompt-delivery fault can never produce a `failed` leaf, so the recovery list instructs diagnosis of a cause that cannot occur; an operator who reads it treats a non-existent failure mode as real, the exact confusion this leaf removes.
- Realistic source: real operator action — reading `docs/guide/problems.md` while recovering a failed leaf.
- Consequence today: recovery runbook contains an impossible cause; the guide contradicts `next.md`'s "delivery faults never move the leaf to `failed`".
- Hits: brief criterion 4's doc half (the guide must say faults retry and never fail); plan D4's intent (worker covered :18, missed :78). Minimal repair: delete "A failed prompt needs delivery diagnosis." (or fold into the retry wording); `tests/docs-links.test.ts` must stay green.

### Nits

- **N1 — non-retryable `agent start` errors retry forever without discrimination.** `agent_name_taken` and friends now record and retry like `agent_not_ready`; a stuck name accumulates attempts forever. Deferred: the design explicitly removes the retryable/non-retryable distinction (Taken 2a, "the next pass retries", B,C) and names fresh-name-per-launch the follow-up only "if a name stays taken across passes". Promotion evidence: a real `agent_name_taken` loop observed on a live pass.
- **N2 — status hides `delivery_error` while the seat is `busy`.** Criterion 4's display holds only for non-busy seats (existing rule, `src/status.ts` :120-124). Deferred: pre-existing behavior, out of leaf scope. Promotion evidence: an operator report of an invisible delivery error on a busy seat.
- **N3 — `delivery_error[slot]!.session` non-null assertion.** Reachable only when `offset` is set, which implies `session` non-null in practice (`recordFailure` records `offset` only from a live session). Deferred: type-level cleanliness, no runtime path exists today. Promotion evidence: a hand-edited `state.yaml` carrying `offset` with `session: null` (still handled correctly — equality just fails).

## Verdict

`fix` — one doc line (F1) routes to repair.
