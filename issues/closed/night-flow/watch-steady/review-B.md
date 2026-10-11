# Review B: watch-steady

Date: 2026-10-11. Phase: check.review. Verdict: ready.

Base: `c53f6196533289555518577f08907ec9c713721c`.
Reviewed head: `f0b4e7994e57672739b3fe4732e42271306c7c2e`.

Read the brief, plan, design, implementation report and check-issue ponytail guidance before reviewing the whole diff. Debate is disabled, so no positions or rebuttal artifacts are expected. Only `skills/watch-issues/SKILL.md` changed. No code, test, runner configuration, AREA file or lesson removal changed. Worktree is clean.

## Findings

No Fixes, Nits or operator actions.

## Verification

- C1: reran the plan's self-stop grep and read the complete skill. The remaining matches are lines 14, 16 and 18. Line 14 says, "The watch never self-deletes: it ends only on `/watch-issues stop`, session loss or the job's own expiry." The initial invocation always proceeds to CronList/create, a tick never creates a job, and the only CronDelete instruction is the unchanged operator stop invocation. The stop section and all four references named by D2 are gone. The factual seven-day creation report remains without an expiry warning.
- C2: reran the pause grep. The first content in Observe, line 22, says, "A check begins by running `akrogon status` at `<root>`." The same paragraph prohibits the observe script, next, phase and herdr commands when paused, ahead of all their execution instructions. Traced the actual status contract in `src/status.ts:350-413`: status reads pause and prints the repo's `(paused)` mark, or `paused: <name>` with a slug. Traced `src/next.ts:1565-1575` to confirm explicit next passes `false` for automatic dispatch and therefore needs this skill gate. A paused tick reports paused and performs no leaf work. A paused initial invocation still creates or reports its cron as D3 requires. The report also records the scratch-home pause/status/unpause probe, with the real pause file untouched. No additional live mutation was needed.
- C3: independently swept `skills/`, `docs/` and `README.md` for watch references in Markdown and read the affected operator guide section. README, cheat, install and the skills index describe an optional watch. `docs/guide/install.md:57` requires Claude Code for this skill, not the watch for akrogon. The two stale claims at `docs/guide/in-practice.md:81` (conditional creation) and `:89` (self-stop) are explicitly excluded by D4 and correctly listed in the report. No additional in-scope self-stop or required-watch statement was found. The skills index remains accurate. No changed AREA file needs a path listing.

The changed documented behavior is the watch's job lifetime and pause gate. The unchanged human guide page was inspected above against the explicit exclusions.

## Planned checks and test changes

Reviewed the report and the final implementation logs, all under `implementation/`:

- `check-format-1791713427891-1910955.log`: frozen install and the planned format runner complete, files unchanged.
- `check-typecheck-1791713430450-1914834.log`: frozen install and `tsc --noEmit` complete without errors.
- `check-test-1791713556169-1927733.log`: frozen install and `bun test --timeout=30000`, 792 pass, 0 fail, 41 files, terminal result present.
- `check-test_changed-1791713560942-2594225.log`: frozen install and changed-test run, one changed file with no affected tests, 0 fail, terminal result present.

These support the report's runs of the four configured checks. The sole Markdown edit neither skips nor filters a planned unit and changes no runner dependency. No missing evidence or specific concern warrants repeating the checks. No comparisons were needed. The standing design explicitly uses a meaning-based text sweep rather than code tests for this skill-only change.

`Test-Change:` trailers in `c53f6196533289555518577f08907ec9c713721c..HEAD`: none. Checked the path rule in `src/test-files.ts`; the sole changed skill Markdown file is not a test file. No existing expectation, fixture or output was changed.

## Merge verification 2026-10-11

Attempt: `48b348a3-75d6-4366-b3cc-f4a91bf71ce1`. Base: `f9b4229e1c4f7d931a29a5142fbc5eaf8ba9ecab`. Tested top: `ad5008138bcbddb9d04b808c7226168b2f45f6e5`. Applied stack with no carried members. No fetch, rebase or commits performed.

Ran every configured check on the recorded top, with no merge_covers, merge_checks or advisory commands. All exit statuses were 0. Format unchanged, test 813 pass / 0 fail across 42 files, typecheck green, test_changed one changed Markdown file with no affected tests.

- `format`: `implementation/check-format-1791713777533-3481265.log`.

```sh
akrogon run-check --name 'format' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run format'\'''
```

- `test`: `implementation/check-test-1791713880579-3487708.log`.

```sh
akrogon run-check --name 'test' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun test --timeout=30000'\'''
```

- `typecheck`: `implementation/check-typecheck-1791713882493-3952946.log`.

```sh
akrogon run-check --name 'typecheck' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\''bun run typecheck'\'''
```

- `test_changed`: `implementation/check-test_changed-1791713882631-3955594.log`.

```sh
akrogon run-check --name 'test_changed' -- sh -c 'akrogon guard ancestors && flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c '\''bun install --frozen-lockfile'\'' && akrogon guard own-modules && sh -c '\'': "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000'\'''
```

Completion-owner check: night-flow still has open siblings (records-sync, plan-not-cap, pass-refresh, guard-at-creation and seat-retry), so this single-leaf attempt cannot complete its issue. Read night-flow/ISSUE.md and checked sibling phase records.
