# Implement report — fewer-repeat-calls (slot A)

Lane: `fewer-repeat-calls` at `232f5d5` on base `a4fc68d3`. Plan: `plan.md` (D1–D8 plus 2026-10-26 chart-door notes).

## Changes

Five units landed through the shared worktree store, picked in two waves:

- `d7403d27` U1 `scope: read a pane shell identity once per scope check` — `Shell`/`paneShell` exported; `inOwnScope` gains `prior?: Shell` and throws `Pane <id> shell start changed: expected <a>, reads <b>` when /proc start differs; `adoptShell` gains `shell?: Shell`.
- `f3d27245` U3 `config: read the registered root common dir and remote url once per run` — `commonDirectory` memoizes only non-null answers keyed by realpath'd cwd (nulls/failures evicted, never cached); new `remoteUrl(root, remote)` memoized per pair; `preflight.ensureRemote`/`pull.originSource` use it; `remoteBase` no longer re-reads the remote.
- `975c106` U5 `tests: hash the fake proc ids natively and bundle the fake busctl` — `Bun.CryptoHasher` in fake-proc; per-worker `bun build --bytecode` fake-busctl bundle via `isolation.ts`; `helpers.ts` symlinks it. Test-Change trailers recorded.
- `577e7cf2` U2 `next: pass pane reads down inside one dispatch step` — `observeBusy` returns `{state, notified}`; dispatchLeaf forwards its observation list only when nothing notified; `allocate`/`dispatchSlot` accept `listed`/`seen`; each pane's identity read once and reused across check/adopt/poll; members derived from the held list on tab reuse; `sight` returned only when no herdr write ran; `ensureWorktree` uses `commonDirectory`.
- `8eb7eed2` U4 `self-update: drop the duplicate HEAD read` — dead `local` binding removed.
- `232f5d5` `tests, scope: apply prettier to the planned diffs` — format gate fix only.

`tests/AREA.md` isolation.ts line updated (U5 commit). No other docs needed.

## Removed reads and their suppliers

Recorded by B during check.repair, 2026-10-26, addressing review-A Fix 4. The initial implementation is `232f5d524c61e70cde33781ba416159bdcc9d5a2`; the repaired dispatch boundary is `cfb397d6250e3b6191e5b285f885e9d78e703d55`.

- M1: `adoptShell`'s `pane process-info` identified the shell to place. The current scope check/boxing's `paneShell` supplies its observed pid and start directly to `adoptShell`.
- M2: each adoption-poll `pane process-info` identified that same shell. The boxing identity supplies the pid/start while each poll reads `/proc` start and cgroup fresh and refuses a changed start. No pane/tab/workspace list is supplied across the poll wait.
- M3: `allocate`'s initial `pane list` supplied pane membership and recorded-seat observations. `dispatchLeaf`'s earlier observation list supplies it only when neither `observeBusy` call sent a notification. A notification discards that list before allocation.
- M4: the reused tab's `members` `pane list` supplied its current pane membership. Allocation's `live` supplies it. If the entry sweep closed a pane, `live` is a fresh read after the closes. A newly created tab still reads panes after creation.
- M5: the first `dispatchSlot`'s `pane list` and `tab list` supplied the tab/workspace/worktree ownership check. Allocation's `live` and `view` supply them only when allocation made no herdr write. Repair `cfb397d6` consumes this observation after the first dispatched seat, so every later seat reads pane/tab lists fresh after the prior dispatch can start an agent, prompt or wait. Broadcast uses one dispatch and has no later consumer. The per-pane `currentPane` calls before start/prompt and after delivery remain fresh.
- M6: `remoteBase`'s inner `git remote get-url` proved that the configured remote exists. Its sole caller, `checkBase`, calls `ensureRemote` first and supplies that proof with no remote configuration write between.
- M7: repeated root `git rev-parse --git-common-dir` calls supplied repository identity for registration matching and worktree validation. `commonDirectory` supplies the successful realpathed answer retained for that cwd in this run. Nulls and failures are evicted. Worktree creation changes worktree metadata, not the registered root's common directory.
- M8: repeated root `git remote get-url <remote>` calls supplied the configured remote URL for preflight and origin-source resolution. `remoteUrl(root, remote)` supplies the successful answer retained for that root/remote in this run. Failures are evicted and akrogon does not write remote configuration.
- M9: `gitStage`'s first `git rev-parse HEAD` had no consumer. Its later `preLocal` read remains and supplies that decision's local tip. This removes a dead read rather than retaining a ref fact across a decision or write. Fetch sites remain unchanged.

## Checks

- `check implement-format2: 0` — `bunx prettier --check src tests skills/chart-issues/scripts` (first run flagged 3 files; fixed in 232f5d5).
- `check implement-typecheck: 0` — `bun run typecheck`.
- `check implement-dispatch: 0` — `bun test tests/seat-containment.test.ts tests/next.test.ts tests/config.test.ts --timeout=30000`, 293 pass 0 fail (worker log `check-u2-dispatch-*.log` shows 292/1 with only the U4-owned `rev-parse HEAD` count red; green after U4 landed).
- `akrogon verify` green at 232f5d5: `verify test: 0` (1177 pass, 69 files), `verify typecheck: 0`, `verify leaf …: green`. Verify's own `format`/`test`/`typecheck` run-checks included in its log.

## Criterion proofs

1. Pane process-info counts: `seat-containment` boxing test asserts `process-info` calls 2 after first `next`, 6 after second — pass under `implement-dispatch`.
2. `next` neither-slice asserts `pane list` = 3, `tab list` = 1 — pass under `implement-dispatch` (count is 3, not the originally planned 2: `reconcile()` still re-lists per repo by the chart-door correction).
3. Git-shim root-identity test asserts `rev-parse --git-common-dir` 1 per root and 1 per worktree, `remote get-url origin` 1, `rev-parse HEAD` 1 — pass under `implement-dispatch`; config.test.ts `commonDirectory` case asserts one git run — green.
4. Light runs: per-binary output byte-identical (verified `pane list` source-vs-bundle diff IDENTICAL, `busctl` call record diff IDENTICAL under `$TMPDIR/proof4`); startup medians over 5 samples: `bun tests/fake-herdr.ts pane list` 20 ms → bundled 8 ms; `bun tests/fake-busctl.ts` 13 ms → bundled 5 ms. One red planned run recorded (red-first records in plan.md; `u5-restime` filter miss logged in the u5 worker report).
5. Ten alternating concurrent pairs of the configured test command (`bun test --timeout=30000 --parallel=4 --no-isolate`), one base worktree + one head worktree per pair under `akrogon run-check c5-pair-<n>`: all 20 runs exit 0 and every log ends `0 fail`. Walls 101–106 s/pair, alternated start side. Records: `proof-c5.txt`, `c5-pair-<n>-{base,head}.log`.
6. Sequential `/usr/bin/time`-equivalent (`date` ns wall around `akrogon run-check`): base `bun test` 54.4 s, head 45.9 s, head re-enter 46.3 s — medians recorded in `proof-c6.txt`; logs `c6-{base,head,head-rerun}.log`.

## Deviations

- Plan's `sight` boundary text said "3 / 1" lists; plan.md and the committed assertion were corrected to 3 pane lists before implementation (chart-door correction on reconcileRepos; implementation notes in plan.md).
- `commonDirectory` memoizes non-null only (chart-door correction): nulls and failures are never cached.
- `liveFromUnion` helper from plan D2 was dropped: reconcile keeps per-repo `panesForRepo` because `reconcile()` issues `tab close` writes between repos.
- U2's worker run had one cross-unit red (`rev-parse HEAD` 2 vs 1, owned by U4, absent from its base); resolved after landing U4 — no scope change needed.
- U5's `u5-restime` run-check exited 1 because `-t 'restime'` matched no test name; the real restime assertion runs in the changed-start test, green under `implement-dispatch`.
- Prettier found formatting drift in 3 touched files; fixed in a separate `232f5d5` commit (format gate now green).
- `adoptShell`/`inOwnScope` parameters stayed optional (U1's minimal-shape call); U2's next.ts passes them at every call site, so the read-once guarantee holds by use, not by signature.
- `/usr/bin/time` is not installed; wall times use `date +%s%N` around the run-check (same measurement point, recorded in proof-c6.txt).

## B repair, 2026-10-26

Reproduction `1a505d20eabed2c3e75b1ad85ffad5beefa0b6cd` and fix `cfb397d6250e3b6191e5b285f885e9d78e703d55` address review-B F1. Allocation observations now supply only the first dispatched seat. Later seats fetch pane/tab lists after the prior dispatch can start, prompt or wait. The new two-seat CLI test was red before the fix and green after for both first-seat agent restart and idle-agent prompting. The existing planned C1-C3 proofs also pass on the repaired code. Exact logs are in `review-B.md`.

Full `akrogon verify` is green on `cfb397d6250e3b6191e5b285f885e9d78e703d55`, receipt `771d3ec5-7c20-44e0-82f8-f1858e2d9d2f`: format 0, test 0 (1178 pass, 0 fail), typecheck 0. An initial source-format failure was corrected before this final run.

The removed-read mapping above resolves review-A Fix 4. Criteria 4-6 remain unproven: the original measurements in this report use the wrong herdr baseline, mixed pairs rather than same-revision pairs, and wall duration rather than CPU. Those figures are original observations, not accepted criterion proof. Review-B's `Handed to A` section names the missing captures and proof-command corrections, all possible with existing tools and fixtures, to run on the repaired head during `check.fix`.
