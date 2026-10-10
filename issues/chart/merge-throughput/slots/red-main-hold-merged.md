# red-main-hold merged notes

## Q1 when the hold clears
- Clear when fetched main tip changes; holder's normal rerun on new main is the proof; red again re-holds on the new sha (A,C). Cost: half-fixed main costs one run per push.
- Clear only on completed green proof of the held command on current main (B). Cost: one extra proof run on the bottleneck per episode. B point: an issues-only or unrelated commit leaves the defect.
- A synthesis option: clear when main changes outside `issues/` and `learnings/` (reuses equalOutsideRecordFolders, src/batch.ts:23-25), answering B's issues-only case; unrelated code commits still cost one re-held run.
- Flaky-hold escape: explicit operator `akrogon next <holder>` runs in full, as repo-pause boundary already decided (A,C); B: explicit owner-led same-sha recovery (A,B,C agree an explicit escape exists).
## Q2 who repairs main
- Operator pushes the fix to main (10-09 path, 264cc2f5b); hold clears on fetch (A,B,C as one path).
- Holder B fixes forward (merge-issue:55) (A,C). B: applied-stack B cannot commit (merge-issue:41), only solo form can; C: hold must then let its own holder through.
- Fix leaf: operator names it, it alone takes a solo attempt through the hold, override in holder selection AND phase authorization (src/phase.ts:770-783) (B). C: fix leaf waits like any leaf, priority belongs to queue-order fork.
- Rejected by all: auto-revert, auto-created fix leaf, time-based clear.
## Q3 who judges
- B judges cause under check-issue:61 / test-runs base-red rule; command validates and owns the hold (A,B,C).
- Concrete shape (C): `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha>`: refuses stale attempt; refuses if <sha> is not current fetched main; leaf does not move; restores carried members; clears batch record without halving batch_limit; writes gitignored hold file under globalHome like paused.yaml; prints and notifies; status annotates. Guard at mergeTurn entry src/next.ts:962 (A,C).
- B adds: evidence record with exit status, invocation, base/head sha, log paths, B's causal finding.
## Extra
- Per repo, like pause (C). Already-failed leaves before this lands: no auto revival (B).
- Speed: removes about 8 of 12 base-red runs over 3 days, 5-9% of turn capacity, plus all `failed` stops and operator moves of this class (C, framework log). Does not land anything while main is red (B,C).
## Points where slots differ
D1 clear on main move (A,C) vs green proof (B).
D2 fix leaf passes the hold by name (B) vs waits / queue-order fork (C); fix-forward by holder B (A,C) vs only solo form (B).
