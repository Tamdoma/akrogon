# Map Rebuttal — Slot D

## `#91` `peer-wait-harness`

1. **Fact correction on line 19 ("agy's parent transcript is silent during subagent waits and has no turn-closed row") and line 25 ("protobuf-backed CLI format")**:
   - `~/.gemini/antigravity-cli/brain/<session>/.system_generated/logs/transcript.jsonl` is plain UTF-8 JSONL (not protobuf; only `conversations/<session>.pb` is protobuf).
   - During subagent waits, the parent transcript is **not** missing a turn-closed-shaped row — on the contrary, at `c8fd8be1-1f55-4e3d-876d-7ce1a40ff9b2` steps `72` (`09:34:51Z`), `74` (`09:40:14Z`), `76` (`09:43:19Z`), `218`, and `223`, `agy` writes a completed `PLANNER_RESPONSE` step with `status: "DONE"` and no `tool_calls` (and records a completed invocation in `conversations/<session>.db` `executor_metadata`) while waiting for `SYSTEM_MESSAGE` wakeups from `invoke_subagent`. That is why any `agy` transcript check that only inspects the last `PLANNER_RESPONSE` (without subagent tracking) would falsely report turn-closed.
2. **Pitfall on Q1a / line 16 & 24 (treating `pi` and `codex` like `agy`)**:
   - In Herdr (`herdr/src/detect/mod.rs:283-300`), `("herdr:pi", "pi")` has `full_lifecycle_hook_authority == true` (authoritative hook state, not screen scraping), whereas `("herdr:antigravity_cli", "agy")` has `session_identity_only_integration == true` (100% screen-scraped from `antigravity.toml`). And `codex` writes an explicit `task_complete` event to `~/.codex/sessions/**/rollout-*<session>.jsonl`.
   - Dropping `failure` on idle for **all** non-Claude harnesses (Q1a across every harness) needlessly disables dead-turn detection for `pi` (where Herdr hook state is already authoritative) and `codex`, violating `issues/chart/door-turn-and-stale-tab/forks/peer-turn.md:20-24`.

## `#92` `check-evidence`

1. **Seat-written logs (line 38 / Q2)**:
   - Accept A's check that seat-written `*.log` files under `<leaf>/implementation/` continue after `2021aeb`/`dc2e2b0`. Note the root cause in `akrogon`: `skills/implement-issue/SKILL.md:25` and `skills/check-issue/SKILL.md:18` still tell seats *"Temp files and logs go under `$TMPDIR`... anything needed later goes in the leaf folder"*, which invites seats to redirect ad-hoc proof runs into `<leaf>/implementation/*.log`.
2. **Two omitted pitfalls on Q1a (in-repo compression)**:
   - **Chart direct-fix logs (`--holder <chart>/direct`)**: `completeOwner` (`src/phase.ts:190-225`) only runs on `issues/open/` leaves, never on `issues/chart/<chart>/direct/` (`skills/chart-issues/SKILL.md:108`, `src/run-check.ts:127`). Both `akrogon` (`f412697`) and `framework` (`28d1f011c`) committed uncompressed `issues/chart/*/direct/check-*.log` files. An owner-completion archive in `completeOwner` (Q1a, A's variant) leaves `issues/chart/*/direct/check-*.log` uncompressed unless chart handoff / `--holder` is also covered.
   - **Mid-epic `git add issues` commits vs active-pass readers**: Under A's variant (archive on owner move to `issues/closed/`), raw `*.log` files sit in `issues/open/` while an epic is open, so any `git add issues && git commit` before the epic finishes still commits uncompressed multi-MB `.log` blobs into git pack history. Under B's variant (compress each log on write in `run-check.ts`), seats running `tail`/`rg` on the path printed by `akrogon verify` (`src/verify.ts:163, 170`) and `src/flaky.ts:16` (`readFileSync(log, 'utf8')`) break unless updated to decompress `.zst`.

## `#93` `worktree-cleanup`

1. **Verification of stacked-member tab/worktree leak (line 66, "unverified by A")**:
   - In `src/phase.ts:629-632` (`batchPush`) and `src/phase.ts:737-742` (`finishPush`), stacked `members` are moved to `phase: 'merged'` before `mergeWake` runs.
   - When `mergeWake` -> `mergePass` -> `mergeTurn` calls `reconcileBatch` (`src/next.ts:967-978`), line `975` executes:
     ```ts
     if (item.state.phase !== 'merge') continue;
     moved.push(item);
     ```
     Because `item.state.phase` is already `'merged'`, `moved` is always empty (`[]`), so `src/next.ts:991-994` (`await closeMergedTab(repo, leaf, await panes()); await dispatchDependents(...)`) **never runs** for stacked members after a normal `batchPush` / `finishPush`! And because stacked members' Seat B panes were already idle waiting in `mergeQueue`, Herdr never fires `pane_agent_status_changed` (`src/next.ts:1481-1489`) for them either — leaving both their tabs and their dependent leaves' dispatch skipped until a later pass.
2. **Pitfall on Q1a's `HEAD === record.sha` guard (line 70, added by B and C)**:
   - For `batch-<attempt>` worktrees (`src/batch.ts:115-156`, `src/reconcile.ts:381-384`), there is no `verify-runs.jsonl` record, and `buildStack` rebases commits onto `builtOn` (`src/batch.ts:120, 135`). If `buildStack` is killed mid-rebase, `batch-<attempt>`'s `HEAD` is an intermediate rebased SHA (not `builtOn` and not `holder.head`) with `rebase-merge` present. Requiring `HEAD` to match a recorded SHA would keep killed `batch-<attempt>` worktrees stuck forever.
