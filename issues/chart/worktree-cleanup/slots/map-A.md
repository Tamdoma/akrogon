# Opening map, slot A (written before reading B, C, D)

## 1. Verified facts

### #91 peer-wait and antigravity
- `turnOpen` returns false for every kind but `claude` (skills/chart-issues/scripts/peer-wait.ts:130-131), so an idle/done pane with no return file for 10 s (`IDLE_GRACE_MS`, :67, grace at :183-193) is `failure`. The reporter's mechanism holds.
- The same rule covers codex and pi, not only agy. #44 (closed) was the same symptom on codex. The class is "any harness without a turn check".
- Live measurement 2026-10-15 15:39-16:10Z in this door: slot D (agy, w8:pPY) ran a ~30 min map. herdr status sampled every 5 s stayed `working` for every sample (status-sample.log). peer-wait returned `budget` three times and `done` once, no false `failure`. So the false idle is intermittent. Its trigger (when agy's pane reads idle mid-turn) is unverified. Low confidence on the reporter's "subagents" explanation.
- No antigravity session or transcript reader exists in the repo. Its on-disk format is unknown to me.

### #92 check logs
- run-check copies `out.log` to `<target>/check-<name>-<ms>-<pid>.log` (src/run-check.ts:207-209). The target is `<leaf>/implementation` for leaf, override and worker callers (:107, :114, :123) and `<cwd>/<holder>` otherwise (:127).
- Framework: 4,462 tracked `issues/**/*.log`, 944.9 MiB. Only 1,363 are `check-*` copies. 3,099 (69%) have no writer in akrogon src or skills and no framework script writes them except `parity.log` (framework `.claude/skills/dev-build-astro/scripts/verify-variant-parity.ts:189`). They are agent-made evidence files (merge-evidence, verify.log, selftest.log). Fixing run-check alone leaves most files.
- Git already compresses: framework pack is 173.6 MiB for the whole repo. The 944 MiB is working-tree size, paid by the main checkout, clones and any non-sparse worktree.
- Akrogon's own worktrees are sparse and exclude `/issues/` (src/next.ts:279-305, used by leaf, verify and batch worktrees). Worker worktrees are made by skill text with plain `git worktree add --detach` (skills/implement-issue/worker-protocol.md:11), so each worker carries the full ~1 GB issues tree.
- `flaky` reads a red run's log by recorded path, open or closed (src/flaky.ts:10-17). Any change of form must keep that reader working.
- The reporter's target (a couple hundred MB for the whole checkout) is not reachable through logs alone: issues/ is 1.1 GB of 3.9 GB.

### #93 leftover worktrees
- `worktreeRemovable` keeps any worktree whose HEAD has commits outside `--branches --remotes` (src/reconcile.ts:53-60).
- Verify worktrees are detached at the tested sha (src/verify.ts:152) and never commit. verify removes its own worktree in `finally` (:189). A leftover means the verify process died or the remove threw. The sweep then removes only if no live run (:372-380), and the reachability guard keeps it.
- Correction to the report: the tested sha becomes unreachable when the merge moves the leaf branch to the rebased commits (src/batch.ts:161-174, `update-ref`), not when reconcile deletes the branch (reconcile.ts:219). Reachability is the wrong test for a worktree that never commits.
- Worker worktrees: removed by A after each wave's cherry-pick, kept on a conflicting pick (worker-protocol.md:11, :31). After cherry-pick the original commit is unreachable by construction. The sweep removes them only after the owner is merged or failed (reconcile.ts:385-388), then the guard keeps them.
- Unregistered directories are always kept as `unknown directory` (reconcile.ts:347-353).
- The store is empty today (operator removed leftovers). Evidence of the keep reasons survives in `~/.config/akrogon/reconcile/framework.json` (per the Explore pass, not opened by me).

## 2. Proposed split
Three independent charts, no dependency:
- `peer-wait-harness` (#91): skill script plus its tests.
- `evidence-size` (#92): log form and location under issues/.
- `worktree-cleanup` (#93): reconcile removal rules, plus worker-protocol text.
#92 and #93 both cut disk but share no output. A worker worktree made sparse would touch both; I place it in #93 (worktree creation) only if the operator wants it.

## 3. Material forks

### #91
1. What tells peer-wait that a non-Claude peer's turn is still open?
   - a) A per-harness turn reader (agy session file, codex rollout file) like `claudeTurnOpen`. Precise. Reads undocumented formats that change with harness updates, one branch per harness, invites more.
   - b) The return file is the only done signal. Pane idle is never evidence of failure for a harness without a reader. Failure only after a long continuous idle window (minutes, not 10 s) or the overall budget, then to the operator. Cost: a peer that really stopped without writing is noticed late.
   - c) Peers write a status file on every exit path (answer or "cannot do X"). Same as b plus faster failure, but depends on the peer obeying the brief.
   Pick: b, with the brief asking for atomic write. It removes the class for every harness without reading private formats. Cost: slower failure detection.
2. Scope: agy only or every non-Claude harness? Pick: every harness, since codex hit the same symptom (#44).

### #92
1. Which logs does the fix cover: run-check copies only, or every log in a leaf folder?
   - a) run-check only. Small. Leaves 69% of files.
   - b) Every log in the owner folder, handled at completion when the folder moves to `issues/closed` (src/phase.ts:190-224). Covers agent-written evidence too.
   Pick: b.
2. Which form keeps evidence lossless and small?
   - a) Compress each log at write (`.log.zst`). Simple, but per-file compression loses cross-file redundancy, and compressed blobs defeat git's delta, so the pack may grow per leaf. Needs a measurement.
   - b) One archive per completed owner (`evidence.tar.zst`) at move to closed. Open leaves keep plain logs for agents to read. Readers of closed logs (flaky) read through the archive.
   - c) Move logs out of git to a host store with a hash in the leaf record. Smallest repo, loses evidence on other clones and hosts.
   - d) Retention or dedupe. Lossy, refused by the reporter.
   Pick: b, pending a measurement of pack growth for a vs b on one framework leaf.
3. The existing 944 MiB in framework and 18 MiB in akrogon: migrate tracked closed logs once (a step on main per repo, since it is an issues/ change), or leave history alone? History rewrite is out (pack stays). Pick: one-time migration of the working tree only.

### #93
1. When may a verify worktree be removed?
   - a) When its run ended or its owner pid is dead, with `--force` and no reachability guard. It never holds its own commits.
   - b) Patch equivalence (`git cherry`). Works for verify, fails for workers, more git calls.
   - c) Pin HEAD to a ref (`refs/akrogon/kept/<name>`) then remove. No loss, refs accumulate.
   Pick: a.
2. When may a worker worktree be removed?
   - a) Once the owner is merged, force-remove: its kept changes reached main through cherry-pick and review, unpicked commits were abandoned. Failed owner keeps today's guard.
   - b) Pin then remove (as 1c) for both merged and failed.
   Pick: a for merged, guard for failed. Cost: an unpicked worker commit of a merged leaf is lost (it was abandoned).
3. Unknown directories under the store (`prose-asserts-u1-cmdlogs`): keep as today, or remove when the name starts with a merged owner's `<slug>-u<N>`? Pick: keep, off route unless the operator wants it. Removing directories akrogon did not register risks deleting operator files.

## 4. Practitioner questions and pitfalls
- #91: a peer writing its return file in pieces reads as `done` early. Removed by atomic write in the brief and a test.
- #91: an over-long idle window stalls the door on a dead peer. Removed by a bounded window and the existing operator report.
- #92: archiving at completion races a leaf still writing logs after merge (merge-issue evidence). Removed by archiving in the same move step that closes the owner.
- #92: `flaky` and humans reading old paths. Removed by a reader that resolves archive members, and a done-criterion on `akrogon flaky` output with a closed red run.
- #92: compressed archives make git diffs unreadable and defeat delta. Measurement decides a vs b.
- #93: force removal could delete a worktree with a live pane or process. Removed by keeping the existing pane and pid checks ahead of the new rule.
- #93: verify leftovers come from a dying verify process; fixing reconcile hides that leak. Ask why the six verify runs did not clean up (framework `issues/verify-runs.jsonl` end fields).

## 5. External operations needing a proof call
- #91: `herdr agent wait`, `herdr agent list` (already proven by earlier charts; a new flag would need a call). A live agy turn showing idle while working is not reproducible on demand today.
- #92: `zstd`/`tar` or Bun's `zstdCompressSync` (bun 1.4.3 exposes it), git pack measurement. Local tools.
- #93: `git worktree remove --force`, `git rev-list`, on a throwaway repo. Local.

## 6. Fog
- #91: what makes agy's pane read idle mid-turn, and whether herdr exposes any subagent-aware signal.
- #92: who writes the 3,099 non-check logs and whether skills should stop writing them under issues/ at all.
- #93: why verify's own `finally` did not remove six worktrees of one leaf.
