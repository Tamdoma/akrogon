# Plan: green-merge

Debate: no. Synthesized directly from `brief.md` and `design.md` (locked 2a, 5a) and the live code at `AKROGON_BASE` abfee125 (solo-turns merged).

## Read first

- `src/AREA.md`, `tests/AREA.md`, `learnings/LESSONS.md` (attempt-record replay 2026-10-10, prose-assertion 2026-10-01, fake side effects 2026-10-16).
- `src/next.ts`: `mergeTurn` (966), `reconcileBatch` (907), `mergeContext` (1073), `dispatchMergeLeaf` (1077), `mergePass`/`mergeWake` (1098, 1120), `dispatchSlot` (559), `dispatchLeaf` (717), hook tab close (1410-1428).
- `src/phase.ts`: `commitMove` (126), `completeOwner` (189), `transition` (229), `batchCheck` (518), `batchPush` (561), `restack` (612), `finishPush` (651), `phaseCommand` (690).
- `src/verify.ts`: `verify` (382), `verifyCaller` (269), `runOnce` (286), `greenRun` (97).
- `src/scope.ts` (`leafSlice`, `sessionBusAddress`, `runUnitArgv`), `src/stop.ts`, `src/reconcile.ts` (`closeMergedTab` 360, `reconcileNeedsPanes`, merged worktree removal), `src/timing-report.ts` (`visitGaps` 170), `src/log.ts`, `src/status.ts` (`note`), `src/state.ts` (`batchSchema`, `stateSchema`).
- `tests/helpers.ts`, `tests/fake-systemd-run.sh` (service calls are logged and not run), `tests/fake-systemctl.ts`, `tests/fake-herdr.ts`, `tests/batch-dispatch.test.ts`, `tests/batch-merge.test.ts`.
- `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`.

## Decisions

- D1 Land entry. New verb `akrogon land <slug> --attempt <id>` in `src/akrogon.ts` calling `landCommand` in a new `src/land.ts`. `land.ts` holds only the orchestration (verify, gates, push, outcomes, wake). The guards and the push stay in `src/phase.ts` and are exported from there; nothing is duplicated.
- D2 Batch fields (design "Open for the plan: field representation"). `batchSchema` gains, all optional so existing in-flight records parse unchanged (5a):
  - `owner: 'command' | 'seat'`. Absent means seat (today's records). Set to `command` in the same locked write that applies the top. Set to `seat` in the same locked write that records a handoff to B.
  - `wake: 'red' | 'gate' | 'push'` and `red: <verify run id>` (only with `wake: red`), `refusal: <text>` (with `gate` and `push`). Free text lives here, never in the prompt.
- D3 Launch and liveness (design "Open for the plan: exact launch command, environment and liveness check"). Unit name `akrogon-land-<attempt>`, liveness `systemctl --user is-active akrogon-land-<attempt>` (exit 0 = alive; `active`, `activating`, `deactivating`). Launch argv:
  `systemd-run --user --quiet --unit=akrogon-land-<attempt> --slice=<leafSlice> -p CollectMode=inactive-or-failed -p TimeoutStopSec=5 --working-directory=<repo.root> --setenv=PATH=… --setenv=HOME=… --setenv=DBUS_SESSION_BUS_ADDRESS=<sessionBusAddress()> [--setenv=AKROGON_HOME=…] -- <process.execPath> <entry script> land <slug> --attempt <id>`.
  No `--scope`: it is a service, so the caller returns after systemd starts it. `HERDR_PANE_ID` is never passed, so `logMove` attributes no session (D9). `CollectMode=inactive-or-failed` lets a relaunch reuse the name after a failed run.
- D4 Claim handshake (criterion 7). `mergeTurn`'s apply lock (the second `withLock`) writes `owner: 'command'` with `top`, then launches the unit while still holding the global lock. The launch takes about 100 ms. The global lock is never held during the verify. A launch failure throws out of the lock with the systemd-run result: the record stays `owner: command`, the unit is not alive, and the next pass relaunches. The `recorded.applied === true` branch of `mergeTurn` becomes:
  1. `top` undefined: dispatch B with `attempt=<id> solo`, as today.
  2. `owner` is `seat` or absent: dispatch B with `mergeContext(recorded)`, as today. Later hooks keep the attempt with B.
  3. `owner: command`, unit alive: wait (`recordWait merge_turn`), no prompt, no verify.
  4. `owner: command`, unit dead: under the global lock, re-read the record (attempt, owner, unit still dead) and relaunch. The verify reuses a green receipt for an identical tree, so a run that died after a green verify does not verify again.
  `reconcileBatch` runs first each turn as today, so a dead run that left a `candidate` is reconciled before any relaunch (D8).
- D5 Land run steps (`landCommand`). Each locked step first re-reads the leaf and refuses unless `phase === 'merge'`, `batch.attempt === <id>` and `batch.owner === 'command'`. On refusal it prints the reason and exits 0 without side effects (a stale unit).
  1. Verify: `verify(worktree, undefined, attempt, undefined, false)` (the same path as `akrogon verify --attempt`). A red verify hands off with `wake=red red=<run>`. The run id comes from the newest completed merge-scope run in `verify-runs.jsonl` for the top's tree. Nothing is pushed.
  2. Gates: `landGates` (exported from phase.ts) runs `batchCheck`'s guards in order (batch top ancestry, issue files, test-change citations, retired lessons) plus `moveGuards` (D6), then `requireGreenReceipt`, then records `tested_top`/`tested_main`. Any `Error` it throws is the refusal: hand off with `wake=gate refusal=<message>`.
  3. Push: `batchPush` with the command mover (D6). It records `candidate` before the push and requires `head === tested_top` for the command path as well. The command path never takes the slotless skip.
  4. Outcomes: landed goes to the command-owned move (D6), then the broadcast handoff (D7) and the wake (D10). A non-fast-forward refusal goes to `finishPush` → `restack`, which now returns `{ kind: 'restacked', top } | { kind: 'rebase', builtOn } | { kind: 'landed' }` instead of only printing. phaseCommand prints the same lines as today from that value. A clean restack whose top differs from the refused head loops to step 1 once. A second consecutive non-fast-forward refusal hands off with `wake=push refusal=<stderr>`. `rebase` hands off with the existing solo context (`top` cleared, so the prompt reads `attempt=<id> solo`). Any other push error hands off with `wake=push refusal=<stderr>`.
  5. Handoff: one locked write `{...batch, owner: 'seat', wake, red?, refusal?}`, then `dispatchMergeLeaf` with `mergeContext`. `mergeContext` becomes `attempt=<id> top=<sha>` + (` wake=<wake>` when set) + (` red=<run>` when set). The solo form is unchanged.
- D6 Command-owned move. Extract `moveGuards(repo, leaf, state, requested, from)` from `transition`: clean worktree, issue files, test-change citations, frozen citations. `transition` calls it unchanged. `batchPush` takes `move: (holderNow: Leaf) => Promise<void>` in place of its trailing `transition` call. The seat path passes the existing `transition(...)`. The land path passes `commitMove(repo, holderNow, withHandoff, 'merged', null)`: no `done`, no slot, `slot: null` in `log.jsonl`. `finishPush`'s landed branch takes the same `move`. The slot-required `head === tested_top` check becomes unconditional for the command path: `batchPush` takes the expected tested head explicitly instead of keying on `slot`.
- D7 Broadcast handoff (design "Open for the plan: where the handoff is stored and how dispatch is acknowledged").
  - Storage: a new optional state field `broadcast: { kind: 'issue' | 'epic', name, destination, pushed, sources: string[] }` on the holder leaf's `state.yaml`. It is written in the same `saveState` that `commitMove` makes for the merged phase, before `completeOwner` renames the owner folder, so the handoff moves with the folder and no crash can drop it.
  - Computation: new pure `ownerCompletion(repo, leaf, after: State): CompletedOwner | null` in phase.ts. It holds the owner/source logic now inside `completeOwner`, with the holder's post-move state substituted. `completeOwner` uses it and returns `CompletedOwner | null` (design step 5). The land path and `reconcileBatch` recovery pass `{...after, broadcast}` when it is non-null. Seat-run `merged` keeps today's printed line and the seat's own broadcast.
  - Acknowledgement uses the existing delivery convention: `commitMove` clears `prompted`, so on a merged leaf `prompted.B` is only ever set by the broadcast dispatch. `broadcastPending(state) = state.phase === 'merged' && state.broadcast !== undefined && state.prompted.B === undefined`. Delivery goes through `dispatchSlot`, which records `prompted.B` on delivered or settled-timeout and never re-prompts after that. `dispatchSlot` takes the prompt text from its caller (`dispatchLeaf` builds today's routing prompt).
  - Dispatch: `broadcastPass(global, repo, invocation)` at the start of `mergeTurn`. It scans `allLeaves(repo)` (open and closed) for `broadcastPending`, `allocate`s when pane B is missing (as a merge dispatch does), and sends `broadcast-issue <slug> slot=B owner=<kind>:<name> closed=<destination> sha=<pushed> sources=<comma list|none> leaf=<path>`. It runs on the land run's wake and on every later `next`, so a crash after the close still dispatches, and the `prompted.B` ack stops a second dispatch.
- D8 Recovery. `reconcileBatch`'s landed branch builds the handoff through `ownerCompletion` and passes it into its existing `commitMove(..., 'merged', null)`. A land-run crash between push and move recovers there exactly once (the `recorded` flag, as today). No handoff is written when no owner completes.
- D9 Mover attribution. `src/log.ts` is unchanged. The land unit's environment carries no `HERDR_PANE_ID` (D3), so a land-run move records `slot: null, session: null`. `src/timing-report.ts` `visitGaps`: a merge visit whose closing move is `to: merged` with `slot: null` requires no B prompt (today it reports `incomplete prompt`).
- D10 Wake. After a landed push (and the handoff), `landCommand` calls `mergeWake(global, repo, 'merged')`: `selfUpdate` for akrogon, then `mergePass`, which runs `broadcastPass`, `reconcileBatch` and the next holder's turn. `dispatchDependents` runs for the merged slug. Then, when no handoff was written, it calls `closeMergedTab`. With a handoff, the existing hook closes the tab when the broadcast pane goes idle (`hookPane === pane.B`). A wake failure is printed (`report`) and not retried.
- D11 Cleanup protection. `broadcastPending` (exported from state.ts) is honoured by `closeMergedTab` (returns false), by the merged-tab hook in `nextCommand`, and by `reconcile` for that leaf's worktree, slice and leaf temp. `reconcileNeedsPanes` has no change.
- D12 Stop. `stopCommand --all` selects open leaves with a tab or with `batch?.owner === 'command'` (phase not merged). Single-slug stop already stops the slice. The land unit lives in the leaf slice, so `systemctl --user stop <leafSlice>` stops it. `mergeTurn` already returns for a stopped holder, so nothing relaunches.
- D13 Status. `note` in `src/status.ts` adds `land <alive|dead>` for `batch.owner === 'command'` (one `is-active` call per such leaf, targeted status only) and `broadcast pending` for `broadcastPending`. It shows no B seat for either.
- D14 Existing tests. Merge-turn tests that expect a B prompt on an applied top (`tests/batch-dispatch.test.ts` 122, 451, 472, 539, 571, 595, 689, 727; `tests/timing.test.ts`; any other file the implementer's run turns red) now see a land launch. They switch to seeding `owner: 'seat'` or driving `akrogon land`, each in a commit carrying `Test-Change:` trailers naming the file.

Brief/design note: none conflict. The design's "Open for the plan" items are answered in D2, D3, D4 and D7.

## Interfaces

```ts
// src/state.ts
batchSchema += { owner?: 'command'|'seat'; wake?: 'red'|'gate'|'push'; red?: string; refusal?: string }
stateSchema += { broadcast?: { kind: 'issue'|'epic'; name: string; destination: string; pushed: string; sources: string[] } }
export function broadcastPending(state: State): boolean
// src/phase.ts
export type CompletedOwner = { kind: 'issue'|'epic'; name: string; destination: string; sources: string[] }
export function ownerCompletion(repo: Repo, leaf: Leaf, after: State): CompletedOwner | null
export async function completeOwner(repo, leaf, justMerged): Promise<CompletedOwner | null>
export async function moveGuards(repo, leaf, state, requested, from?): Promise<void>
export async function landGates(repo, leaf, record): Promise<void>            // throws = refusal
export async function landPush(repo, leaf, record, end): Promise<LandPush>   // { kind:'landed' } | { kind:'restacked', top } | { kind:'rebase' } | { kind:'error', stderr }
// src/land.ts
export async function landCommand(slug: string, attempt: string): Promise<void>
export function landUnit(attempt: string): string            // akrogon-land-<attempt>
export async function launchLand(repo, slug, attempt): Promise<void>
export async function landAlive(attempt: string): Promise<boolean>
// src/next.ts
dispatchSlot(global, repo, leaf, slot, prompt, attempt?)       // prompt built by caller
async function broadcastPass(global, repo, invocation): Promise<void>
```

## Units and waves

Every unit edits `src/next.ts` or `src/phase.ts`, or depends on a unit that does, so no two units can share a wave. The run is serial-solo: A implements it without workers.

- W1 U1 State and phase core. Owns `src/state.ts`, `src/phase.ts`. D2, D6, D7 (types, `ownerCompletion`, `completeOwner` return), restack/finishPush typed outcomes. Prereq: none.
- W2 U2 Land run and dispatch. Owns `src/land.ts`, `src/akrogon.ts`, `src/next.ts`. D1, D3, D4, D5, D8, D10, D7 dispatch. Prereq U1.
- W3 U3 Edges. Owns `src/stop.ts`, `src/reconcile.ts`, `src/status.ts`, `src/timing-report.ts`. D9, D11, D12, D13. Prereq U2.
- W4 U4 Existing tests and docs. Owns the existing test files in D14, `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `src/AREA.md`, `tests/AREA.md`, `README.md` (the `land` verb in the command list that `tests/command-reference.test.ts` checks). Prereq U3. Shared test resource: none (temp repos only).

## Docs checklist

- `skills/merge-issue/SKILL.md`: B's merge work covers red (starting from the command's red receipt, `wake=red red=<run>`), conflict/solo, gate refusal (`wake=gate`, refusal text in the batch record, rerun `merged --check`) and push handling (`wake=push`). Green-path prose becomes "the command lands a green top itself".
- `skills/broadcast-issue/SKILL.md`: names the broadcast-only seat (`broadcast-issue <slug> slot=B owner=… closed=… sha=… sources=… leaf=…`) as sender after a command-run merge, with no phase command.
- `src/AREA.md`: the command-run green path, `src/land.ts`, the `akrogon land` verb, the land unit and the broadcast handoff.
- `tests/AREA.md`: one line for `tests/green-merge.test.ts`.
- `README.md`: `land` in the command list.

## Criteria → proof

All proofs run on temp repos built by `tests/helpers.ts` with fake herdr. The fake systemd-run logs service launches and does not run them, so each test runs `akrogon land <slug> --attempt <id>` itself as the service would. Checks are `true` (green) and `false` (red). Size is seconds per case. Rerun trigger: any change to the owned files in Units. No model stage, no live run, no Discord send.

Command: `akrogon run-check --name green-merge -- bun test --timeout=30000 tests/green-merge.test.ts`. The whole run is the configured `test` check at check time.

| # | Test (tests/green-merge.test.ts) | Boundary, before → after | Failure it catches |
|---|---|---|---|
| 1 | `a green top lands with no seat` | `next` then `land`: merge holder with an applied top → origin/main = top, phase merged, one `merged` attempt line, zero herdr prompts, systemd-run log holds `--unit=akrogon-land-<id>` without `HERDR_PANE_ID`, last log.jsonl move `slot:null session:null`, `akrogon timing <slug>` prints no `incomplete prompt` | seat started on green, B recorded as mover, timing gap |
| 2 | `a red verify is never pushed and wakes B once` | origin/main unchanged, phase merge, batch `owner: seat wake: red red=<run>`, exactly one merge-issue prompt containing `wake=red red=<run> top=`; a second `next` adds no prompt and no land launch | pushing red, duplicate B prompt, restarting the verify |
| 3 | `an unrebaseable holder gets the solo prompt and no verify` | conflicting holder → one `attempt=<id> solo` prompt, no land launch in the systemd-run log, no verify-runs record | verify before solo |
| 4 | `a gate refusal records the refusal and wakes B` | uncited `tests/x.test.ts` change → nothing pushed, batch `wake: gate` with `refusal` naming the file, prompt contains `wake=gate` | pushing past a gate, refusal lost |
| 5a | `a clean restack is verified and pushed again with no seat` | a check that advances the remote once → two verify records, origin/main contains holder and advance, phase merged, zero prompts | stopping on a clean restack |
| 5b | `a second refusal, a manual rebase or a push error wakes B` | advance on every run → `wake=push`; conflicting advance → `solo` prompt; pre-receive hook rejection → `wake=push` with refusal text; holder head never on origin/main | retry loops, silent push errors |
| 6 | `a completing push hands off one broadcast seat` | sole leaf in its issue → state in `issues/closed/…` holds `broadcast {kind: issue}`, exactly one `broadcast-issue` prompt after land plus two `next`; a seeded undispatched handoff on a closed merged leaf gets exactly one prompt over two `next` calls; a non-completing push (sibling open) writes no handoff and sends no broadcast prompt | lost or duplicate broadcast |
| 7 | `a live land run is left alone and a dead one resumes; a seat-owned attempt stays with B` | fake systemctl `is-active` alive → `next` makes no launch, prompt or verify; unit absent → exactly one relaunch; `owner: seat` → B prompt, no launch | duplicate verify, B prompted during a command run, command restarting a B-owned attempt |
| 8 | `a crash after push recovers to merged once` | `owner: command`, `candidate` on the remote, unit dead → `next` twice → phase merged once, one `merged` attempt line, no relaunch | double move, re-push |
| 9 | `stop --all stops a tabless command merge` | fake systemctl: leaf in merge, no tab, `owner: command`, slice loaded → `stop --all` logs `stop <leafSlice>` and the leaf is in `stopped.yaml` | tabless land run left running |
| 10 | docs | no test (2026-10-01 lesson: prose assertions couple tests to wording). Proof is check-issue review reading the three files against criterion 10, plus `git --no-pager diff --stat $AKROGON_BASE -- skills/merge-issue/SKILL.md skills/broadcast-issue/SKILL.md src/AREA.md` showing all three changed | stale skill prose |

`tests/fake-systemctl.ts` gains `is-active` (exit 0 when the unit is in the db, else exit 3) for case 7. That is a test-input change in the test commit, not new runner machinery.

## Red evidence

`check green-merge-red: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-green-merge-red-1792423597508-720831.log` (9 fail, 1 pass):

- 1: `Expected: "command" Received: undefined` (no claim, B is prompted instead).
- 2, 4, 5a, 5b, 6: `land` exits 1. The verb does not exist yet.
- 7: `landLaunches` length 0, expected 1. Today `next` prompts B instead of launching.
- 8: phase and attempt line already pass through today's `reconcileBatch`. Red on `landLaunches` 0, expected 1: no command claim.
- 9: `stop --all` exits 1. `owner` is not in the strict batch schema, and `stop --all` skips tabless leaves.
- 3 holds today (preserved behavior). Intentional break: `mergeContext` solo token changed to `broken` → `check green-merge-red-solo: 1 /home/ivan/Work/infra/akrogon/issues/open/merge-solo/green-merge/implementation/check-green-merge-red-solo-1792423609079-733734.log`, `Expected to contain: "attempt=… solo"`. Reverted.

The test file does not typecheck until U1 adds `owner`, `wake`, `red`, `refusal` and `broadcast` to the schemas. This is expected.

## Limitations and risks

- R1 A land run that keeps throwing outside the outcomes (for example a git failure during checkout) is relaunched on every pass, and the receipt reuse keeps each retry cheap. It shows in the unit journal and in status `land dead`. The fix stays out of scope (YAGNI) unless observed.
- R2 A dead land run with an unlanded `candidate` takes today's `reconcileBatch` path: the record is cleared with a `red` attempt line and a new attempt starts. This matches the seat path today.
- R3 5a: no upgrade code. A record without `owner` is treated as seat-owned, which is exactly today's behavior.

## Implementation notes

- 2026-10-19 check.repair: carry HERDR_SOCKET_PATH when set into the land service, in addition to D3's environment, because design Flow 5 requires the completing broadcast dispatch and Flow 6 requires the immediate post-merge wake. Review-A F1 traced the real named-session socket being lost across the service boundary.
