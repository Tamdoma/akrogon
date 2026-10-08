# Map A

## Reading of intent
After the chart settles (all forks taken, fog empty, proofs/needs/grants done), the door may, instead of writing leaves for
dispatch, have its own seat A implement and its peer B review, in the door's panes, for single-leaf work. Off by default,
enabled per repo in `issues/config.yaml`. The door advises "direct now" vs "full lifecycle" at handoff review, like debate.
C is not involved in implementation.

## Forks
1. Container. (a) door writes a normal leaf (brief/design/readiness/state) and drives it through the same phases with the
   door panes as seats; (b) door works with no leaf record, on a branch or main, then commits/pushes itself.
   (a) keeps `akrogon phase` guards (src/phase.ts:273-277 clean worktree, no issues/ diff, Test-Change citations,
   non-empty branch), fix-round bound (src/phase.ts:311), completion + source close (src/phase.ts:196-212), log, broadcast.
   (b) loses all of that; today's parked-status fix is (b) and landed uncommitted with no review.
   `hand_built: true` (src/state.ts:69, src/next.ts:611) already keeps a leaf out of dispatch, a possible anchor for (a).
2. Where code is written: leaf worktree+branch (lifecycle default, `worktree_root`) vs the registered checkout's main.
   Main directly conflicts with phase guards and with dirty operator work (git status shows unrelated M files now).
3. Review contract for B: full check-issue rules (Fix/Nit bar, blind review; but blind A+B review is moot since A wrote it)
   vs B-only review like `check.review` rounds>0 (src/routing.ts:59 requiredSlots). Repair loop bound = repo `fix_rounds`.
4. Plan step: skip plan-issue (chart forks already are the plan) vs a short synthesis plan. Debate meaningless here.
5. Merge/push owner: B per merge-issue (fast-forward push by command) vs A. Broadcast: still one per completed issue.
6. Config key: name/shape in repo schema (src/config.ts:43-58), boolean opt-in; absent = off; door never offers when off.
7. Advice rule: what makes work "small enough": one leaf, no chain/blocked-by, no grants/live external mutation,
   no new needs, fits one context. Door recommends; operator decides at the handoff review; never automatic.
8. Peer pane harness: B's pane harness here is codex (chart-b) but lifecycle slots.b config may differ; does direct mode use
   whatever the door's peer pane is (operator-supplied), ignoring `slots`? Model choice for implementation follows the
   door's own model, not slots.a.
9. Context budget: door A has already spent context on charting; implementing in the same session risks compaction mid-work.

## Pitfalls
- Unreviewed self-merge if B is unavailable: require B present (named peer) for direct mode, else refuse and fall back.
- Door skill grows a second implement/check/merge path that drifts from lifecycle skills: reuse implement-issue,
  check-issue, merge-issue skills by invoking them, not by restating rules.
- Seat stall/watch tooling assumes dispatched tabs; door-run leaf has no tab, so status/watch must not flag it stalled.
- GitHub sources must still close on completion; path (b) needs `akrogon close` manually.
- Running in the operator's main checkout while they have uncommitted work.

## Questions a practitioner would ask
- What breaks if the door session dies mid-implementation? (a) leaves a resumable leaf; (b) leaves a dirty checkout.
- Is the review truly independent if B also helped chart? (B mapped blind but agreed on decisions; still better than none.)
