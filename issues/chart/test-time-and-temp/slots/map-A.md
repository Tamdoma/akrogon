# Map A

## Root causes behind lost test time

F1. Whole-suite criteria still reach seats through two doors the check-scheduling fix did not close.
- Plan door: `skills/plan-issue/SKILL.md` has no rule against plan-authored whole-suite requirements. emdash-content-fixes `plan.md:111` IN5 ("new test files also run under the existing whole-dir `test:emdash-conversion`") came from the plan, not the brief. check-scheduling Q3 3a guards only the chart audit (`shapes.md:132,170`).
- Legacy door: framework open leaves charted before the audit still name `framework:verify` or the whole-dir suite: emdash-conversion, emdash-kit, emdash-content-fixes, emdash-launch (brief.md, plan.md). These are framework contracts; changing them is framework intake, not akrogon code.

F2. A seat cannot cheaply tell its failure from a base failure. emdash-content-fixes `implementation/report.md:58-69`: A built `/tmp/edd-base-check` by hand, ran a 514 s base suite, and the operator had to stop it. `implement-issue/SKILL.md:34` correctly forbids handing off a red done-criterion as "base red". The gap is no fast exit: nothing tells A "compare once against `AKROGON_BASE`, and if base is also red, stop and tell the operator".

F3. The red tests were environmental, not code: shared browser-core profile at `~/.tamdoma/browser-core/runtime/browser-profile` locked by another session's Chrome (report.md:61-63), plus whole-folder order/load sensitivity. A record runner or base diff does not fix shared global state. This is framework test isolation (framework#113, #115).

F4. Framework `checks` are mislabeled: `test` and `test_changed` both run only `hooks:parity && contracts:verify` (framework `issues/config.yaml`), so "changed tests" never run the leaf's tests, and `selftest` (the 25-minute stall) blocks every leaf. Framework operator config, already Off route in check-reruns.

F5. The check-record runner (#50 item 1) was rejected on 2026-10-01 (check-reruns Q1 1a: no savings shown, reuse needs declared inputs). #50's new evidence does not show a same-SHA rerun either. The hour went to F1-F3. A runner would not have saved it.

## /tmp

F6. Seats already get per-pane env at launch: `src/next.ts:302-308` passes `--env AKROGON_BASE=...` to `herdr tab create` and `pane split`. One more `--env TMPDIR=<dir>` reaches seats and every subagent worker they spawn, `mktemp`, `os.tmpdir()`, Bun and Playwright.
F7. Merged worktrees are removed in one place: `cleanupMerged` (`src/next.ts:559-565`, `git worktree remove --force`). Park refuses running leaves (`src/park.ts:22-26`). A failed leaf keeps its worktree. So "temp lives and dies with the worktree" needs one rm next to that line and no new lifecycle.
F8. Claude Code follows TMPDIR: probe 2026-10-01, Claude Code 2.1.286, `TMPDIR=<dir> claude -p ...` created `<dir>/claude-1000`; same with `CLAUDE_CODE_TMPDIR`. The 265k-inode scratchpad in #49 would move with it. Probe ran with an inherited parent session id, so a clean `env -u` probe is still owed at handoff. Codex 0.159.2 and pi 0.99.1 not yet probed.

## Forks

Q1. Build the check-record runner now (#50 items 1-2, 3 as code)?
- 1a (rec) No. Close F1's plan door with one plan-issue rule mirroring shapes.md:132, and add F2's fast exit. Reason: the evidence shows unowned criteria and environment reds, not repeated same-SHA runs.
- 1b Yes, runner with SHA records, base diff and merge refusal. Cost: new command, record store, flaky/interference handling, timeout ownership. Large new mental model.

Q2. What does a seat do when a check or criterion is red and it suspects base?
- 2a (rec) Run the same command once at `AKROGON_BASE` in a detached worktree under `$TMPDIR`. Red on base too: end the pass `failed --reason "<cmd> red on base <sha>"` with both logs. Green on base: it is the leaf's failure, repair as today. Keeps SKILL.md:34 (no base-red handoff) and gives the operator a 1-line cause.
- 2b Treat base-red as pre-existing and continue (#50 item 2). Conflicts with seat-exit-rules lock and lets main stay red with no owner.

Q3. Legacy open leaves with whole-suite criteria?
- 3a (rec) Not akrogon code. Operator runs chart-issues in framework to narrow those criteria and take #115. A phase-time detector of "repo-wide" is fuzzy text matching.
- 3b `akrogon phase` flags them (#50 item 3). Brittle.

Q4. Where does the leaf temp dir live?
- 4a (rec) `<worktree_store>/<slug>.tmp`, sibling of the leaf worktree. Disk-backed, already gitignored by init, outside the leaf git tree so `requireClean` is unaffected, and the operator already knows that folder.
- 4b `~/.cache/akrogon/<repo>/<slug>/tmp` (seed). A second place to know about.
- 4c Inside the worktree as `.tmp/`. Shows in `git status` unless every consumer ignores it.

Q5. When is it deleted?
- 5a (rec) With the worktree, in `cleanupMerged`. Failed leaves keep it for diagnosis, like the worktree.
- 5b Also at every phase end (seed item 2). Deletes logs that report.md and review files cite between phases.

Q6. Status shows temp size (seed item 5)?
- 6a (rec) No. Size is visible by `du` on one folder. YAGNI.

Q7. Skill guidance: one shared line in implement/check/merge "write temp files, logs and debug copies under `$TMPDIR`, never a fixed `/tmp/<name>`". (rec yes, one line each, no other prose.)

## Pitfalls
- TMPDIR must exist before the seat starts, or `mktemp` fails. Create it at allocate.
- Codex may filter env (shell_environment_policy). AKROGON_BASE already travels the same way, which is evidence but not proof for TMPDIR.
- Tests that hardcode `/tmp` ignore TMPDIR. That is framework test hygiene (framework#115 says tests own their cleanup).
- Moving temp to disk changes speed for tmpfs-heavy tests. Likely negligible on btrfs NVMe, unmeasured.

## Off route
- Framework config cleanup (F4), legacy emdash criteria (F1 legacy), browser profile isolation (F3), framework#113, #115: framework repo.
- OS sweep of /tmp for non-akrogon sessions: operator backstop (#49 says so).
- Per-leaf temp size in status (Q6).

## Research
- better-than-training · src/next.ts:302-308, 559-565; src/park.ts:22-26; implement-issue/SKILL.md:34,48; plan-issue/SKILL.md (no whole-suite rule); shapes.md:132,170; framework issues/config.yaml; emdash-content-fixes plan.md:89,111 and report.md:58-69 · read 2026-10-01 · grounds F1-F7.
- better-than-training · probe Claude Code 2.1.286 TMPDIR, 2026-10-01 · creates `<TMPDIR>/claude-<uid>` · makes 4a cover Claude seats' scratchpads.
- practitioner · not searched yet for base-diff practice (Bors/"not rocket science" rule, Graydon Hoare 2014; Google TAP flaky handling) · to be added in the fork round.
