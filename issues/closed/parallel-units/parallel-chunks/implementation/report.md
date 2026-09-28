# Report: parallel-chunks (implement)

Base: `755babc1e1c4f0e539c78562f38771d899f30d2a`. Committed head: `0c8352f473a7b3538ce39498e2f3fc7c806fbc8f` on branch `parallel-chunks`. Worktree clean at handoff.

Delegated mode, two worker briefs run sequentially in the leaf worktree; returns folded below.

## Changed files and reasons

- `skills/implement-issue/brief-template.md` (brief-1, C1): section 4 now requires each delegated-leaf brief to record chunks that must land first, owned paths, and shared test resource or consumed output; B uses these to pick wave members.
- `skills/implement-issue/worker-protocol.md` (brief-1, C1): launch-and-return states waves of up to 3 with landed prerequisites and independent edits/verification (alone when unsure), detached per-worker worktree lifecycle, checkpoint/commit-ID/serial-cherry-pick/per-pick-tests/per-pick-removal, dependency install, and full cleanup order; failure ownership states abort/keep/resolve-or-remainder and crash resume.
- `skills/implement-issue/SKILL.md` (brief-1, C1): description, scope lines, delegation sentence, final-commit sentence, and check.fix worker sentence point at the wave rule with inline/standalone/last-round exclusions.
- `skills/AREA.md` (brief-1, C2): one-line wave rule; 30 lines, exactly Commands, Key files, Non-obvious patterns, See also as H2s.
- `docs/guide/phases.md` (brief-1, C2): implement-issue paragraph states the same rule in one line.
- No `src/`, config, plan-issue, `tamdoma-subagents`, or `tests/` change, per design exclusions.

## Commands run with results

Per-unit changed tests (as work landed):

- After brief-1: `AKROGON_BASE=755babc1e1c4f0e539c78562f38771d899f30d2a bun test --changed="755babc1e1c4f0e539c78562f38771d899f30d2a"` → `--changed: 5 changed files, but no test files are affected`, 0 pass, 0 fail. Same result reported by both workers.
- Grep sweep: `grep -rn -E 'sequential|one worktree|in this worktree' skills/ docs/` → no hits.

Blocking checks (B, after last unit):

- `bun run format` → exit 0, all files unchanged.
- `bun run typecheck` (`tsc --noEmit`) → exit 0, no errors.
- `bun test` → 306 pass, 0 fail, 3621 expect() calls, 14 files, 98.40s.

## Scenario transcript (C3, from brief-2 worker, real git 2.55.0)

Temp script `/tmp/parallel-chunks-scenario-brief2.sh` (deleted after run) with `set -u` + `set -x`. Each temp lane committed a `.gitignore` with `issues/worktrees/` at base, mirroring the real repo's `.gitignore:1`, so a kept worktree does not break the empty-status check.

```
=== SCENARIO A: clean pair ===
+ UNIQ=pc2-4180267
+ LANE_A=/tmp/pc2-4180267-lane-a
+ mkdir -p /tmp/pc2-4180267-lane-a
+ cd /tmp/pc2-4180267-lane-a
+ git init -b main
Initialized empty Git repository in /tmp/pc2-4180267-lane-a/.git/
+ git config user.email scenario@temp.invalid
+ git config user.name 'Scenario Temp'
+ printf '%s\n' issues/worktrees/
+ printf '%s\n' 'base line'
+ printf '%s\n' 'shared base line'
+ git add -A
+ git commit -m base
[main (root-commit) e757aed] base
 3 files changed, 3 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 file.txt
 create mode 100644 shared.txt
+ printf '%s\n' 'base line' 'lane edit (was uncommitted)'
+ git add -A
+ git commit -m checkpoint
[main ba25186] checkpoint
checkpoint hash: ba25186f4547f0a1cee4786ff2000f2512f78cc8
+ git worktree add --detach issues/worktrees/demo-u1 HEAD
Preparing worktree (detached HEAD ba25186)
+ git worktree add --detach issues/worktrees/demo-u2 HEAD
Preparing worktree (detached HEAD ba25186)
+ printf '%s\n' 'worker u1 output'
+ git -C issues/worktrees/demo-u1 add -A
+ git -C issues/worktrees/demo-u1 commit -m 'u1 work'
[detached HEAD f3e9d2a] u1 work
u1 commit hash: f3e9d2a3c06b6333bac458c3a87a18054d5879ee
+ printf '%s\n' 'worker u2 output'
+ git -C issues/worktrees/demo-u2 add -A
+ git -C issues/worktrees/demo-u2 commit -m 'u2 work'
[detached HEAD dda8acb] u2 work
u2 commit hash: dda8acb8165eb8294814734e587bd84d8a05e8b7
+ git cherry-pick f3e9d2a3c06b6333bac458c3a87a18054d5879ee
[main f3e9d2a] u1 work
+ git cherry-pick dda8acb8165eb8294814734e587bd84d8a05e8b7
[main 0ad58c9] u2 work
+ git worktree remove issues/worktrees/demo-u1
+ git worktree remove issues/worktrees/demo-u2
++ git status --porcelain
+ STATUS=
clean-pair status bytes: 0
PASS: clean pair ended with empty git status --porcelain
=== SCENARIO B: conflicting pair ===
+ mkdir -p /tmp/pc2-4180267-lane-b
+ cd /tmp/pc2-4180267-lane-b
+ git init -b main
Initialized empty Git repository in /tmp/pc2-4180267-lane-b/.git/
+ printf '%s\n' issues/worktrees/
+ printf '%s\n' 'base line (lane B)'
+ printf '%s\n' 'shared base line (lane B)'
+ git add -A
+ git commit -m base
[main (root-commit) fd0b577] base
+ git add -A
+ git commit -m checkpoint
[main b77588b] checkpoint
checkpoint hash: b77588b0409064f20bd420ed8b5cb73667f8e1bb
+ git worktree add --detach issues/worktrees/demo-u1 HEAD
Preparing worktree (detached HEAD b77588b)
+ git worktree add --detach issues/worktrees/demo-u2 HEAD
Preparing worktree (detached HEAD b77588b)
+ printf '%s\n' 'u1 version of the line'
+ git -C issues/worktrees/demo-u1 commit -m 'u1 edits shared line'
[detached HEAD ab14c50] u1 edits shared line
u1 commit hash: ab14c50da2cf3abe9bc35d3ad47a8858c76fe1a6
+ printf '%s\n' 'u2 version of the line'
+ git -C issues/worktrees/demo-u2 commit -m 'u2 edits shared line'
[detached HEAD 0d8d280] u2 edits shared line
u2 commit hash: 0d8d28043b85a7e68c43b72f677dda33b77117e5
+ git cherry-pick ab14c50da2cf3abe9bc35d3ad47a8858c76fe1a6
[main ab14c50] u1 edits shared line
+ git cherry-pick 0d8d28043b85a7e68c43b72f677dda33b77117e5
Auto-merging shared.txt
CONFLICT (content): Merge conflict in shared.txt
error: could not apply 0d8d280... u2 edits shared line
expected conflict on u2 pick (exit 1)
+ git cherry-pick --abort
++ git status --porcelain
+ STATUS_B=
conflict-pair status bytes: 0
PASS: abort left lane clean
+ git worktree remove issues/worktrees/demo-u1
kept worktree log line:
+ git -C issues/worktrees/demo-u2 log --oneline -1
0d8d280 u2 edits shared line
+ git worktree list
/tmp/pc2-4180267-lane-b                          ab14c50 [main]
/tmp/pc2-4180267-lane-b/issues/worktrees/demo-u2 0d8d280 (detached HEAD)
=== CLEANUP ===
+ rm -rf /tmp/pc2-4180267-lane-a /tmp/pc2-4180267-lane-b
PASS: scenario complete
```

Residue check: script, transcript capture, and both lane dirs return "No such file or directory"; `git status --porcelain` in the leaf worktree showed only the 5 prose files, nothing under `tests/`. Full worker transcripts: brief-1 `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-parallel-chunks--/2026-09-27T12-10-12-266Z_01a0e2c5-d9aa-71ee-a161-3cba811fd927.jsonl`, brief-2 `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-parallel-chunks--/2026-09-27T12-13-50-594Z_01a0e2c9-2e82-71ee-a161-3cbd0fd724e1.jsonl`.

Prerequisite rule (chunk stays out until its prerequisite lands): verified by prose inspection of the section-4 record plus wave-selection sentence, per plan; no git mechanics to script.

## Known limitations

- Independence is B's judgment from section-4 records; undeclared shared fixtures can still collide, falling back to serial remainder delegation (plan open limitation, echoed by brief-1 worker).
- Until Tamdoma/pi-extensions#4 lands, pi runs one child at a time and extra spawns queue, so waves execute serially with the same results (plan open limitation).
- Temp lanes added a `.gitignore` for `issues/worktrees/` to mirror the real repo; a literal deviation from the brief's commands, documented in the transcript note above.

## Unverified criteria

None. C1, C2 verified by diff plus grep; C3 by the transcript above; C4 by the three blocking checks.
