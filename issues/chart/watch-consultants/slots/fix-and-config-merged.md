# fix-and-config merged notes (A, B, C)

Q1 Base fix
- Clean separate worktree from freshly fetched `<remote>/<default_branch>`, never repo.root, commit only the base repair, prove by consult-loop item 9, fast-forward push, never `--force` (A,B,C). Location: `worktreeStore(repo)` `watch-fix-<case-id>` (A); case folder or /var/tmp (C). On non-ff: fetch, check whether the new base already fixes it, rebase, re-prove, push (A,B,C); C caps at 2 retries.
- Remove the worktree after read-back; record its path in the case so reconcile removes an orphan (A,C).
- Open: how `merge_checks` run outside an attempt since run-check refuses them (A); how `repo.config.env` and `setup` reach the disposable worktree without opening `.env` (C); `full` serialization via run-check (C).
- S3 applies before a host downgrade or spend past grant (B).

Q2 Leaf-local fix
- Consultant commits in the failed leaf's worktree only while every seat is idle or absent, inside the decided brief/design, clean tree, no issues/, `Test-Change:`/frozen trailers (A,C). B: consultant advises, leaf resumes and its own seat edits (a case note outside the repo is not in the seat's prompt — `src/next.ts` `promptFor`); B flags review bypass if resumed at merge.
- Uncommitted half-finished seat work in a `blocked` failure: salvage only on peer agreement (C asks; B: preserve the worktree).

Q3 Resume
- Watch alone runs `akrogon phase <slug> <target>` without `--slot`, then `next`, after re-observing seats idle or absent (A,B,C). Target: `failure.phase` after a base fix (A,B,C); after a consultant leaf commit, `check.review` so B reviews it, which needs a green `leaf` receipt (`transition` `requireGreenReceipt`) (C), or a repair phase such as `check.fix` (B). `failed=unknown`: phase from the last `P -> failed` log record; unresolved keeps the case open (A,B).
- Stale batch: C claims `commitMove` keeps `batch` on leaving failed and `reconcileBatch` returns early for `merge` without a candidate, so `mergeTurn` re-dispatches on the stale attempt; proposes clearing batch when no candidate. B cites tests/batch-dispatch.test.ts "a failed holder with a landed candidate ..." and says leave reconciliation to the command. A: framework log 7558-7561 shows a real `failed -> merge` recovery after the Bun base red merged in 12 minutes.

Q4 Never and S3 pre-filter
- Never: allow kill+rm of the watch's own verified consultant (A,B,C); "Answer a seat" stays, clarified as a leaf seat, peer exchange allowed (C,B); "Edit state.yaml, worktrees or issues/" stays for the watch, consultant limits in its brief (A,B,C). Human-prerequisite rule: consult, recover only after a verified fix or evidence the prerequisite is met (A).
- Pre-filter: none, consult every time (A,B); notify without consult only when the reason unambiguously and exclusively names a hard S3 need (C).

Q5 Config
- Optional recipe with the slot shape, validated against `harnesses:`, shown by `akrogon config`, chart `--slot` form untouched (A,B,C). Key: top-level `consultant:` (A,B); `slots.consultant` in globalSchema per the lock's "following the existing `slots:` + `harnesses:` convention" (C); index slots stay a/b (A,C). Overrides: none (A); optional flag overrides (C).
- Verb: `akrogon seat --watch` (A); `--watch-consultant` (C); an explicit watch form (B).
- Absent: loud error naming the key; watch keeps notify behavior; attention notice once (A); non-attention once per watch (C); report and stay recoverable (B).

Q6 Name and cleanup
- `<prefix>-watch-consult`, labels `akrogon.repo`, a watch-consult label, never `akrogon.leaf` (C); parent the watcher, `outlive: false` (A,B,C). Case end: verified kill+rm (A,B,C). `stop.ts`: timer first, then verified consultant (A,B,C). hc live-name uniqueness makes one-alive mechanical (A). Watcher replaced in a surviving terminal: observe and clean the old helper only (B). stop.ts output contract: add the consultant address (C asks).
