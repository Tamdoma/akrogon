# Merged opening map (A, B, C)

Sources: map-A.md, map-B.md, map-C.md in this folder. Attribution tags name the slots whose map holds the line.

## #104 merge stacks
- Confirmed (A,B,C). Framework merge-attempts.jsonl at 2026-10-18 12:40Z: 267 attempts, 51 with members, 4 merged, 46 red, 1 ejected (A,C recount; B counted 41/36/4 to the 07:54Z cutoff).
- A member rebase conflict skips that member; it does not make the stack red (B,C). The seed's open question is answered.
- Prior lock: issues/closed/merge-batch/stacked-turn/design.md, operator 2026-10-15 "No caps at all", all-or-holder, red-skip per (head, base) (B,C).
- Option remove stacking: holder-only turns, delete src/batch.ts stacking, state.batch members, member reconcile/push paths (A,C).
- Option keep stacking, drop base equality from redMemberHeads so an unchanged red head is not re-stacked after main moves (B).
- Pitfall: a new base can heal a red combination; head-only exclusion trades that away (B). Holder checks of 13-27 min are a separate problem (C).

## #103 sourced completion
- Confirmed, narrower than reported (B,C): a merged leaf whose owner is incomplete loses its worktree (reconcile mergedWorktree / removeMergedWorktree), then every retry of completeOwner throws in closeSources. Fully complete owners keep the worktree (tests/next.test.ts retained-complete-owner case) (C).
- Option slug comment: closeSources stops reading worktree HEAD and cites the leaf slug, matching `delivered by <slug>` in closeCommand (C).
- Option recorded commit: persist the landed SHA in state at merge, on every landing path (B).
- Link: if stacking is removed, there is one landing path (A).
- Pitfall: log.jsonl is written after state save and can fail, so it is not durable evidence (B). Old stuck leaves need a repair route (B,C).

## #102 strict state parse
- Confirmed (A,B,C). next.ts discover already tolerates unreadable leaves, status and allLeaves do not (B,C). tests/state.test.ts pins strict rejection on purpose (B,C).
- Option strip: top-level z.object strips unknown keys, delete the 4-key skip list in readState (C).
- Option isolate: keep strict, one inventory returns valid leaves plus invalid paths, replacing three walks (B).
- Pitfall: stripping deletes seat notes on the next save and hides misspelled optional keys (A,B). Isolation must keep an unreadable leaf counted as owned for cleanup (reconcile collectSlugs) (B).

## #105 criterion red at base
- Confirmed (A,B,C). shapes.md already refuses criteria naming test files; the framework criterion named three (A,B,C).
- Option outcome-only criteria: the criterion locks behavior, the plan owns the command, a wrong command is fixed in plan/review without the operator (B,C).
- Rejected: let known-red waive a criterion (C), run every criterion command on base at handoff (C: rejects red-first proofs, B R4).
- Lesson link: learnings/history/2026-10-16-review-test-command-equivalence.md may be absorbed (C).

## #106 sync identical ignored files
- Confirmed (A,B,C). `git rebase --autostash` overwrites a differing ignored file silently (B,C probes); `git read-tree -m -u` does too (B probe). The guard must stay.
- Option shared exception: integrate treats a same-type, same-bytes file as no collision (A,B).
- Option split: remove the ignored check from integrate, rely on self-update moveCheckout, add a sync-only comparator (C). Conflicts with B's read-tree probe.
- Pitfall: symlink vs file, mode, filters, replayed local commits (B,C).

## Split
Five separate charts, no dependency (A,B,C).

## #107 paid claude -p reruns (addendum, map107-B.md, map107-C.md; A read the same skill and schema lines)
- Confirmed (A,B,C). C recount of ~/.claude/projects usage 2026-10-17T22:00Z..10-18T12:30Z: 1.333B tokens, 45.5% proof-34b consumers, 36.9% worktree live runs (C). hub-child-links 16 live attempts, replay-cases to live-run-19 (B,C).
- The report is partly wrong: chart-issues Take already lists billing effects in grants. The "live-change" / "before mutating" wording lets a read-only paid session land in proofs[] with grants: [] (A,B,C).
- implement-issue and check-issue reuse grants "for ... reruns ... without asking again" and never count attempts against `bounds` (A,B,C). check-issue B repair also runs planned live proofs (B).
- src/readiness.ts: bounds is free text, proofs have no grant link, nothing enforces (A,B,C).
- Prior lock: issues/chart/proof-cost/forks/proof-run.md Taken 2026-10-10 forecloses any enforced budget, timer or numeric gate (B,C).
- Option contract fix: a paid session is a billing effect needing a grant; reuse only within the remaining bound; exhaustion stops through the blocker path; sleeping to a quota reset is a new attempt (A,B,C recommend).
- Option enforced ledger in akrogon run-check or at the framework launch boundary: misses nested sessions unless every runner changes (B,C).
- Removal side: apply standing-design's cheapest-sufficient and recorded-replay rules so fewer fresh paid runs are needed at all (B,C).
- Framework stage resume is framework-owned and a separate chart if wanted (B,C).
- Split: a sixth independent chart (A,B,C).

## #108 reopened epic never completes (addendum, map108-B.md, map108-C.md; A read completeOwner, packFolder and the framework folders)
- Confirmed (A,B,C). completeOwner throws `Completion destination exists` before closeSources, pack and rename (src/phase.ts completeOwner).
- How: framework chart satellite-plan-fit handed off in two waves. Wave 1 (2 leaves) merged and closed the epic, wave 2 (6 leaves) was then written under the same epic name. CHART.md recorded "earlier leaves closed" and "no collisions" (B,C).
- shapes.md Preflight already refuses an existing issues/closed/<owner>, as prose only; no code enforces it; tests/next.test.ts "closed owner name does not block an open same-name owner" expects dispatch to continue (B,C).
- Extra harm: src/evidence.ts readLog reads the archive of the first existing owner folder, so the open twin hides first-wave logs (B probe, C). reconcile ownerCompletes ignores the destination and keeps worktrees forever (C).
- Option single-lifetime names: each handoff group gets a fresh owner name, a guard refuses open/closed twins at dispatch and status, the live epic is repaired once (B).
- Option append: completion moves the new children into the existing closed owner and reuses packFolder for the archive union; delete the shapes refusal (C).
- Masking: in this epic 5 of 6 merged leaves have no worktree, so fixing #108 alone hits #103 next (B,C).
- Split: C folds #108 into the #103 chart ("merged owners always finish into closed"); B keeps a separate seventh chart; A agrees with C on one chart because both share one observable outcome and the live epic needs both.
