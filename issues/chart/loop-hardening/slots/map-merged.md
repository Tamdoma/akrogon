# Merged territory map (HEAD 13f92e0)

Intake: Tamdoma/akrogon#5 to #14. #1 (chart handed off, leaf parked then deleted in 13f92e0, GitHub issue still open) and #2/#3/#4 (open leaf install-prune-links) are excluded by provenance.

## Findings

- F5 (both) confirmed: completeOwner renames before closeSources, no retry path. (B) reproduced; cleanupMerged in `next --all` removes the worktree before the completion sweep, and closeSources needs that worktree's HEAD, so a retry must survive cleanup. (A) fix shape: closeSources before rename, and run the completion sweep before cleanup so merged-but-unclosed leaves keep their worktree.
- F6 (both) confirmed: no error boundary in sweep/sweepAll/hook path; hook-event claim about `--all` refuted. (B) reproduced traversal stopping at the error; also `currentRepo` and `activeCount` scan every registration, so per-leaf isolation alone is insufficient and unreadable records make capacity uncertain.
- F7 (both) confirmed and (B) reproduced: side branch plus unrelated file reached remote main. (B) pre-staged unrelated changes also land, so `git add -- issues` alone is not enough; park takes only the global lock while phase takes global then repo, sync must serialize with both. (both) init ignore hardcodes `issues/worktrees/`.
- F8 (both) confirmed for a key rename. (B) refuted for a directory move with a stable key and updated path; that works. (A) the field duplicates the checkout's identity, so the check guards nothing. (B) stale absolute worktree paths are a separate problem.
- F9 (both) confirmed on all points. (B) reproduced the null-session skip; tests deliberately wait on blocked agents, so auto-failing busy seats changes policy; missing-pane crash unreachable without hand-edited state, no guard warranted.
- F10 (both): origin-only pull intentional and test-locked, docs gap only; README omits sync/park/unpark and parked-committed; shapes template not a defect; ensureWorktree mismatch real but only after a mid-leaf config change. (A) pi/codex folder linking already settled in the open leaf install-prune-links. (B) installed pi 0.85.1 reads `~/.agents/skills`, so a pi link was never needed. Excluded here either way.
- F11 (both) confirmed, (B) reproduced three notices in three sweeps; a hook that selects only its own leaf does not re-notify others.
- F12 (both) confirmed as an instruction-level cycle; (B) a generic timeout would mask it.
- F13 (both) `issue complete` prints before the owner check and before closeSources. (B) per-issue broadcast is intentional and test-asserted; the misleading case is a completion line followed by closure failure, since merge-issue keys on printed text. (both) discord second failure stops that target, other targets continue, final error raised: visible, not silent.
- F14 (both) confirmed: slot/priority unread by scheduling (B: still serialized by status detail, strictObject makes removal a migration); unowned hook quiet, file target raw ENOTDIR (B reproduced); logMove after commit intentional and tested; parked leaf reports Missing leaf; deep trees mislock, `issues/open/state.yaml` self-deadlocks; (B) fetch without deadline inside repo and global locks can stop the whole machine's dispatcher; herdr() stdout parse unguarded; closed owner name reuse throws at completion, not at handoff.

## Split (both, merged)

One epic `loop-hardening` owning #10 and #14 (they span issues; shapes forbids splitting one identity across owners). Six issues, each owning its narrow sources:

1. `record-sync` (#7): `scoped-branch-sync` (owned paths only, branch refusal, locking), `worktree-root-ignore`.
2. `dispatch-progress` (#6, #9, #11): `isolated-dispatch-errors`, `fetch-deadline`, `seat-guards` (null-session prompt, blocked merger, extra panes per Q13), `failure-signals` (notify policy, stall policy).
3. `recoverable-completion` (#5, #13): `closure-before-move` (order, completion sweep before cleanup, `issue complete` semantics), `discord-chunk-report` (only if Q7 changes reporting).
4. `lifecycle-records` (#8): `tree-preflight` (depth validation, closed-owner reservation, parked hint in lookup), `repo-identity`.
5. `command-outcomes`: `argument-and-response-errors` (file target, herdr() parse), `command-reference` (README verbs, parked, origin-vs-remote).
6. `review-protocol` (#12): `blind-initial-review` skill-only.

Dependencies: `command-reference` sync paragraph waits on `scoped-branch-sync`. Nothing else.

## Disagreements to settle

- Stall: (A) time-based auto-fail after a configured window with an attempt consumed. (B) signal only, no automatic interruption until a progress measure exists.
- Failed notification: (A) notify inside commitMove at the transition, no marker. (B) persist delivery marker, notify once per failure episode.
- Repo identity: (A) stop enforcing `state.repo`. (B) keep the key as persistent identity, document, reject live worktree_root changes.
- Isolation report: (A) one herdr notification per run listing skipped slugs. (B) aggregate nonzero exit; both agree unreadable occupancy must not be counted as zero.
