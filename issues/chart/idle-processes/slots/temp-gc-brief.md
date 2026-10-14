# Brief: test temp lifecycle and garbage collection (B, C, D, independent)

Write `/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/temp-gc-<your slot letter>.md`. Do not read another slot's temp-gc file. Change no code, state, process or file outside your answer.

## Operator (verbatim, 2026-10-14)
"Yes, but we need a garbage collector that's very active and removes those files from the disk. We've had this issue a long time ago (about 1 month ago, and we changed to RAM because of that). Consult with both slots to find the most elegant solution for this. Also spawn a slot D consultant: Claude Fable 5.1 with medium effort. I need the best decision here."

Earlier operator rules still binding: "don't put any caps, it must not be the solution. The solution is killing idle processes, and figuring out how to make the tests better." No pattern kills. The memory start check is being removed (run-units leaf, operator O1).

## The problem
Framework tests leave temp behind: 216 MB scratch git repos (csp-spine-*), 0.8-0.9 GB build trees (site-*, cfm-*), a bunx install per run with a 134 MB workerd binary, page-measure browser profiles, plus fixed-path producers (/tmp/swi from .claude/hooks/tests/scratch-writer-isolation.test.ts:75, page-measure.mjs:368 fallback, /tmp/ftf-logs). Overnight this sat in tmpfs (/tmp, RAM) at up to ~34 GiB shmem (slots/overnight-B.md, overnight-C.md). On disk it fills the disk.

## History to verify, do not trust A's summary
- 2026-10-01 chart `issues/chart/test-time-and-temp/forks/leaf-temp.md`: leaf temp on /var/tmp/akrogon-<uid>, 7-day sweep in the operator's `~/.local/bin/tmp-sweep` (systemd user timer `tmp-sweep.timer`, hourly; it skips /tmp/akr-<uid>).
- 2026-10-02 `5b2f4d0`: back to /tmp (RAM). Commit text: "On-disk /var/tmp made headless Chromium captures hang at random in framework verify." Also NODE_DISABLE_COMPILE_CACHE=1 (compile cache grew one leaf to 657k files) and the new-tab wipe.
- 2026-10-10 `3ae682f` ~/.akrogon/scratch; 2026-10-11 `2c3a0af` /tmp/akr-<uid> for Chrome's 107-byte socket path.
- The operator remembers moving to RAM because disk filled. Check which reason is true, and whether the Chromium hang claim has evidence (framework logs, issues, learnings) or was a guess.

## Current code
`src/config.ts:265-279` leafTemp; `src/run-check.ts:151,199-201` per-run root removed in finally; `src/reconcile.ts:401-447` scratch sweep on next passes; `src/shell.ts:34` akrogon-io capture in the wrapper's tmpdir; run-units (worktree `/home/ivan/.akrogon/worktrees/akrogon/run-units`) adds a transient scope per run and a stale sweep.
A has a reviewed, unlanded change in `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cfe3f182-ee22-4083-abee-b4fb35991889/scratchpad/wt-temp` (diff `/home/ivan/Work/infra/akrogon/issues/chart/idle-processes/slots/fix-temp-diff-2.patch`): root to /var/tmp/akr-<uid> and the new-tab wipe removed. It is on hold because of the 10-02 history.

## Question
What is the most elegant design so test temp never piles up, in RAM or on disk? Cover:
1. Where temp lives (tmpfs, disk, per-run namespace or anything better) and the evidence for it, including the Chromium claim.
2. Who deletes what and when: the operator asks for a very active collector. Say whether a collector is the best answer or whether ownership (run lifetime, run units, test cleanup) removes the need, and how the two combine. What is live and must never be deleted, and how the collector knows.
3. The framework side: which producers to fix at the source (bunx reuse, scratch repos, build trees, fixed /tmp paths).
4. What to do with A's unlanded change.
5. What each option could break now or later, and how done is proven.

Cite file:line, commands and outputs, and outside sources (systemd docs, Chromium, Bun) with dates. Mark low-confidence claims. Keep it short. End with your single recommendation.
