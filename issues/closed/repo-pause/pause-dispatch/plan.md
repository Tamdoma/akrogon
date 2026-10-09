# Plan: pause-dispatch

Direct synthesis. `debate: no`, no positions or rebuttals. Brief and design agree, no conflict for review. Design wins if a conflict appears later.

## Decisions

- D1: State file is `<globalHome()>/paused.yaml`. Schema is top-level `z.record(z.string().min(1), z.literal(true))`. Missing file means no repo paused. Any YAML or zod failure throws an error naming the full file path, never treats the repo as unpaused. File is written with `writeYaml` (rename writer) under the global lock. `.gitignore` gains one `paused.yaml` entry.
- D2: `akrogon pause` and `akrogon unpause` take no arguments. Both resolve the repo with `requireRepo(global, cwd)` like `park`, so root, subfolder and leaf worktree all work. Outside every registered repo they fail. Writes hold `withLock(<globalHome()>/.lock)`. Both are idempotent and print the repo name plus the resulting state. Tests assert the file, exit code and a `paused` or `unpaused` substring, never exact wording.
- D3: Automatic means `input === '--resume'` or (`input === undefined` and a plugin event is present). An explicit target, path or `--all` is manual and ignores an inherited `HERDR_PLUGIN_EVENT_JSON` through the existing `src/next.ts:1232` guard. Bare `next` with no event is manual even with `HERDR_PANE_ID` set. The merge wake after a phase move is always automatic. Classification never uses `HERDR_PANE_ID` or leaf count.
- D4: Thread `isAutomatic` through `sweep`, `dispatchLeaf`, `dispatchDependents`, `mergePass`, `mergeTurn` and cleanup call sites. Manual passes bypass the pause check fully, including dependents, cleanup and merge. Automatic passes read the pause file inside the global-lock section before any side effect. A paused repo is skipped with exit 0: no tab, pane, agent start, prompt, tab close, temp or worktree removal, or owner completion. `--resume` filters per repo so an unpaused repo still dispatches in the same run.
- D5: `mergeWake` re-reads pause under the lock at entry and returns silently when paused. The phase commit in `phaseCommand` is unchanged. No batch build, apply or prompt runs for a paused repo.
- D6: No nested locks. The main sweep already holds the outer `withLock`, so it checks pause once per repo right inside that lock. Merge-path `dispatchLeaf` calls that run outside the outer lock are wrapped in their own `withLock` with a pause check before `allocate` and `dispatchSlot`. Inner `withLock` sections in `mergeTurn` and `reconcileBatch` re-check before mutating batch state or prompting.
- D7: `unpause` clears under the lock, prints, then runs one startup-style pass for that repo only with `isAutomatic=false`. Selection matches startup `--resume`: phase `merged`, or `tab` or `worktree` set. Then `cleanupRepos([repo])` and its merge pass, with existing dependent cascades. A leaf with no tab, worktree or merged phase starts only through that cascade. A pass failure is reported as its own error, exits non-zero, and leaves the pause cleared.
- D8: `status` reads the pause file first; an invalid file fails naming it. Paused repos print a marker containing the substring `paused` beside the repo heading, including empty repos and under `--charts`. Targeted `status <slug>` for a leaf in a paused repo prints a line with `paused` and the repo name. Unpaused output is byte-identical; phases, blockers, queue and capacity are unchanged.
- D9: Every entry (`pause`, `unpause`, `status`, `next` manual and automatic, `mergeWake`) calls `readPausedOrThrow()` first. This makes an invalid file fail fast everywhere, which satisfies criterion 8 and keeps manual behavior consistent.
- D10: `README.md` gains `pause` and `unpause` rows with no arguments. `tests/command-reference.test.ts` gains the same two contracts in the same unit or the reference test fails.
- D11: Tests run at the CLI boundary with `tests/helpers.ts` isolated repos and `tests/fake-herdr.ts`. They assert herdr calls made or not made, state files and exit codes, never prose wording except the `paused` substring. Each new behavior ships one deliberate-break red proof. Criterion 5 uses two real CLI processes sharing the global lock plus a barrier wrapper around the fake `herdr`; the fake never writes pause state.

## Read-first

- `docs/reference-index.md`, `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md`
- `src/akrogon.ts`, `src/next.ts`, `src/status.ts`, `src/park.ts`, `src/config.ts`, `src/state.ts`, `src/shell.ts`
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, `tests/park.test.ts`, `tests/status.test.ts`, `tests/command-reference.test.ts`
- `plugin/herdr-plugin.toml`, `plugin/next.sh`
- `docs/guide/next.md`, `docs/guide/cheat.md`, `README.md`, `.gitignore`

## Needed interfaces

```ts
// src/pause.ts (new)
export class PauseStateError extends Error { constructor(file: string, reason: string) }
export function pauseFile(): string // resolve(globalHome(), 'paused.yaml')
export function readPaused(): Set<string> // missing file returns empty set, invalid throws PauseStateError naming file
export function isPaused(repoName: string): boolean // plain read, for use inside an already-held lock
export async function setPaused(repoName: string, paused: boolean): Promise<Set<string>> // withLock + writeYaml + return new set
```

```ts
// src/next.ts additions
type AutoFlag = { isAutomatic: boolean };
function classifyNext(input: string | undefined, event: HookEvent | undefined): boolean;
async function sweep(global, repo, leaves, invocation, isAutomatic: boolean): Promise<void>;
async function dispatchLeaf(global, repo, leaf, explicit: boolean, invocation, mergeContext?: string, isAutomatic?: boolean): Promise<DispatchOutcome>;
async function dispatchDependents(global, repo, slug, invocation, isAutomatic: boolean): Promise<void>;
async function mergePass(global, repo, invocation, isAutomatic: boolean): Promise<void>;
async function mergeTurn(global, repo, invocation, isAutomatic: boolean): Promise<void>;
```

```ts
// src/akrogon.ts
case 'pause': case 'unpause': // no positionals, strict; pause calls setPaused(repo.name, true), unpause clears then runs unpausePass(repo)
```

```ts
// src/status.ts
function pausedRepos(): Set<string> // readPaused once per status run, invalid fails naming file
```

Credentials: design names no variable. `akrogon status pause-dispatch` prints no `Missing:` lines. No human-only blockers.

## Acceptance criteria

- AC1: From root, subfolder and worktree, `pause` records the repo key, prints repo plus state, repeats idempotently, and refuses outside repos. `unpause` mirrors this.
- AC2: With X paused, each of the four plugin events for an X leaf plus `next --resume` create no tab or pane, start no agent, send no prompt, close no tab, remove no temp or worktree, complete no owner, and exit 0. The same `--resume` run still dispatches repo Y.
- AC3: A phase move in a paused repo commits, and its merge wake prompts no seat.
- AC4: In a paused repo, `next <target>`, `next --all` (even with inherited event JSON), and bare `next` with no event (even with `HERDR_PANE_ID`) dispatch fully including dependents and merge, and the repo stays paused.
- AC5: Automatic starts and prompts re-read pause inside the global-lock section that performs them. Pause writes take the same lock. A pass that reaches launch after the pause was recorded launches nothing.
- AC6: `unpause` clears, prints, then runs one repo-scoped resume pass: closed seats relaunch with current seat config, deferred merged cleanup runs, and tab-less leaves start only via cascade. A pass failure exits non-zero with the pause still cleared.
- AC7: `status` marks paused repos beside the heading, including empty repos and `--charts`, and targeted leaf status names the pause. Unpaused output and all phases, blockers, queue and capacity are unchanged.
- AC8: Missing file means none paused. An unparsable file makes `pause`, `unpause`, `status` and automatic `next` fail naming the file, never treated as unpaused.
- AC9: The operator guide documents `pause` and `unpause`, what they stop, that typed `next` still runs, what unpause does, and how they differ from `park`.

## Checklist by wave

### Wave 1

#### U1: pause state plus CLI
- Owns: `src/pause.ts`, `src/akrogon.ts`, `.gitignore`, `README.md`, `tests/command-reference.test.ts`, `tests/pause.test.ts`
- Shared test resource: none, isolated fixtures only
- Must land first: none
- Covers AC1 and the pause and unpause half of AC8
- Steps:
  - Add `src/pause.ts` with D1 helpers, zod schema, missing versus invalid handling, `writeYaml` under `withLock`.
  - Wire `pause` and `unpause` in `src/akrogon.ts` with no positionals, `requireRepo` resolution, idempotent prints, updated usage string.
  - Add the `paused.yaml` `.gitignore` entry.
  - Add `README.md` command rows and matching `tests/command-reference.test.ts` contracts.
  - Add `tests/pause.test.ts`: root, subfolder and worktree resolution, idempotent repeat, outside-repo refusal, missing file as none paused, invalid file failing naming the path, one deliberate break such as removing the `requireRepo` check.

### Wave 2

#### U2: dispatch gate, merge wake, unpause pass, races
- Owns: `src/next.ts`, `tests/pause-next.test.ts`
- Shared test resource: none, isolated fixtures plus per-test barrier wrapper around fake `herdr`
- Must land first: U1
- Covers AC2, AC3, AC4, AC5, AC6 and the automatic `next` half of AC8
- Steps:
  - Add `classifyNext` per D3 and thread `isAutomatic` per D4 through sweep, dispatch, dependents, merge and cleanup paths.
  - Gate automatic branches: four plugin events, `--resume` per-repo filter, `tab_closed`, event plus pane path. Skip sweep, cleanup and merge for paused repos with exit 0. Leave explicit target, path, `--all` and bare manual `next` ungated.
  - Gate `mergeWake` and inner merge locks per D5 and D6 without nested locks.
  - Add the unpause repo-scoped pass per D7, operator-initiated and ungated after the clear, with separate error reporting.
  - Add `tests/pause-next.test.ts`: one test per automatic event asserting zero herdr calls and exit 0; `--resume` mixed X paused plus Y unpaused; phase commit with silent wake; manual target, `--all` with inherited event, and bare manual with pane ID dispatching fully and staying paused; unpause relaunch plus cleanup plus cascade-only start plus failure leaves cleared; invalid file failing automatic `next` naming the file; race A with a barrier before the locked launch section showing pause wins; race B with a held launch lock showing pause waits then later work is suppressed; one deliberate break per behavior such as removing one gate check.

#### U3: status marker
- Owns: `src/status.ts`, `tests/pause-status.test.ts`
- Shared test resource: none, isolated fixtures only
- Must land first: U1
- Covers AC7 and the status half of AC8
- Steps:
  - Read pause once per status run, fail naming the file when invalid, treat missing as none paused.
  - Add the `paused` marker beside the repo heading for board, empty repo, `--charts` and targeted leaf status per D8. Keep unpaused bytes unchanged.
  - Add `tests/pause-status.test.ts`: paused marker in each view, unpaused unchanged, targeted leaf names pause, invalid file fails naming the path, one deliberate break such as removing the marker branch.

U2 and U3 share wave 2. They have disjoint owned paths, no shared test resource, and the same landed prerequisite U1.

### Wave 3

#### U4: operator guide
- Owns: `docs/guide/next.md`, `docs/guide/cheat.md`, `docs/guide/state.md`, `docs/guide/problems.md`
- Shared test resource: none
- Must land first: U2, U3
- Covers AC9
- Steps:
  - `docs/guide/next.md`: add a pause section covering stop scope, typed `next` still running, unpause resume pass, and pause versus park.
  - `docs/guide/cheat.md`: add `pause` and `unpause` entries.
  - `docs/guide/state.md`: note pause versus park for keeping work away from agents.
  - `docs/guide/problems.md`: add a paused-repo check to dispatch troubleshooting.
  - Keep links valid for `tests/docs-links.test.ts`.

## Docs

- `README.md`: adds `pause` and `unpause` command rows, owned by U1.
- `docs/guide/next.md`: adds pause scope, manual bypass, unpause pass and pause versus park, owned by U4.
- `docs/guide/cheat.md`: adds `pause` and `unpause` command entries, owned by U4.
- `docs/guide/state.md`: clarifies pause versus park for keeping work away, owned by U4.
- `docs/guide/problems.md`: adds paused-repo troubleshooting, owned by U4.
- `docs/guide/limits.md`: inspected, no change, parking and dependency rules are unaffected.
- `docs/guide/in-practice.md`: inspected, no change, park mention is an example only.
- `docs/guide/parts.md`: inspected, no change, pause lives under `globalHome`, not `issues/`.
- Agent skills: no skill file is affected, pause is an operator command and dispatch gate only.

## Verification

- AC1 proof: `bun test tests/pause.test.ts`. Catches wrong repo resolution, non-idempotent writes and missing outside-repo refusal. Size seconds. Rerun when `src/pause.ts` or `src/akrogon.ts` changes.
- AC2 proof: `bun test tests/pause-next.test.ts -t "automatic"`. Catches a gated pass making herdr calls or mutating state. Size seconds. Rerun when `src/next.ts` changes.
- AC3 proof: `bun test tests/pause-next.test.ts -t "phase wake"`. Catches a wake prompt in a paused repo or a refused phase commit. Size seconds. Rerun when `src/next.ts` or `src/akrogon.ts` changes.
- AC4 proof: `bun test tests/pause-next.test.ts -t "manual"`. Catches manual bypass losing dependents, merge or inherited-event handling. Size seconds. Rerun when `src/next.ts` changes.
- AC5 proof: `bun test tests/pause-next.test.ts -t "race"`. Catches a missing lock or missing re-read before launch or prompt. Size minutes because it runs two real CLI processes with barriers. Rerun when `src/next.ts` or `src/pause.ts` changes.
- AC6 proof: `bun test tests/pause-next.test.ts -t "unpause"`. Catches unpause failing to relaunch, skipping cleanup, over-starting, or restoring pause on pass failure. Size seconds. Rerun when `src/next.ts` or `src/akrogon.ts` changes.
- AC7 proof: `bun test tests/pause-status.test.ts`. Catches a missing or extra paused marker and unpaused output drift. Size seconds. Rerun when `src/status.ts` changes.
- AC8 proof: `bun test tests/pause.test.ts tests/pause-status.test.ts tests/pause-next.test.ts -t "invalid"`. Catches an invalid file treated as unpaused or an error that does not name the file. Size seconds. Rerun when `src/pause.ts`, `src/next.ts`, `src/status.ts` or `src/akrogon.ts` changes.
- AC9 proof: `bun test tests/docs-links.test.ts` plus `grep -r "akrogon pause" docs/guide/next.md docs/guide/cheat.md`. Catches missing pause docs and broken guide links. Size seconds. Rerun when any owned guide file changes.
- Regression: `bun test tests/next.test.ts tests/status.test.ts tests/phase.test.ts tests/command-reference.test.ts`. Catches gate, marker or command-table drift in existing behavior. Size minutes. Rerun before handoff.
- Static: `bun run typecheck` and `bun run format`. Catches typing and formatting drift. Size seconds. Rerun before handoff.
- No whole-suite `bun test` and no `merge_checks` are required. The brief does not name them.
- No restart boundaries. This is not a slow-run leaf. The longest proof is the minutes-long race file.

## Open limitation

Pause does not kill an agent that is already working. An in-flight prompt that returned before the pause was recorded runs to completion. The next automatic pass for that repo is then gated. Pause is also keyed by registered repo name, so renaming a repo key while paused orphans that entry until the operator clears it.

## Implementation notes

2026-10-08: U1 wires `pause` and `unpause` clear plus print in `src/akrogon.ts`; U2 extends the `unpause` case to invoke `unpausePass` from `src/next.ts` after the clear. This refines D7 with no locked change. U1 edits `tests/command-reference.test.ts`, so its commit carries the `Test-Change:` trailer.
