# Merged map: test-time-and-temp

Merged by A from map-A.md, map-B.md, map-C.md on 2026-10-01. Tags name the slots that agree.

## Root causes

F1. Whole-suite criteria still reach seats. (A,B,C)
- Legacy leaves: framework emdash-content-fixes `brief.md:27`, `plan.md:89` (C8 `framework:verify`), and emdash-conversion, emdash-kit, emdash-launch still name `framework:verify` or the whole-dir suite. emdash-launch (`plan.synthesis`, `brief.md:84`) is next, and `framework:verify` is red in 9 places (framework seed 115). (C found emdash-launch) The chart audit (`shapes.md:132,170`) only runs on new charts.
- Plan door: emdash-content-fixes `plan.md:111` IN5 (whole-dir `test:emdash-conversion`) was written by the plan, not the brief. `skills/plan-issue/SKILL.md` has no rule against plan-added whole-suite requirements. (A) `implement-issue/SKILL.md:48,62` "unless a done-criterion needs a whole run" then lets it run. (C)

F2. No rule for a failure already red on base. `implement-issue/SKILL.md:48` "repair any failure", `check-issue/SKILL.md:49-51` failed checks always block, and `SKILL.md:34` forbids a base-red handoff. Nothing says what to do when the same command fails at `AKROGON_BASE`. The seat built `/tmp/edd-base-check` by hand and ran 514 s on base before the operator stepped in (`report.md:58-69`). (A,C) B: this is a deliberate lock (red-criterion), so changing who owns base red is a policy choice, not a missing detail. (B)

F3. Tests share machine state. browser-core's profile defaults to `~/.tamdoma/browser-core/runtime/browser-profile` (framework `cdp-core.mjs:67-70,246-247`), and another session's Chrome held it, so the spine was red on base and head. Whole-folder runs fail 38 tests that pass alone or in pairs. (A,B,C) Framework-owned.

F4. Framework `checks` repeat work: `test` and `test_changed` both run `hooks:parity && contracts:verify`, which are also separate entries, so the leaf's own tests never run as "changed tests", and `selftest` (the 25-minute hang) blocks every leaf. (A,B,C) Framework-owned.

F5. The check-record runner would not have saved the hour: every run in question was red, and SHA alone does not capture browser profiles, deps or env. (A,B,C) B adds: a phase refusal after merge-issue already pushed cannot enforce a pre-push gate. (B)

F6. Temp has no owner. Seats get only `AKROGON_BASE` and `GIT_EDITOR` (`src/next.ts:302-310`). `cleanupMerged` (`src/next.ts:559-566`) removes only the worktree. (A,B,C) Park refuses leaves with a worktree, and `close` closes GitHub identities, not leaves, so the seed's park/close hooks have nothing to clean. (A,B,C)

F7. Claude Code follows TMPDIR: with `TMPDIR=<dir>` (and with `CLAUDE_CODE_TMPDIR`), 2.1.286 created `<dir>/claude-1000`. (A probe) It keeps live task output there, so a phase-end wipe can delete files a running session uses. (C) Codex 0.159.2 and pi 0.99.1 not probed. (A,B)

F8. Unix socket paths cap at 108 bytes, and Chromium puts `SingletonSocket` under TMPDIR. Measured lengths for emdash-content-fixes: beside the worktree 127, `~/.cache/akrogon/.../tmp` 106, `/var/tmp/akrogon/framework/emdash-content-fixes` 93. (C, measured by A) `/var/tmp` is btrfs with 30-day OS aging. `/tmp` has the operator's 2 h user sweep. (C) `/var/tmp` already holds 132 `akrogon-dispatch-*` test fixtures from 2026-09-05, left by an old akrogon test run. (A)

## Forks

### check-proof
- Q1 runner: keep check-scheduling Q1 1a, no runner. (A,B,C)
- Q2 base red: rerun the same command once, same mode, at `AKROGON_BASE`.
  - Red on base too: stop and fail the leaf to the operator with both logs; main is the problem. (A,B)
  - Compare failing test names; base-red tests are recorded and not repaired, only new failures block; a whole command red on base with no test names fails the leaf. (C)
- Q3 plan door: plan-issue gets the shapes.md:132 rule, so a plan cannot add a whole-suite or `merge_checks` requirement the brief does not have. (A; B and C did not raise it)
- Legacy leaves: one operator-approved pass over open framework contracts, not akrogon code. (A,B,C) Off route here; framework destination.

### leaf-temp
- Location: `/var/tmp/akrogon/<repo>/<slug>`, disk, 30-day OS aging for orphans, short enough for Chrome sockets. (C; A and B proposed beside the worktree, which F8 rules out)
- Export: `TMPDIR` only, via `placement` in `allocate`, so tab and every pane split get it, and workers inherit it. (A,C) B: also `TMP`, `TEMP`, and carry explicitly to workers. (B)
- Lifetime: delete only where the worktree is removed (`cleanupMerged`). Failed leaves keep it. No phase-end wipe. (A,B,C)
- No status size column, no new config key. (A,B,C)
- One skill line: temp files, logs and base copies go under `$TMPDIR`, never `/tmp/<name>`; anything needed after merge goes in the leaf folder. (A,B,C)

## Pitfalls
- `--env` applies only to new panes; running leaves keep old env until panes are recreated. (B,C)
- TMPDIR must exist before the seat starts. (A)
- akrogon tests isolate only `AKROGON_HOME` and `tmpdir()` (`tests/helpers.ts:12,44`); a fixed `/var/tmp/akrogon` root needs a test seam or tests write into the real root. (C)
- Report evidence paths under `$TMPDIR` stop resolving after merge. (B,C)
- Comparing failure sets under contention is unreliable; two nonzero exits are not the same failure. (B)
- Tests hardcoding `/tmp` and browser-core's `~/.tamdoma` profile ignore TMPDIR. Framework hygiene. (A,C)

## Off route
- Framework: legacy whole-suite criteria, browser profile isolation, duplicate `checks`, selftest hang, red `framework:verify`, fixture `node_modules` copies, framework#113, #115. (A,B,C)
- Post-merge main health runs and auto-seeding. (B,C)
- OS-wide /tmp sweeps for sessions akrogon does not run. (A,B,C)

## Research (merged)
- better-than-training · inspected code and framework evidence, 2026-10-01 (all slots).
- better-than-training · Claude Code 2.1.286 probe and strings (A,C); systemd "Using /tmp and /var/tmp Safely" https://systemd.io/TEMPORARY_DIRECTORIES/ (B); Node `os.tmpdir` docs (B); Bazel test encyclopedia and remote caching docs (B).
- practitioner · Graydon Hoare, "The Not Rocket Science Rule", 2014 (C); Martin Fowler, "Eradicating Non-Determinism in Tests", 2011 (C); John Micco, "Flaky Tests at Google", 2016 (C); Kent Beck, Test Desiderata 2019 and SO answer 2008 (B,C); Andrew Trenk, Google Testing Blog 2013 (B).
