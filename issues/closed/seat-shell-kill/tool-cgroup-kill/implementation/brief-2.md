# Brief 2 — U2: seat entry wiring, Delegate, bootstrap, scope-entry outcomes

## 1. Goal

Implement plan decisions D3–D7 of `plan.md` (in the leaf folder): wire the tool-cgroup entry into `startSeat`'s argv per harness kind, add `Delegate=yes`, bootstrap the scope directories, and make `scopeEntry` three-outcome — so that `tests/tool-entry.test.ts` passes in full. The test file is the behavior spec; read it completely first. `src/tool-cgroup.ts` already exists on the leaf branch with `refreshToolEntry` and the entry texts (unit U1 landed before you) — you consume it, never write it.

## 2. Numbered acceptance criteria

1. Case "the entry places a bash tool shell exactly once at the scope root and nowhere else" passes. Your part: `refreshToolEntry` must produce working entry files. (Already implemented by U1 — verify it satisfies the case; if its behavior is wrong, that is a mismatch return, not an edit in your worktree.)
2. Case "the seat launch argv carries Delegate=yes, the scope env marker and the per-kind wiring" passes for kinds claude, pi, codex, agy, fake: the recorded `hc run` argv contains `-p Delegate=yes`; `AKROGON_SEAT_CGROUP=/sys/fs/cgroup/.../<slice>/<unit>` (absolute path of the seat's scope cgroup, computed from `sliceCgroup(leafSlice(...))` plus the unit name); claude gets `CLAUDE_CODE_SHELL=<homePath>/tool-entry/bash` and `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` and NO `BASH_ENV`; pi, codex and fake get `BASH_ENV=<homePath>/tool-entry/bash-env`; agy gets `PATH` whose first entry is `<homePath>/tool-entry` (with the inherited PATH after it — expand akrogon's own `process.env.PATH` at startSeat time, since `env` assignments cannot self-reference). argv[0] stays `systemd-run`. After the start, `<scope>/tools`, `<scope>/akrogon` and `<scope>/helpers` exist in the real cgroup tree.
3. Case "a bootstrap failure fails the seat start and ends the terminal" passes: with `AKROGON_CGROUP_ROOT` pointing at a tree whose `user.slice` is a plain file, `akrogon seat` exits non-zero and no live terminal remains.
4. `tests/hc-start.test.ts` passes unchanged — including "a seat that exits fails the start with its address": a harness that exits before the scope-entry deadline still falls through to `firstTask` and its failed outcome. Only the `outside` outcome (alive but outside the scope at deadline) and bootstrap failures end-and-throw.

## 3. Read-first list

- `tests/tool-entry.test.ts` — the spec, read fully including the shim-log parsing.
- `src/seat.ts` — `startSeat` argv construction, `scopeEntry`, `cgroupOf`, `UNSET`, harness kind flow.
- `src/tool-cgroup.ts` — `refreshToolEntry`'s signature and behavior (already on the branch).
- `src/scope.ts` — `sliceCgroup`, `leafSlice`, `cgroupRoot`, `procRoot`.
- `tests/hc-start.test.ts` — the existing start-verb expectations you must not break.
- `plan.md` decisions D3–D7 in `/home/ivan/Work/infra/akrogon/issues/open/seat-shell-kill/tool-cgroup-kill/plan.md`.
- this skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/seat.ts` only. Worker worktree created at commit `2d1153d7dbff8f39cff75365fa328455c0c29cb7` (filled at wave start).

Binding facts:

- `refreshToolEntry(homePath())` runs on every `startSeat` before the launch — it refreshes both files atomically.
- The env assignments go into the existing `env` argv list after `UNSET`, alongside `AKROGON_BASE` etc. Order matters only for readability.
- `AKROGON_SEAT_CGROUP` is the absolute cgroup path: `sliceCgroup(slice) + '/' + unit` — the same unit already computed for the argv.
- `Delegate=yes` is a `-p` property on the `systemd-run` argv before the `--` separator.
- `scopeEntry` becomes three-outcome: `entered` (cgroup ends with `/<slice>/<unit>`), `exited` (`/proc/<pid>` gone), `outside` (deadline passed, still elsewhere). On `entered`, `startSeat` creates `<scope path>/tools`, `akrogon`, `helpers` through `cgroupRoot()` (mkdir each; a failure ends the terminal through `end()` and throws exactly like the `outside` refusal does today). On `outside`, the existing end-and-throw. On `exited`, fall through to `firstTask` with no bootstrap.
- `cgroupOf` reads through `procRoot()` instead of hardcoding `/proc` (production behavior identical since procRoot defaults to `/proc`).
- `homePath()` is `AKROGON_HOME` or `~/.akrogon` — never `globalHome` (can be a release dir). Import it from `src/config.ts`.
- The agy `PATH` wiring: `PATH=<entrydir>:${process.env.PATH}` — but filter nothing else; the entry dir itself never contains the harness names.
- Non-listed kinds (the `fake` harness and any future configured kind) get `BASH_ENV` — the design's fail-safe default. Only claude and agy are special.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file. A red or wrong planned test is a mismatch returned with evidence. Reason: A owns tests; exception: a revised brief from A.
- Do not edit `src/tool-cgroup.ts` or any file outside `src/seat.ts`. If `refreshToolEntry` misbehaves, return a mismatch with evidence. Exception: none.
- Do not change `firstTask`, the start-proof flow or labels. Exception: none.
- Never run any `git stash` subcommand — worktrees share one stash. To set work aside: commit as WIP and before returning `git reset --soft 2d1153d7dbff8f39cff75365fa328455c0c29cb7`, then make the unit's single returned commit.
- Do not stop processes by command-line pattern; use `akrogon stop-run <id>`. No exceptions.
- Restated: return a mismatch with evidence instead of changing scope, tests or interfaces; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the spec test and read-first list. Install dependencies per section 7. Run the red test once: `bun test tests/tool-entry.test.ts --timeout=120000`.
2. Wire the argv env and `Delegate=yes` in `startSeat`; call `refreshToolEntry`.
3. Implement three-outcome `scopeEntry` and the bootstrap.
4. Switch `cgroupOf` to `procRoot()`.
5. Run the targeted tests until green.

Advisory size: 1 file, under 30 turns.

## 7. Commands

Install first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

Targeted tests, from your worktree:
- `bun test tests/tool-entry.test.ts --timeout=120000`
- `bun test tests/hc-start.test.ts --timeout=120000` (regression guard — uses real hc cores and real user scopes)

Keep output through `akrogon run-check --name <label> -- <cmd>` citing the `check <label>: <exit> <path>` line. Note: run-check inside your detached worktree may fail to resolve a leaf; if it does, run the bare command and paste its output directly instead, naming that deviation in your report.

The tests spawn REAL systemd user scopes through the fixture; they clean up through the core teardown and slice stops. Never `pkill`/pattern-kill anything.

## 8. Done-when, evidence and report

`tests/tool-entry.test.ts` green end-to-end, `tests/hc-start.test.ts` green, one commit on top of the creation commit. You change no test file, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
