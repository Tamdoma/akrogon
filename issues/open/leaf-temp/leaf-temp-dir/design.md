# Design: leaf-temp-dir

## Binding decisions, verbatim

From issues/chart/test-time-and-temp/forks/leaf-temp.md. Operator 2026-10-01, verbatim (round 2): "1 - leaning towards a, but why can't it all be inside of the repo where akrogon is doing work, why does it HAVE to be in /var/tmp/? I'm just asking I'm a noob. | 2a - How will that work exactly? I'm just afraid we are adding more complexity, but it's fine. I just need to understand. eli | 3a - Does it have to be after 30 days? I don't think it should be more than 7 days, honestly. What is the catch here? | 4a |" Operator 2026-10-01, verbatim (round 3): "1a | 2a |"

### Location: 1a
`/var/tmp/akrogon-<uid>/<slug first 20 chars>-<12 hex of sha256(repo.root + "\n" + slug)>`, derived by one function beside `worktreeStore`, never stored; parent and leaf folder created 0700 with ownership checked; at most 61 bytes for a 10-digit uid, inside the measured 62-byte Chromium limit. Reason: inside the repo the path exceeds the Chromium socket limit (framework worktree root alone is 57 chars) and temp files in a worktree make `akrogon phase` refuse it as dirty (`src/phase.ts:253-256`). Tests use an internal root and never write `/var/tmp`, with no documented config key. Foreclosed: hash-only name, mkdtemp recorded in state, `<repo>/<slug>` names, worktree-side and `~/.cache` folders.

### Deletion: 2a
Delete once the merged leaf's tab is confirmed gone: in the `tab_closed` hook branch when the owning leaf is merged, with `cleanupMerged` as catch-up when the tab has no live panes, before its `issues/open` early return; `rmSync` recursive force, then `git worktree prune` at repo root; errors through `report()` and retried on the next run. Failed leaves keep their folder. No phase-end wipe. Foreclosed: delete right after the tab-close command, delete with the worktree.

### Expiry: 3a, corrected to 7 days
Temp is scratch; evidence (failing names, log tails) goes in the leaf folder. Operator's `~/.local/bin/tmp-sweep` gets one loop deleting `/var/tmp/akrogon-<uid>/*` entries whose newest file is older than 7 days; no akrogon code. The operator accepts that a leaf paused 7 days with no file changes loses its scratch. Foreclosed: akrogon-owned age sweep, OS 30 days only, lock or tmpfiles exclusion. Status: the loop was added and tested on 2026-10-01; this leaf adds no age logic.

### Export: 4a
`TMPDIR` only, via `placement` in `allocate`; folder created on every dispatch; workers inherit. One skill line in implement-issue, check-issue and merge-issue: temp files, logs and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder. Foreclosed: `TMP`/`TEMP`, explicit worker carry.

### Excluded binding decisions
check-proof Q1-Q3 (no runner, base-red exit, plan rule) belong to leaf base-red-exit. This leaf only supplies the `$TMPDIR` that base-red-exit's base worktree uses; base-red-exit works without it.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- Cheapest sufficient test: command scenarios in `tests/next.test.ts` with the existing fake herdr (`tests/fake-herdr.ts`) and fixture helpers (`tests/helpers.ts`) prove env placement, creation and deletion. No live herdr or Chromium run is required for merge; the Chromium limit is a measured fact proved here as a path-length test.
- Negative cases are consequence driven: the failed-leaf keep case (losing diagnosis) and the live-pane keep case (deleting files under a running seat) are the realistic failures.
- No vanity tests: no assertions on skill or guide wording (lesson 2026-10-01, prose assertions couple tests to wording); criterion 7 is checked by review.
- No secrets, no auth surface.

## Leaf architecture

Owned surfaces:
- `src/config.ts`: one exported function `leafTemp(repo: Repo, slug: string): string` beside `worktreeStore`, returning the derived path. The root `/var/tmp/akrogon-<uid>` comes from `process.getuid()`.
- `src/next.ts`: `allocate` creates the parent (0700, ownership checked, refuse a parent owned by another user or a symlink) and the leaf folder (0700) on every dispatch before building `placement`, and adds `'--env', \`TMPDIR=${leafTemp(repo, slug)}\`` to `placement` (`src/next.ts:302-310`). The `tab_closed` branch (`src/next.ts:721-731`, not the hook-pane branch after it) (C) deletes the folder and runs `git worktree prune` in `repo.root` when the owning leaf's phase is `merged`. `cleanupMerged` (`src/next.ts:559-566`) does the same before the `issues/open` early return, only when the temp folder exists and no live pane belonged to the leaf's tab before `closeMergedTab` ran; a leaf whose folder is already gone costs one `existsSync` and no git call, since the sweep visits every merged leaf in open and closed. (C) Deletion is `rmSync(path, { recursive: true, force: true })`. In `cleanupMerged` errors reach the existing `report()` through `cleanupRepos`. The `tab_closed` branch wraps its deletion in the same `try`/`report(invocation, repo.name, leaf.path, error, slug)` form `cleanupRepos` uses (`src/next.ts:645-650`); the next sweep retries. (C)
- `tests/helpers.ts`, `tests/next.test.ts`: the test seam points the temp root inside the fixture. The seam is internal: no `config.yaml` key, no CLI flag, not in the guide. The plan picks the mechanism and states it.
- Skills: one sentence each in `skills/implement-issue/SKILL.md` (Shared context), `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`.
- Docs: `docs/guide/merge.md:33`, `docs/guide/problems.md:53`, `docs/guide/limits.md:10` and any other guide line about merged cleanup; `src/AREA.md` if it describes `allocate` env.

Exclusions:
- No `TMP`/`TEMP`, no state field, no config key, no status column, no phase-end wipe, no age sweep, no park or close hooks.
- No change to when or how merged tabs close (`src/next.ts:744-753`); the existing close-before-idle race is out of scope.
- No change to worker worktree cleanup.
- Leaves running at rollout keep their old env until their panes are recreated; no migration.

Dependencies: none. Operation proofs, 2026-10-01: herdr 0.9.1 `tab create --env TMPDIR=...` and `pane split --env TMPDIR=...` reached the pane shell (`os.tmpdir()` and `mktemp -d` used it; probe tab closed, folder removed); codex-cli 0.159.2 and pi 0.99.1 shell commands inherited TMPDIR; git 2.55.0 `git worktree prune` removed an entry whose folder was deleted; system Chromium 1243 aborted with `Socket path too long` at a 73-byte TMPDIR and started at 23 bytes. Not proved: a clean Claude Code probe (refused by the permission classifier; Claude is not a configured slot harness).
