# Plan: one-test-run

A per-repo one-at-a-time line for `run-check`/`verify` runs whose check name sits in the repo's new `full` config list. Restores the reverted host-wide line (revert 20455420) narrowed to same-repo scope, plus `stop-run` cancellation of waiters and `akrogon status` showing the line only while one waits.

## Decisions

- D1 `src/config.ts` `repoSchema`: add `full: z.array(text).default([])`; the existing `superRefine` block gains a loop refusing each entry that is not a key of `checks` or `merge_checks`, with `path: ['full']` and a message naming the entry (`Unknown check name in full: <name>`) — the reverted check, restored verbatim.
- D2 `src/admission.ts` `recordSchema`: `state: z.enum(['waiting', 'live', 'ended', 'cancelled'])`; add `full: z.boolean()` to `RunRecord` and `AdmissionHolder.full: boolean`. `full` is stored on the record so the queue reader filters without re-reading config; records are private to runs so strictness is safe.
- D3 `liveRuns()` returns records in state `live` or `waiting` that pass the pid/boot liveness check. This is the "open for the plan" question's answer: one widened reader serves all callers, which all need waiting records — `stopRunCommand` (cancel), `stopSlice`/`reconcile`/`reconcileHost` (slice protection). `cancelled` and `ended` stay excluded. Reconcile.ts itself needs no edit.
- D4 `lineRuns(repo)`: the reverted `fullSuites()`, filtered `record.repo === repo && record.full` and liveness (all states), sorted `waiting?-rank then since then token_hash` per repo. `ended` records keep their place (design: an `ended` holder keeps the line until record removal). `cancelled` is not in this list.
- D5 `awaitLineTurn(record)`: the reverted `awaitFullTurn`, per repo. Each poll takes `withAdmissionLock(slice)` then the repo lock `runs/locks/line-<repo>` (restores the two-level structure; the per-slice lock alone does not serialize two waiters of the same repo in different leaves). Inside the lock: read own record file → `cancelled` → throw `Error('run cancelled by akrogon stop-run')`; file vanished → rewrite the record as `waiting` with its original `since`; `lineRuns(repo)[0]` is not me → print `waiting for <repo>/<leaf> <check>` once per holder change on stderr and keep polling; first → write state `live` and return. Poll interval POLL_MS = 1000 ms.
- D6 `nested(token, full)`: a run is nested only when the token's record is live and `(record.full || !full)` — a listed run under a listed same-repo live holder runs at once creating nothing; any other run takes its own turn. `withAdmission` passes `holder.full`; listed runs write their `waiting` record under the slice lock before waiting (design: record before waiting) and keep `wait_ms` unchanged.
- D7 `src/run-check.ts` `checkedRun`: pass `full: repo.config.full.includes(name)` into the holder — one call site covers run-check and every verify caller (verify.go calls `checkedRun` for setup, checks and merge_checks).
- D8 `src/stop-run.ts` `stopRunCommand`: after the existing scope/`liveRuns()` match, if the found record is `waiting` take `withAdmissionLock(record.slice)` then the repo lock and re-read the record; if it is still `waiting`, write `state: 'cancelled'` and return without calling systemctl; if it was promoted meanwhile, fall through to the existing unit-stop path. Scope and process-identity checks stay as today.
- D9 `src/status.ts`: line table with columns `REPO LEAF CHECK STATE AGE RUN` rendered by the existing `render()`; rows = `lineRuns` records across registered repos sorted repo → holder-first → `since`; `waiting N` numbers per repo in queue order; printed only while at least one record is `waiting`.
- D10 `src/state-home.ts` `liveness`: `state` enum gains `waiting`/`cancelled`; `liveRecords` counts `live` or `waiting` — a waiting run holds the migration gate closed.
- D11 `sweepStale` unchanged: a waiting record has no units so the best-effort unit stop is a no-op; a cancelled record whose writer is alive stays (it never re-enters the queue — D4/D5). A cancelled record swept while the writer is stopped is resurrected as `waiting` on the writer's next poll only if the record vanished entirely; with a live writer the record parses, so nothing new-binary sweeps it (residual, same class as the stated old-binary residual).
- D12 Activation residual carried from design: runs admitted before a repo's `full` edit, or by an old binary still running, start at once — one-time overlap, stated.

## Read-first

- `src/admission.ts` (record schema, withAdmission, sweepStale, callerScope, liveRuns)
- `src/run-check.ts` `checkedRun` (holder construction, AKROGON_RUN propagation)
- `src/stop-run.ts`, `src/status.ts` (`render`/`suiteRows` shape from the revert), `src/state-home.ts` `liveRecords`, `src/reconcile.ts` (`stopSlice`, ~L545, ~L1320)
- `src/config.ts` `repoSchema` superRefine (L85-108)
- `git show 20455420^:src/admission.ts|src/status.ts|tests/run-permit.test.ts` — the reverted implementation and cases to narrow per repo
- `tests/helpers.ts` (`fixture`, `cli`, `run`/`Cap` local to run-permit, `fakeAkrogon`, `killTree`), `tests/run-units.test.ts` `scopedProcRoot`/`seedRunRecord` patterns, `tests/leaf-slices.test.ts` L385/L748 patterns, `tests/state-home.test.ts` `liveRecord`
- `docs/reference/checks.md`, `docs/reference/config.md`, `docs/reference/commands.md`, `src/AREA.md`, `tests/AREA.md`
- `learnings/history/2026-10-22-run-check-tmpdir-cross-device.md` — no `rename` into tmpdir; marks dirs live under `f.home`

## Interfaces used (all existing)

`withLock(path, action, mode)` (src/state.ts) · `runUnitBase`, `leafSlice`, `runSlice`, `sessionBusAddress`, `callerScope` (src/scope.ts, src/admission.ts) · `repoSchema`, `Repo.config`, `globalHome` (src/config.ts) · `spawnCaptured`, `CommandError`, `spawnFiles`/`finishCaptured` (src/shell.ts) · `render(titles, lines)`, `paint`, `clock` (src/status.ts) · `Bun.YAML` record codec already in admission.ts. No new machinery: every proof command is `bun test` against fixture-spawned `src/akrogon.ts` entry with handshake files — the pattern run-permit.test.ts already uses.

## Waves (file/criterion checklist)

Every wave holds exactly one unit → **serial-solo**: implement-issue's rule applies, A implements the plan itself with no workers.

| Wave | Unit | Owns paths | Criteria | Needs first |
|------|------|-----------|----------|-------------|
| 1 | U1 — admission + config + run-check | src/config.ts, src/admission.ts, src/run-check.ts, src/reconcile.ts* | C1, C2, C3, C4, C8; C7a product change (liveRuns widening) | — |
| 2 | U2 — stop-run cancel | src/stop-run.ts | C5 | U1 (waiting/cancelled states) |
| 3 | U3 — status line table | src/status.ts | C6 | U1 (waiting/full records) |
| 4 | U4 — migration gate | src/state-home.ts | C7b | U1 (new states) |
| 5 | U5 — docs | docs/reference/checks.md, docs/reference/config.md, docs/reference/commands.md, src/AREA.md, tests/AREA.md | doc checklist | U1–U4 |

\* U1's `liveRuns` widening is consumed by `stopSlice`/`reconcile`/`reconcileHost` in src/reconcile.ts without edits there — no file change, listed for review.

Test files are written and committed red in this pass, before any product code, so waves carry no test ownership: `tests/run-permit.test.ts` (C1–C5, C8), `tests/status.test.ts` (C6), `tests/leaf-slices.test.ts` (C7a), `tests/state-home.test.ts` (C7b). Shared test resources: none across units — fixture state homes are per-test temp dirs; no live fixture, account or site.

## Verification (done-criteria → observations)

Each proof is `akrogon run-check --name <label> -- bun test <file> -t '<pattern>'` from this worktree. Rerun trigger for every proof: changes to the unit's owned paths or the test file; none involves model or outside stages.

Recorded red (pre-product): `check c1: 1 implementation/check-c1-1793016500233-2032267.log` — the fixture's `full` key is refused by the strict schema, so `a.held` never appears and the test times out at the first handshake. The absent feature is the violation.

### C1 — per-repo serialization + order (U1)

Test `tests/run-permit.test.ts` `listed runs of one repo wait for their repo holder, print the holder, and start in arrival order`.
- Boundary: `withAdmission` wait loop vs `checkedRun` command start, real CLI processes.
- State before: config `full: ['test']`; holder `a` in leaf-one holds (handshake `a.held`), waiters `b`,`w1`,`w2`,`w3` in leaf-two/leaf-one queued, each stderr shows `waiting for repo/leaf-one test` and `dir/b`,`dir/wN` absent.
- State after: `a`'s record file is gone from `<home>/runs` before `dir/b` exists (observed by matching the record's `run` field to the `run <id>` line on `a`'s stderr); `order` file reads `w1`,`w2`,`w3`; `check_start` `wait_ms > 0` for `b`.
- Failure caught: runs overlapping (the 48/73 vs 122/190 load regression) or reordering.
- Command: `akrogon run-check --name c1 -- bun test tests/run-permit.test.ts -t 'listed runs of one repo'`. Size: minutes (≈60 s).

Condition checks: (a) *must not start before holder ends* — decision D5 promotes only when `lineRuns(repo)[0]` is self, and the queue keeps `ended` records → violated by promoting on `live`-only readers; case: the `dir/b`-while-holder-record-exists probe (red today: no queue, `b` runs at once, no `waiting for` line). (b) *arrival order* — `since` + `token_hash` tie-break (D4); case: `order` file equality (red today: same). (c) *stderr names holder* — D5's once-per-holder write; case: `waitForText(/waiting for repo\/leaf-one test/)` (red today).

Recorded red: `check c2: 1 implementation/check-c2-1793016548082-2267447.log` — same config-refusal timeout at `a.held`.

### C2 — other checks/repos unaffected (U1)

Test `tests/run-permit.test.ts` `a listed run of another repo and an unlisted run start at once over the line`.
- Boundary: same admission path. Setup adapts the reverted two-repo fixture: repo `other` also with `full: ['test']`, plus a third `c` listed waiter in repo to prove the queue itself engaged.
- State before: holder `a` (repo) holds; `c` (repo, listed) shows `waiting for`.
- State after: `dir/small` (unlisted `format` in repo) and `dir/ob` (listed `test` in `other`) appear while `a` holds and `dir/c` stays absent; `c`'s `waiting for` names only repo holders.
- Failure caught: the reverted host-wide wait (framework's 20-min verify blocking akrogon).
- Command: `akrogon run-check --name c2 -- bun test tests/run-permit.test.ts -t 'start at once over the line'`. Size: minutes.

Condition checks: *only same-repo listed runs must wait* — D4's `record.repo === repo` filter; deliberate-break probe planned at review: dropping the repo filter turns this test red (assert `dir/ob` exists while `a` holds). Red today: `c` never prints `waiting for`.

Recorded red: `check c3: 1 implementation/check-c3-1793016571179-2391991.log` — same config-refusal timeout (leg A's `inner` never appears).

### C3 — nesting (U1)

Test `tests/run-permit.test.ts` `a listed run nests under its repo holder and queues under an unlisted run`.
- Boundary: `nested()` admission shortcut, real nested `akrogon` via `fakeAkrogon` shim.
- Leg A state: holder `h` (listed) runs `akrogon run-check --name test` inside itself → `dir/inner` exists while `h` holds; `runs/` contains only `h`'s record; outer stderr has no `waiting for`.
- Leg B state: holder `h2` (listed, `hold`) while `outer2` (unlisted `format`) runs `akrogon run-check --name test` → `dir/inner2` absent while `h2` holds; after `release`, `outer2` exits 0 and `dir/inner2` exists.
- Failure caught: deadlock from a listed holder waiting on itself, or a nested-listed run leaking a second record.
- Command: `akrogon run-check --name c3 -- bun test tests/run-permit.test.ts -t 'nests under its repo holder'`. Size: minutes.

Condition checks: (a) *listed-inside-listed runs at once, no record* — D6's `record.full || !full` gate on a live token record; case: `inner` mark + single-record `runs/` (green today: current `nested` also admits it — the leg's real discriminant is leg B). (b) *listed-inside-unlisted takes its own turn* — D6's `!full` arm makes it non-nested, then D5's queue; case: `dir/inner2` absent while `h2` holds (red today: nested admits `inner2` at once).

Recorded red: `check c4: 1 implementation/check-c4-1793016595669-2500595.log` — same config-refusal timeout at `h.held`.

### C4 — SIGKILL tolerance (U1)

Test `tests/run-permit.test.ts` `a killed holder or waiter does not block the line`.
- Boundary: liveness check vs promotion; `killTree` SIGKILLs.
- State before: holder `h` holds; waiters `dead`, `next` queued (`waiting for` seen).
- Action: SIGKILL `dead`, then `h`; records linger with dead pids.
- State after: `next` exits 0; `order` file reads exactly `next`.
- Failure caught: dead-pid records freezing a repo's line (the only recovery without stop-run).
- Command: `akrogon run-check --name c4 -- bun test tests/run-permit.test.ts -t 'killed holder or waiter'`. Size: minutes.

Condition check: *dead holders/waiters must not count* — D4's `live(record, boot)` pid+start-time check filters killed records; `sweepStale` reaps them. Case: `next` starts (red today: no queue, `dead` also wrote its mark → `order` = `dead,next`).

Recorded red: `check c5: 1 implementation/check-c5-1793016618371-2642746.log` — same config-refusal timeout at `h.held`.

### C5 — stop-run cancels a waiter (U2)

Test `tests/run-permit.test.ts` `stop-run cancels a waiting run and the next waiter takes its place`.
- Boundary: `stopRunCommand` cancel write vs the wait loop; `AKROGON_PROC_ROOT` scoped fake `/proc/self/cgroup` (run-units.test.ts `scopedProcRoot` pattern) so caller and waiter share `paneA.scope`. Fake `systemd-run` shim — no real units needed since waiters never reach unit start.
- State before: holder `h` holds; waiters `w1`,`w2` queued; `w3` queued then SIGSTOPped.
- Action: `akrogon stop-run <w1 id>` (id read from `w1`'s waiting record) and `stop-run <w3 id>` from the same scope; release `h`.
- State after: `w1` exits non-zero, `dir/w1` never appears; `w2` exits 0 with `dir/w2`; `w3` still stopped (record `cancelled`), then SIGCONT → exits non-zero; no `w1`/`w3` record is rewritten (`runs/` entries for their tokens stay `cancelled` until the writer's `finally` removes them).
- Failure caught: a stuck waiter that can only be cleared by killing processes (design 2a).
- Command: `akrogon run-check --name c5 -- bun test tests/run-permit.test.ts -t 'stop-run cancels a waiting run'`. Size: minutes.

Condition checks: (a) *cancel must leave the queue at once* — D8's write of `cancelled` under the same lock pair the poll uses, so a promotion in flight is serialized; D4 excludes `cancelled`. Case: `w2` starts after `h` ends (red today: `w1` never waits → `runRecords` wait-for times out). (b) *cancelled run never runs its command* — D5's throw before promotion. Case: `dir/w1` absent + non-zero exit (red today). (c) *record not written again* — D5 re-reads the file before the vanished-rewrite, so `cancelled` is never overwritten. Case: `w3`'s record stays `cancelled` while stopped (red today). (d) *cancel falls through to unit stop when promoted* — D8 re-reads under lock; reason it cannot break: the record write and the promotion write share the repo lock, so one wins; if promotion won, `stop-run` takes the live path.

Recorded red: `check c6: 1 implementation/check-c6-1793016471241-1970395.log` — positive phase fails with `/run line/` unmatched (board shows `repo\n  no open leaves`); negative phases already pass, matching the gate.

### C6 — status table only while one waits (U3)

Test `tests/status.test.ts` `status shows the run line only while a listed run waits`.
- Boundary: `statusCommand` stdout; seeded records in `<home>/runs` (`seedRunRecord` shape: pid = test process so liveness holds).
- State before: table absent with no records, with an unlisted (`full: false`) `live` record, and with only listed `live`/`ended` records.
- State after: with two repos' records — repo listed live + two listed `waiting`, other listed live + listed `waiting` — table shows `REPO LEAF CHECK STATE AGE RUN` header via `render`, holder rows `running` first per repo, then `waiting 1`, `waiting 2` per-repo with the seeded run ids.
- Failure caught: a stale table (the 2026-10-24 complaint) or cross-repo `waiting N` numbering.
- Command: `akrogon run-check --name c6 -- bun test tests/status.test.ts -t 'run line only while'`. Size: seconds.

Condition check: *table exists iff a waiting record parses* — D9's `some waiting` gate over `lineRuns` records (which exclude `cancelled` and unparsable). Case: all three negative phases then the positive (red today: `waiting` records fail schema → table never prints → positive phase fails).

### C7 — waiting records count as live (U1/U4)

Recorded red: `check c7a: 1 implementation/check-c7a-1793016477199-2013404.log` — `existsSync(temp)` is false after the pass: the `waiting` record fails today's `live`/`ended` schema, is skipped, and the temp is removed.

- C7a `tests/leaf-slices.test.ts` `a finished leaf temp stays while its slice is named by a waiting run record`: clone the L748 seeding pattern with `state: waiting`, `full: true`, `slice: <leaf slice>` → the finished leaf's temp survives the pass. Boundary: `stopSlice`/`reconcile` `liveRuns` set. Command: `akrogon run-check --name c7a -- bun test tests/leaf-slices.test.ts -t 'waiting run record'`. Size: minutes. Condition: *waiting must not be swept or ignored* — D3 returns `waiting` records that pass liveness (red today: schema rejects `waiting` → record unreadable → no keep → temp removed → red).
Recorded red: `check c7b: 1 implementation/check-c7b-1793016465677-1931790.log` — `moved state home` printed despite the waiting record: the liveness enum rejects `waiting` so the gate opened.

- C7b `tests/state-home.test.ts` `cutover is deferred while a waiting run record exists in the tool root runs/`: `liveRecord()` with `state: 'waiting'`, `full: true` → `config` run prints no `moved state home`; after the record is removed it migrates. Boundary: `liveRecords`/`settled`. Command: `akrogon run-check --name c7b -- bun test tests/state-home.test.ts -t 'deferred while a waiting'`. Size: seconds. Condition: *waiting holds the gate* — D10 counts `waiting` (red today: liveness enum rejects `waiting` → gate opens → migrates → red).

Recorded red: `check c8: 1 implementation/check-c8-1793016456549-1872123.log` — config exits non-zero (the negative holds) but stderr is `Unrecognized key: "full"`, not the `full.*missing` entry-naming refusal: today's strict schema refuses the field itself, so D1 both admits the field and enforces the entry check.

### C8 — config refusal (U1)

Test `tests/run-permit.test.ts` `config refuses a full name that is not a check`: `full: ['missing']` → `akrogon config` exits non-zero, stderr matches `/full.*missing/`. Boundary: `repoSchema` superRefine at `readGlobal`. Command: `akrogon run-check --name c8 -- bun test tests/run-permit.test.ts -t 'refuses a full name'`. Size: seconds. Condition: *unknown names must be refused when the config is read* — D1 (red today: unknown key passes the schema).

## Deliberate break check

Per standing design: with product code present, dropping the `record.repo === repo` filter in `lineRuns` turns C2's test red (`dir/ob` never appears while `a` holds — `ob` joins repo's queue). Noted for implement; not run now (product absent — every criterion case above is already red against missing behavior, which *is* the violation the condition names).

## Docs checklist (one line each)

- `docs/reference/config.md` — restore `full` row + example, worded per-repo (same registered repo, not host-wide).
- `docs/reference/checks.md` — restore the `full` paragraph with `waiting for <repo>/<leaf> <check>` and per-repo wording.
- `docs/reference/commands.md` — `stop-run` row gains the waiting-cancel case; `status` row gains the line table.
- `src/AREA.md` — admission line: waiting/live/cancelled states, per-repo line, stop-run cancel.
- `tests/AREA.md` — run-permit.test.ts line gains the line/cancel cases; leaf-slices/state-home/status gains one clause each.
- No skill file changes: `stop-run`'s skill wording already covers the cancel case.

## Limits (stated in design, kept)

Raw `bun test` and unlisted names stay outside the line; a SIGSTOPped head waiter blocks its repo's line until `stop-run` cancels it (it exits on resume); a waiter may start up to ~5 s early after a killed wrapper; runs admitted before the `full` edit or by an old binary overlap once; a `cancelled` record swept while its writer is stopped can be rewritten on resume (same class as the old-binary residual — D11); the leaf proves the line, not that suites get faster.

## Blockers

None. `akrogon status one-test-run` prints no `Missing:` lines and the design names no credentials.

## Implementation notes

- 2026-10-26 check.repair: pass the holder's repo into `nested` and require that repo to match for listed nesting, as required by design's binding decision "inside any other run (another check, another repo) it takes its own turn"; D6 omitted this comparison.
