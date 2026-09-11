# Implementation brief: command

## 1. Goal

Implement plan decisions D1–D8 in the `command` worktree on branch `command`. The authoritative leaf is `/home/ivan/Work/infra/akrogon/issues/open/akrogon-loop/bootstrap/command`. Keep its state unchanged. This is the hand-built command, not automated takeover.

## 2. Acceptance criteria

1. Config/init resolve registered repos and worktrees, apply defaults, refresh the Git base and write the specified file shapes without damaging existing lessons or unrelated config.
2. Phase mutations use real flock and atomic rename. Legal moves, duplicate refusal, parallel completions, verdict aggregation, repair cap and restart work under real process races.
3. Merge completion closes the correct issue/epic once, retries failed directory moves, recovers a landed merge by ancestry and never closes tabs itself.
4. Each actual move writes diagnostic JSON after state. A log failure cannot replay a move.
5. Next resolves hook cwd or named targets, respects dependencies/hand-built/capacity, creates one worktree and two-pane tab, prompts idle panes with the configured harness and logical slot, and follows the bounded retry policy. Merged events close tabs and unblock work.
6. Installer and plugin follow installed herdr 0.9.0. Refuse conflicting install paths. Status/exit hooks call next, startup calls next --all.
7. The replacement repo config lists bun test. Delete old scripts only after writing it. Full suite and typecheck pass. Report manual install/hook verification separately if not performed.

## 3. Read first

Read leaf `plan.md`, `brief.md`, `design.md`, and `state.yaml`; local `issues/config.yaml`, `.gitignore`, `README.md`; the sibling core-skills `ponytail.md`. Source layout is fixed by the design. Copy the existing Bun/TypeScript project convention of a local manifest and lockfile, not the retired lifecycle implementation. Verify Herdr command and JSON contracts from its installed help and local source.

## 4. Change list and interfaces

Create the planned `src/` files, one test file per tested subcommand, `plugin/`, root config and Bun project files. `src/shell.ts` owns external command execution and validated Herdr data. `src/config.ts` owns config schemas and authoritative checkout resolution. `src/state.ts` owns validated state, folder discovery, locks and atomic writes. Routing maps phase to skill, required slots and legal successors. Phase and next share the locked move/log path. Tests replace Herdr at the process boundary and use real temporary Git repositories.

## 5. Do not

Do not edit state.yaml, skills, external install roots, or unrelated source. Do not add status/pull/GitHub close/notifications, timers, registries or lifecycle tokens. Tests may create state only inside isolated temporary fixtures. Do not mask failures or assert prose. Report interface conflicts with evidence and resolve within the plan before proceeding. Installation and fixture-hook hand checks remain distinct from automated verification.

## 6. Ordered steps

1. Config/init with file-shape tests, then replacement config and retired script removal (criterion 1, 7).
2. State/routing/phase/log with real race and Git recovery tests (2–4).
3. Next and Herdr boundary with substituted dispatch tests (5).
4. Installer/plugin from verified local interfaces (6).
5. Run full checks, inspect diff against criteria, commit and fill the report (7).

About fifteen production/config files plus a small test tree. Keep changes within these surfaces. Commit completed steps. Re-read the report requirements before returning.

## 7. Commands

Focused checks: `bun test tests/config.test.ts tests/init.test.ts`, `bun test tests/phase.test.ts`, `bun test tests/next.test.ts`.
Final checks: `bun test` and `bun run typecheck`. Tests must not touch the real Herdr socket, GitHub or install roots. Save the final output in this brief.

## 8. Done when and report

Done for this implementation pass means saved scoped changes, green full checks, commits on command, and this report filled with actual evidence. Manual acceptance is reported honestly, never inferred from substituted Herdr tests.

Changed files and reasons:
- `src/akrogon.ts`, `src/config.ts`, `src/init.ts`: five-subcommand entry, schema-validated configuration, worktree resolution, refreshed base and init writers.
- `src/routing.ts`, `src/state.ts`, `src/phase.ts`, `src/log.ts`: typed routes, kernel locks, atomic state writes, review aggregation, repair cap, ancestry recovery, owner closure and diagnostic move records.
- `src/shell.ts`, `src/next.ts`, `src/install.ts`, `plugin/herdr-plugin.toml`, `plugin/next.sh`: validated Herdr process boundary, bounded dispatch/retry, worktree and tab allocation, safe installer and event hooks.
- `tests/{config,init,phase,next}.test.ts`, `tests/helpers.ts`, `tests/fake-herdr.ts`: 13 isolated command scenarios with real files, Git and racing processes. The fake Herdr executable captures prompts and refuses non-idle prompting.
- `package.json`, `bun.lock`, `tsconfig.json`, `config.yaml`, `.gitignore`, `issues/config.yaml`: local Bun dependencies and checks, global configuration and replacement repo configuration. Wrote and validated the replacement before deleting all ten tracked files under `issues/.scripts/`.

Tests run:
```text
$ bun test
plan-issue build slot=B phase=plan.synthesis
13 pass
0 fail
114 expect() calls
Ran 13 tests across 4 files. [4.92s]
Exit: 0

$ bun run typecheck
$ tsc --noEmit
Exit: 0
```
Focused config/init, phase and next runs passed before the full suite. An additional unused-symbol typecheck passed. Verified the installed Herdr 0.9.0 command syntax and local response/manifest source without issuing live control commands. Its plugin runner uses the plugin root as cwd, and its prompt accepts `--wait --until working --timeout 5000`.

A read-only reviewer reproduced exit-hook lookup failure and surviving-slot reassignment. Both were repaired in `0fcb32a` and covered by the exited-hook regression. Peer retry logging uses the actual calling pane when supplied. No state file in the real issue tree was modified.

Known limitations:
- Running harness environment variables cannot be changed through Herdr. `AKROGON_BASE` is supplied at pane creation, while `akrogon config` recomputes the current base on every call. Each skill pass must use that fresh output after rebase.
- The machine lock also encloses phase operations and dispatch. This serializes bounded command actions to keep cross-repo capacity/discovery consistent during container moves. It does not serialize the agents' implementation or Git merge work. A dispatch waits at most five seconds per start/prompt attempt, with no timer watching running agents.
- Stale-call protection has the one-turn-per-pane boundary recorded in plan D3. There is no invocation identity. Diagnostic log failures do not replay state. Failed directory moves retry on the next command.
- Harness launch templates must start with their configured Herdr harness kind. Quoted native arguments are parsed and passed to `herdr agent start`; shell operators are rejected.

Unverified criteria: Criterion 6's live installer and fixture-pane hook exercise were not performed. They require the operator's conflicting-path removals and hand verification, as specified in the plan. No symlinks in user install roots, real panes or external integrations were changed. Automated tests verify dispatch behavior through substituted Herdr, not live plugin delivery.

Code commits: `8834a2b` config/init and migration; `8137e36` phase/completion; `13dccbd` dispatch/installer/plugin; `0fcb32a` exit recovery and readable config output. The implementation report is committed separately. The authoritative phase was re-read as `implement` after verification and left unchanged.

## Fix round 1 report

Re-read authoritative state (`check.fix`, `fix_rounds: 1`) and both reviews. Review A has no Fix findings. This repair addresses review B's three code findings without changing phase/state or adjacent Nit items.

Changed files and reasons:
- `src/next.ts`: B-F1 checks the responsible merge pane before ancestry recovery, including a merge retried on B. A working merge keeps ownership of its completion call. B-F2 parses Herdr's actual `EventEnvelope` (`event` plus `data`) and ignores working notifications before dispatch, preserving explicit calls and idle/exit events. B-F3 derives a valid 32-character agent name from the allocated pane identity, independent of leaf slug and repo-local slug collisions.
- `tests/next.test.ts`: added regressions for a delayed working event followed by a real idle event, a pushed-but-still-working merge on either seat retaining its normal completion call, and two repos with the same long numeric-leading slug. Updated the exit fixture to Herdr's actual envelope. Existing stopped-merge recovery remains covered.
- `tests/fake-herdr.ts`: the process substitute now rejects invalid or already-used live agent names, matching Herdr's boundary contract.

Tests run: Before production repairs, `bun test tests/next.test.ts` reported 7 pass and 3 fail. Each new regression failed on its reported defect. After repairs, focused dispatch tests passed. Final checks:
```text
$ bun test
16 pass
0 fail
135 expect() calls
Ran 16 tests across 4 files. [6.64s]
Exit: 0

$ bun run typecheck
$ tsc --noEmit
Exit: 0
```

Known limitations: B-F4's live install/plugin evidence remains unperformed. Review A identifies this as the operator's bootstrap hand check, with installation ordered after the hand-built merges. The registered primary checkout still has the old repo config, and existing skill links point to that checkout. Replacing those links with this worktree's pre-merge skills is not a code repair. No install paths or real panes were changed. B-F4 is not claimed repaired and still requires the recorded hand verification at the bootstrap install step. No other known code Fix remains from these reviews.

Unverified criteria: Original done-criteria 7 and 8, live installation and fixture hook delivery, remain pending as above. All automated repair checks are green. The authoritative state remains untouched at `check.fix`, round 1.
