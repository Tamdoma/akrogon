# Evidence location, slot C blind notes

Sources: akrogon main f3557d8 (`src`, `skills`, `tests`), framework checkout at /home/ivan/Work/infra/tamdoma/framework (main 28d1f011c), host measured 2026-10-15 evening. Read-only; nothing deleted.

## Q1. Where a leaf's full check evidence lives after close

### Readers after the run ends, and what each needs

| Reader | Where | Needs | Evidence |
|---|---|---|---|
| `akrogon flaky` | `src/flaky.ts:10-17`, `:35` | full log text, opened at the path recorded in the verify receipt, with one `issues/open` → `issues/closed` substitution; scans `(fail) <name>` lines | code |
| verify receipt + `merged --check` | `src/verify.ts:27` (`commands[].log`), `greenRun` `:63-79`; record file `issues/verify-runs.jsonl` (`:36-37`, tracked in both repos) | path only; never opens the file; paths are absolute (`/home/ivan/...`) | code, host |
| timings | `src/run-check.ts:211-216` writes `check_end.log`; `src/timing.ts:48`; no reader uses the field (`src/timing-report.ts` reads only durations) | path only | code |
| seat B at merge | `src/verify.ts:163`, `:170` print `verify <name>: <exit> <path>`; `skills/merge-issue/SKILL.md:41`, `:53` "records its output in review-B.md"; `:73` "receipt lists each command with its exit and log"; `:75` red run: "failing output" and "both logs" into review-B.md | the path, and the full log while the leaf is open, to judge a red and paste failing output. Nothing after close | skill text |
| seat A at implement, check.fix, plan | `skills/implement-issue/SKILL.md:38`, `:65`, `:80`; `skills/check-issue/SKILL.md:67`, `:69`; `skills/plan-issue/SKILL.md:69` | same: full log while open, pasted into `report.md` or `plan.md`; the forbidden pattern at `implement-issue/SKILL.md:45` is the only read rule | skill text |
| reviewer, re-check, direct guards | `check-issue/SKILL.md:55`, `:69`; `chart-issues/SKILL.md:108`; `skills/chart-issues/scripts/direct-guards.ts` | `report.md`, `review-B.md`, the receipt. No log is opened | skill text, script grep |
| tests | `tests/run-check.test.ts:263-270`, `:286-291`, `:313`, `:370`; `tests/verify.test.ts:73-141` | a plain file at the recorded path with the run's stdout and stderr, right after the run, name `check-<name>-*.log` | code |
| operator, auditor | no code or skill; `akrogon status` prints no log (`src/status.ts`) | the full log, found by path from a review, a receipt or `git log`, any time after close; the reporter's "needed as evidence" | intake |
| committer | `src/sync.ts:6-13`, `:154-165`: `akrogon sync` stages everything under `issues/` except seeds and `.lock`; seats commit records too | puts every log in the repo at the next sync, open or closed | code |

No skill names a log file; `selftest.log`, `contracts.log`, `parity.log`, `test.log`, `test_changed.log`, `verify.log`, `merge-verify.log` and the `merge-evidence-*` folders come from seats improvising "record its output" (grep over `skills/`, zero matches for any of the names). No script in akrogon or framework opens a check log except `flaky.ts`.

### Host facts

- framework: 4,462 tracked `*.log` under `issues/`, 944.9 MiB; 4,460 in `issues/closed`, 2 in `issues/chart/*/direct`. By kind: 1,606 `implementation/check-*` run-check copies, 2,054 hand-saved in `implementation/`, 219 in `merge-evidence-*`, 581 elsewhere. Sizes p50 4.1 KiB, p90 744 KiB, max 3.1 MiB. 233 files are byte-identical to another.
- Compressed forms of the same 944.9 MiB: per file `zstd -19` 117.2 MiB, per file `gzip -9` 142.9 MiB, one `tar.zst` per closed leaf 32.7 MiB (119 archives), per closed owner 23.2 MiB (45 archives), one tar of all 19 MiB. Near-identical reruns are what compress away; per-file compression keeps 8x of the bytes.
- git: the pack is 180 MiB, of which log blobs are 115.7 MiB on disk across all history (3,965 blobs). zlib already shrinks them 8x in the pack; the 944 MiB is the working tree.
- Worktrees: every worktree akrogon makes is sparse with `!/issues/` (`src/next.ts:302`, used by leaf dispatch `:332`, verify `src/verify.ts:152`, build `src/batch.ts:116`), so akrogon worktrees carry no logs. The intake's "each leaf worktree carries issues/ too" holds only for hand-made worktrees: the 6 under the Claude Code scratchpad each carry a 663 MiB `issues/`. run-check writes to the leaf record folder in the main checkout (`src/run-check.ts:107-117`), never into a worktree.
- Backups: no repo backup job on this host (no restic/borg/timer; rclone only mounts Drive). The GitHub remote is the only off-host copy. Anything kept outside the repo has none.
- akrogon itself: 739 tracked logs, 18.3 MiB (694 closed, 45 chart direct).
- timings hold 1,088 `check_end` events (736 exit 0, 351 red) against 1,606 `check-*` files: the timing record is not a complete index of the copies.

### Pick: in the repo, one archive per closed owner, written at close; plain logs never committed while open

Reason: it is the only form that is lossless, has an off-host copy (the remote), keeps the pack from growing, and leaves every reader intact that still exists after close. After close the readers are `akrogon flaky` and a person; both are served by one archive per owner plus a path rule. Mechanism: `completeOwner` (`src/phase.ts`, the move to `issues/closed`) tars every `*.log` under the owner folder into `<owner>/evidence.tar.zst` (Bun 1.4.3 has `Bun.zstdCompressSync`, checked) and deletes the plain files; the recorded paths stay valid as member names inside the archive; `flaky.ts:11` gains one more lookup, the member in the owner archive, beside its open→closed substitution; `issues/open/**/*.log` is ignored by git so sync (`src/sync.ts:154-165`) never commits a plain log. Cost: 23 MiB of archives for today's framework (from 945), about 15 lines in `flaky.ts`, one `.gitignore` line, a tar step in `completeOwner`, and the operator reads with `tar -I zstd -xOf <owner>/evidence.tar.zst <member>`. A failed leaf that never closes keeps its logs plain and local only, so `git clean -x` would lose them until the owner closes.

### Rejected

- In repo, compressed per log at write time (`src/run-check.ts:208-209` writing `.log.zst`): working tree 117 MiB not 23, and the pack does not shrink at all, since a zstd blob is already 8x and delta-compresses no further (today's pack already holds the logs at 115.7 MiB). Covers only the 1,606 run-check copies; the 2,854 hand-saved logs stay plain unless close compresses them anyway. Breaks the same readers (flaky, tests read plain at the recorded path) for less gain.
- Outside the repo with a failure excerpt in the repo: no off-host copy exists on this host, so the evidence is one disk failure from gone, against the reporter's "lossless". The excerpt is a judgment about which lines matter, and the `(fail)` lines flaky needs are not what a human needs. Paths in `verify-runs.jsonl` and `timings.jsonl` would point outside the tree, so the open→closed rule in `flaky.ts:11` breaks and a second location rule is needed anyway.
- Leave plain, stop tracking: loses evidence on clean or clone, fails the reporter outright.

### Evidence lines

- host, first hand, 2026-10-15: sizes and compressed totals above, measured over `git ls-files 'issues/*.log'` in the framework checkout; pack share via `git cat-file --batch-check='%(objectsize:disk)'`.
- code, akrogon f3557d8: `src/flaky.ts:10-17`; `src/verify.ts:27`, `:36-37`, `:63-79`, `:163-170`; `src/run-check.ts:107-117`, `:208-217`; `src/timing.ts:48`; `src/next.ts:302`; `src/sync.ts:6-13`, `:154-165`; `src/phase.ts:81-99` (failure notice carries cause and reason, no log).
- skill text, same commit: `merge-issue/SKILL.md:41`, `:53`, `:73`, `:75`; `check-issue/SKILL.md:55`, `:67`, `:69`; `implement-issue/SKILL.md:38`, `:45`, `:65`, `:80`; `plan-issue/SKILL.md:69`; `chart-issues/SKILL.md:108`.
- intake, Tamdoma/akrogon#92, 2026-10-15: the 19 MiB whole-tar figure reproduced (per-owner is 23 MiB).
- lock, test-runs base-red-rule.md:27 (2026-10-02): "keep logs" for an incomplete base run; every in-repo form satisfies it, the outside-repo form only with a backed-up store.

### Pitfalls and what removes each

- Recorded absolute paths (`verify-runs.jsonl`, `timings.jsonl`, both tracked) stop resolving once the plain file is gone. Removed by: the archive member name equals the path's tail from `issues/`, and `flaky.ts:11` tries open path, closed path, then owner archive member.
- Logs committed while open still land in the pack forever. Removed by: ignore `issues/open/**/*.log` and `issues/chart/**/direct/*.log`, so only the archive is ever committed; sync already skips nothing else.
- An archive written at close misses logs a seat saves after close (a broadcast run, a late repair). Removed by: `completeOwner` is the last writer by design (`skills/merge-issue/SKILL.md:81`: closure and folder moves belong to the command), and a log found plain under `issues/closed` on a later pass is reported, not silently dropped.
- Tests assert plain `check-*.log` files right after the run (`tests/run-check.test.ts:263-270`). Unchanged by this pick, since the run still writes plain; a per-log compression pick would rewrite them.
- Hand-made worktrees and clones keep the old 944 MiB in history. That is the existing-backlog fork; the archive only stops growth.
- The archive dedups reruns only within one owner. Cost is 23 vs 19 MiB today; acceptable, and per-owner archives never rewrite, so a changed archive never re-enters the pack.

### Questions the fork does not ask

- Should a plain log ever be committed while a leaf is open? `src/sync.ts:154-165` stages all of `issues/` on every sync, so whatever the close form is, the pack keeps growing at the open stage unless open logs are ignored. The fork's three options are all about close.
- Are the hand-saved logs (2,854 of 4,462 files) in scope here or only under log-coverage? Every close-time form covers them for free; a write-time form does not.
- Is `akrogon flaky` the only required reader contract after close? It is the only code that opens a closed leaf's log; if so, the reader rule is one function, not a format promise to seats.
