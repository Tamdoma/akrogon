# Rebuttal: red-exit (slot C)

Disagreements, missing material items, and current position on each differing point in `slots/red-exit-merged.md` (checked 2026-11-21).

## Q2 — Push handling (differs)

- **Disagree with B ("push errors and refused pushes stay with the command; the next wake relaunches land")**: Leaving `state.batch` on the holder with `owner: 'command'` pins `mergeQueue[0]` (`src/turn.ts:120`), blocks every leaf behind it on a leaf-specific remote rejection (hook, secret scanning, oversized file) or outage, flags `'merge job stopped'` (`src/status.ts:602`), and causes `akrogon next --wake` (`src/next.ts:950-959`) to spin-relaunch `land` on every terminal event.
- **Disagree with A ("a push error also goes to `check.repair`")**: Seat B is forbidden from running `git push` (`skills/merge-issue/SKILL.md:10`) and cannot resolve a second non-fast-forward or an auth/network failure, so waking B spends tokens for nothing (Lock 1a).
- **Position held (C)**: Keep `land`'s 1 automatic `restack` (`src/land.ts:106-107`), clear `batch` and leave the leaf in `merge` on a 2nd non-fast-forward, and move fatal push errors (`pushed.kind === 'error'`) to `failed` with git's stderr (frees the line at once, fires the existing `failed` notice, costs 0 tokens).

## Q3 — `akrogon flaky` blindness, leaf receipt, `--holder` (differs)

- **Missing interaction on line 22 (`akrogon flaky` blindness)**: B's catch is right (`src/flaky.ts:75` keys `flips` on `run.tree`, which changes after rebase onto a moved `main`), and it directly weakens any Q5 guard that relies solely on `flakyLines` to filter new flakes — making Q5's per-unit resolution load-bearing.
- **Position held on leaf receipt (C)**: Skip `requireGreenReceipt(repo, HEAD, 'leaf')` (`src/phase.ts:443`) when leaving `check.repair -> merge` with `merge_exit` set and `HEAD` equal to the evicted `top`, because 6+ other registered repos (`akrogon`, `lingua-relay`, `clinique-la-roya`, `lens`, `Himne`, `blepsis` `issues/config.yaml`, 2026-11-21) put their full suite in `checks`, so requiring a fresh `leaf` receipt on an unchanged rebased flake would run a second full suite off-line.
- **Position held on `--holder` / `full:` (B)**: Adopt B's one-line `full: [verify]` in `framework/issues/config.yaml` (existing `src/admission.ts:147`) to close `akrogon verify --holder` running beside the line.

## Q4 — Return place (differs)

- **Disagree with A ("second red in one merge entry goes `check.fix`")**: Under Q1 (`merge -> check.repair -> merge`), every eviction starts a new `merge` entry; even read as "second red without an intervening `check.fix`", forcing a double-flake victim into `check.fix` wakes slot A and adds a `check.review` turn, growing token cost (Lock 1a) with zero leaf bug.
- **Position held (shift to B)**: Keep the first `merge_stamp` on the 1st return to `merge` regardless of path, and reset `merge_stamp` from the 2nd return on, counted from `issues/log.jsonl` (zero new state on `state.yaml`). Re-verified on framework ledgers (`2026-11-14..21`): first-verify green rate is `109/201` (54.2%) on entry 1, `24/40` (60.0%) on entry 2, and `3/7` (42.9%) on entry 3+, so B's simpler zero-state rule beats C's `check.repair`-only `merge_returns` counter.

## Q5 — Main-red resolution and first observation (differs)

- **Disagree with B on resolution ("no fully green run landed on main since")**: On `2026-11-15T02:00:03`, `rewrite-copy-review`'s base run failed both `skills-typecheck-switch` (real main red) and `c3: WebSockets...` (flake), plus 3 other one-off flakes failed base runs during Nov 15–17 while 0 whole-command green runs landed on main for 61h (`framework/issues/verify-runs.jsonl`, 2026-11-21). B's rule would leave all 4 flaky tests falsely covered for 61h, whereas the very next landed commit (`a6069248` at `02:28:40`) ran to completion without `c3: WebSockets...`, closing it in 28 min under per-unit resolution.
- **Disagree with A and B-alone on first observation**: A adds a new request flag and lets leaves #2..#k evict while leaf #1 is in `check.repair`; B-alone also lets leaf #2..#k evict in a busy queue, and `skills/check-issue/SKILL.md` currently directs B to send a reproducing red in `check.repair` to `check.fix` (A) unless told to return an untouched-diff base red to `merge` unchanged.
- **Position held on resolution (C)**: Per-unit resolution (close a covered unit when any later completed landed-main run either exits 0 or finishes cleanly with real-title failures omitting that unit and no nameless/aborted script) plus excluding `flakyLines` titles, and showing active covers in `akrogon status`.
- **Position held on first observation (C + B combined, zero new state)**: Trigger one in-line base pass from `verify-runs.jsonl` whenever either (i) 2 consecutive distinct leaves fail `land` on the same uncovered real test title (12 of 17 consecutive overlaps `2026-11-14..21` were `skills-typecheck-switch`, catching broken main on leaf #2 in a busy queue) OR (ii) a returning leaf fails the same real test title as its previous exit run (B's rule, covering a 1-leaf queue with no new state, paired with `check.repair` skill text directing B to return an untouched-diff reproducing red to `merge` unchanged).
