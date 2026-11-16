# Plan: refuse-failed-runs

Brief and design agree on the mechanism; the design's verbatim text wins where they differ (see note N1). The design names no `Open for the plan:` questions; every implementation choice below follows its locked picks.

## Read-first

- `src/run-check.ts` — `checkedRun`, `ownerRefusal`, `refusePublish`, `leafFields`, `leafTarget`, `PublishRefusedError`.
- `src/timing.ts` — `timingEventSchema` discriminated union, `checkCore`, `appendTiming`, `readTimings`.
- `src/state.ts` — `readState`, `saveState`, `failureSchema` (`cause`, `phase`, `slot`, `reason`); `failure` is optional when `phase` is `failed`.
- `src/admission.ts` — `withAdmission`, `awaitLineTurn` (only `full` checks queue, per repo, FIFO).
- `src/verify.ts` — `verify`, `passOnce`, `runOnce`: every check stage goes through `checkedRun`; the pass service is plumbing, not a stage. `verify` reuse (`greenRun`) and join (`livePass`/`waitPass`) start no child.
- `src/verify-pass.ts` — `passCaller`, `PassRecord`, `passLive`.
- `tests/run-check.test.ts`, `tests/verify.test.ts`, `tests/run-permit.test.ts` (`spawnFiles` waiting idiom, `FULL_CONFIG`), `tests/helpers.ts` (`cli`, `leaf`, `leafWorktree`, `callerWorktree`, `greenReceipt`, `seedRun`).
- `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`, `src/AREA.md` — doc surfaces to update.
- `learnings/history/2026-11-15-background-wait-fails-leaf.md` — the case this leaf stops halfway (paid relaunch). The LESSONS line stays; the background wait is count-silent-turns' leaf.

## Decisions

- D1 — Gate on `phase !== undefined` of the resolved `LeafTarget`. `leafFields` sets `phase` for leaf and worker scope; the checkout holder target carries none, so holders are never refused (criterion 4).
- D2 — `checkedRun` keeps its `LeafTarget` parameter (callers unchanged: `runCheck`, `verify` stages). The decision reads `readState(dirname(target))` fresh at each check; the captured `phase` field only feeds timing rows and is never the decision input.
- D3 — New helper `failedRefusal(caller: LeafTarget, name: string)` in `src/run-check.ts`: returns `undefined` for `phase === undefined`; otherwise reads state fresh, returns `undefined` unless `phase === 'failed'`; on `failed` it appends one `check_refused` timing row and throws `PublishRefusedError`.
- D4 — Early read: in `checkedRun`, after the existing early `ownerRefusal` (so `owner closed/closing` keeps precedence when state.yaml remains readable) and before `runRoot` creation and `withAdmission`.
- D5 — Late read: inside the `withAdmission` callback, after the fenced late `ownerRefusal(target, repo, true)` and before capture files are created. It is the acceptance point: a failure committed after it does not cancel the run. Runs waiting on the `full` line are refused when promotion lets them through, before spawn.
- D6 — The `run` UUID and the `check` row object are hoisted to the top of `checkedRun` so early and late refusals can append `check_refused`. No `check_start` row is appended for a refused run; `wait_ms` is not recorded.
- D7 — Timing kind: `z.strictObject({ ...slugged, kind: z.literal('check_refused'), ...checkCore })` added to `timingEventSchema` (run, optional phase, name, scope, optional unit and attempt). Refused rows carry the fresh `phase: 'failed'`, not the stale snapshot.
- D8 — A phase refusal never goes through `refusePublish`: no `refusal.json`, no kept log, `runRoot` is removed. `refusePublish`, `refusal.json` consumers and reconcile's scratch hold keep their behavior for owner refusals.
- D9 — Refusal text is the brief's, thrown through `PublishRefusedError`:
  `Refusing run-check <name> for leaf <repo>/<slug>: the leaf is failed (<reason>). Stop work on this leaf; the operator recovers it with akrogon phase <slug> <failure.phase>.`
  When `state.failure` is absent: `(failure record unavailable)` fills the `(<reason>)` slot, and the tail is `the operator recovers it with akrogon phase <slug>.` (no recovery phase named; criterion 1).
- D10 — `verify` stages are refused inside `checkedRun` (setup, sequential checks, `merge_checks` members). The `akrogon-verify-<id>` service is verify's own plumbing started before its first stage and is not a "child process" of a stage; criterion 1's "starts no child process" means no check-command child. A refusal leaves only the incomplete receipt row (no `end`, `setup` undefined).
- D11 — `verify` green-receipt reuse and live-pass join are never refused and start no child (stated limit, criterion 4).
- D12 — No carve-out by stage or scope: run-check and every verify stage refuse identically; the refusal never writes a complete receipt.
- D13 — Docs: `docs/reference/commands.md` run-check/verify rows name the failed-leaf refusal; `docs/reference/files.md` adds `check_refused` to the timing-kind list; `docs/reference/checks.md` gains one paragraph under "Keep output with akrogon run-check"; `src/AREA.md` line 5 names the refusal and `check_refused`.
- D14 — Limitation preserved (design's timing seam): `readTimings` parses every line strictly in one try; an older akrogon release reading a timings file holding a `check_refused` row drops all timings for that repo.
- D15 — Lesson: this leaf stops only the paid-relaunch half of `2026-11-15-background-wait-fails-leaf`; the LESSONS line stays, no `Applied` entry.

## Condition check on decisions (per skill rule)

Each condition its done-criterion states, traced against the decision that could break it:

- C1 conditions: no child spawned / non-zero exit / exact stderr text / fires when `failed`. Case: T1 runs red while unimplemented (missing behavior). Extra condition "early, before admission": the distinguishing signal is stderr — an admission-accepted run prints `run <uuid>`; T1 asserts its absence. Deliberate break: remove the early read → T1 shows `run <uuid>` in stderr (recorded below after the run).
- C1a `(<reason>)` and unavailable-record text: T1b asserts the parenthesized forms. Deliberate break for the unavailable branch: always emit `(failure record unavailable)` → T1 turns red (expected reason text absent).
- C1 "for one of its workers": T2 (worker worktree) red while unimplemented. Deliberate break: scope check `scope === 'leaf'` only → T2 red.
- C2 "refused when admission lets it through, before its child spawns": T3 red while unimplemented; the brief's named deliberate break (late read removed) turns T3 red — recorded below.
- C3 "one `check_refused` row with slug/run/name/scope/phase (+unit/attempt) that `readTimings` parses": T4 asserts exactly-one row and full shape. Deliberate break: appending two rows → T4 red.
- C4 "child already spawned finishes": T5 passes unimplemented (existing behavior). Condition it could break: refusal after acceptance. Deliberate break: `failedRefusal` re-run after the child exits → T5 red.
- C4 "holder target never refused": T6a/T6b pass unimplemented. Deliberate break: drop the `phase === undefined` guard → checkout caller reads `readState(holder)` and dies → T6a/T6b red.
- C4 "verify reuse/join start no child, stay as today": T8a/T8b pass unimplemented. Deliberate break: refusal check before `greenRun` in `verify()` → T8a red.

## Files and units

Serial-solo: the whole run is one unit of product code plus the planner's own test commit (tests are committed by A before any product code per the phase rule), so implement-issue's serial-solo rule applies — A implements, no workers.

- U0 (this pass, A): test commit adding T1–T8 below to `tests/run-check.test.ts` and `tests/verify.test.ts`; the commit carries `Test-Change: <path> <what was added; no existing expectation changed>` per file.
- U1 (implement wave 1, the only unit): `src/run-check.ts` (D2–D6, D8, D9), `src/timing.ts` (D7), docs per D13. Owns: `src/run-check.ts`, `src/timing.ts`, `src/AREA.md`, `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`. Depends on U0's landed tests; no shared test resource.

## Tests (all CLI-boundary, fake child via markers)

### `tests/run-check.test.ts` additions

- T1 `run-check refuses a failed leaf before admission for a worktree cwd and a --leaf target`:
  leaf `doomed` phase `implement` + worktree; after worktree creation, `saveState` phase `failed` with `failure: {cause:'blocked', phase:'plan.synthesis', slot:'B', reason:'operator asked'}`. `run-check --name probe -- touch <marker>` from the worktree → code 1, stderr contains `Refusing run-check probe for leaf <repo>/doomed: the leaf is failed (operator asked).` and `akrogon phase doomed plan.synthesis`, stderr lacks `^run [0-9a-f-]{36}` and `^capture `, marker absent, no `check-probe-*` or `capture-*` under `implementation/`; a `check_refused` timing row exists. Second half: `run-check --leaf <failedLeafPath>` from a healthy leaf worktree → same refusal naming `doomed`.
- T1b `run-check refuses a failed leaf with no failure record and names no recovery phase`: leaf `recordless` phase `failed`, no `failure`. → `the leaf is failed (failure record unavailable)`, tail `the operator recovers it with akrogon phase recordless.`, and stderr does not match `/phase recordless \S+/`.
- T2 `run-check refuses a worker-scoped run for a failed leaf`: failed leaf `wfail` (with failure record), detached worktree `<store>/wfail-u1`; run-check from it → code 1, refusal text, marker absent.
- T3 `run-check waiting on the full line is refused after the leaf fails while it waits`:
  config `full: ['test']`. leaf `holder` + worktree; leaf `waiter` + worktree. A = `spawnFiles` run-check `--name test -- touch a.held; wait for release` on `holder`. Wait `a.held`. B = `spawnFiles` run-check `--name test -- touch <bmarker>` on `waiter`. Poll B's captured err for `waiting for <repo>/holder test`. Then `saveState` waiter → `failed` + failure `{cause:'attempts', phase:'implement', slot:'A', reason:'seat A ended 3 turns without reporting'}`; write `release`. A exits 0. B exits 1, stderr contains `waiting for`, `run <uuid>`, `Refusing run-check test for leaf <repo>/waiter: the leaf is failed (seat A ended 3 turns without reporting)`, marker absent, one `check_refused` row for `waiter`.
- T4 `a refused run appends exactly one check_refused row with the run identity`: leaf `timing-leaf` failed with `failure` and `batch: {attempt:'att-9', built_on:<sha>, holder:{base:<sha>,head:<sha>}, applied:true}`; refused run-check `--name audit`. Assert via `readTimings(f.root)`: exactly one event kind `check_refused` matching `{slug:'timing-leaf', name:'audit', scope:'leaf', phase:'failed', attempt:'att-9'}` with a UUID `run`; no `check_start`/`check_end` for that run.
- T5 `a run whose command already started finishes and publishes when the leaf fails mid-run`: child `sh -c 'sleep 1; <test waits? no—> '`. Implementation: child script `sleep 0.2` then test flips? Simpler: child `sh -c 'sleep 1; touch <marker>'`; after spawn, wait ~300 ms (child started; late read already passed — the late read precedes spawn by <1 s), `saveState` failed, then `finishCaptured` → code 0, marker exists, `check_end` row exists, no `check_refused`. To prove the child had spawned before the flip deterministically: child `touch <started>; sleep 0.4; touch <marker>`; test waits for `<started>` file then flips.
- T6a `a --holder run-check is never refused for a leaf phase`: failed leaf exists; `run-check --holder <dir> -- echo holder-out` from `f.root` → code 0, `holder-out` in stdout, no `check_refused` row.
- T6b `verify --holder is never refused for a leaf phase`: like the existing `--holder` merge-scope test; failed leaf exists in inventory; `verify --holder <dir>` from a detached non-leaf worktree → code 0, receipt `leaf:'checkout'` complete, no `check_refused`.

### `tests/verify.test.ts` additions

- T7 `verify refuses its stages for a failed leaf, starts no check command and leaves an incomplete receipt`: `checks: {probe: 'touch <marker>'}`; caller worktree leaf `failed` + failure record. `verify([])` → non-zero, stderr `Refusing run-check setup for leaf <repo>/<slug>: the leaf is failed (<reason>)`, marker absent, `records(f)` is one row with `setup` undefined and `end` undefined (incomplete), a `check_refused` row `name:'setup'`.
- T8a `verify reusing a green receipt on a failed leaf starts no child`: `greenReceipt(f, HEAD, 'leaf')`; leaf failed. `verify` → code 0, stdout `reuse receipt`, no `check_refused`, records still just the seed.
- T8b `verify joining a live pass on a failed leaf starts no child`: seed `<AKROGON_HOME>/verify-passes/<id>/record.yaml` — caller `{slug, target:<leaf>/implementation, scope:'leaf', phase:'failed'}`, `caller_scope: callerScope()` imported live, `tree`, `scope:'leaf'`, `commands`/`setup` via `verifyCommands`/`setupCommand`, `member_count:0`, `sha`, `akrogon_base`, `pid:1`, `boot_id: bootId()`, `pending:false`; `status` file `0\n`. `verify` → code 0, stderr `run <id>`, no `check_refused`, no receipt row appended.

## Done-criteria → proof

- Criterion 1 → T1, T1b, T2, T7. Proof command: `bun test --timeout=30000 tests/run-check.test.ts -t 'refuses a failed leaf|failure record|worker-scoped'` plus `bun test --timeout=30000 tests/verify.test.ts -t 'refuses its stages'`. Observation: CLI exit code and stderr of the real `akrogon run-check`/`verify` binaries against a fixture repo; marker files prove no child ran; the failure it catches is "seat keeps spending after the leaf failed" (#136). Size: seconds. Rerun trigger: any change to `checkedRun`, `leafTarget`, `withAdmission` or the state schema.
- Criterion 2 → T3. Proof: `bun test --timeout=30000 tests/run-check.test.ts -t 'waiting on the full line'`. Observation: B's own stderr shows `waiting for` then the refusal before its marker could exist; the only admission queue is the `full` line so the fixture uses it. Size: seconds. Rerun trigger: `withAdmission`, `awaitLineTurn`, `checkedRun` changes.
- Criterion 3 → T4 (and T1–T3 asserting row presence). Proof: `bun test --timeout=30000 tests/run-check.test.ts -t 'exactly one check_refused'`. Observation: `issues/timings.jsonl` parsed through the real `readTimings`; a malformed row would warn-and-drop instead of landing — the import asserts parse. Size: seconds. Rerun trigger: `timingEventSchema`, refusal path.
- Criterion 4 → T5, T6a, T6b, T8a, T8b. Proof: `bun test --timeout=30000 tests/run-check.test.ts -t 'already started|--holder'` and `bun test --timeout=30000 tests/verify.test.ts -t 'holder is never refused|reusing a green receipt|joining a live pass'`. Observation: green completion, holder output and receipts are the product's own results for unchanged paths. Size: seconds. Rerun trigger: any change to the gate condition (D1) or verify entry flow.

One runner-filtered invocation per file is also run to prove the whole file still passes with the additions: `bun test --timeout=30000 tests/run-check.test.ts` and `bun test --timeout=30000 tests/verify.test.ts` (the repo's configured runner on the two owned files; the brief names no whole suite).

## Notes

- N1 (design vs literal text): design's corrected Q2 spells the missing-record tail `akrogon phase` with no slug. The criterion's template keeps `<slug>` and only the phase is dropped, so D9 keeps `akrogon phase <slug>`; flagged for review.
- N2: criterion 2's test turns red under the deliberate break the brief names (late read removed); recorded below with its output.
- N3: `akrogon verify --attempt` resolves its caller from a `merge`-phase leaf only (`verifyCaller`), so it is unreachable on a failed leaf; the verify refusal paths that matter are worktree-cwd and `--holder`.
- N4: nested run-check (`AKROGON_RUN` live token) skips the queue but still runs the `withAdmission` callback, so the late read refuses it — matching design Q3.
- N5: no credentials, grants, paid or model stages. `env_names` empty; nothing missing for `akrogon status`.

## Pass record

Run under `akrogon run-check` from the leaf worktree; logs land in `implementation/`.

Red on the unimplemented tree (missing behavior), all through `bun test --timeout=30000 <file> -t <pattern>`:

- `check plan-t1-failed-leaf: 1` — T1/T1b/T2 fail `Expected: 1 / Received: 0` (run-check ran the child on a failed leaf).
- `check plan-t3-waiting: 1` — T3 fails `Expected: 1 / Received: 0` (waiting run proceeded after the fail).
- `check plan-t4-row: 1` — T4 fails `Expected: 1 / Received: 0`.
- `check plan-t5-midrun: 0` — T5/T6a pass unimplemented (unchanged behavior).
- `check plan-t7-verify: 1` — T7 red; T8a/T8b/T6b mixed (see below).
- `check plan-t8-join: 1`, `plan-t8-join2: 1`, `plan-t8-join3: 0` — T8b fixed across iterations: seeded `caller_scope` first mismatched (test process's `AKROGON_RUN` scope vs spawned CLI's cgroup), then the record seeded the real `~/.akrogon` instead of `f.home`, then the fake live record never died so `waitPass` timed out; final form joins, prints `run jointest`, and returns the seeded status 0 after `record.yaml` is removed mid-wait.

Deliberate-break reds, each run over a temporary seam of the mechanism, reverted before the test commit (seam ran all criteria tests green: `check plan-seam-all: 0`, `check plan-seam-verify: 0`):

- `check plan-break-early: 1` — early read removed: T1 fails on `expect(stderr).not.toMatch(/^run [0-9a-f-]{36}/m)`; the refusal still fires late inside `withAdmission`. Proves the early read's observable boundary.
- `check plan-break-late: 1` — late read removed (the brief's named break): T3 fails `Expected: 1 / Received: 0`; the promoted run spawned `touch` and exited 0.
- `check plan-break-scope: 1` — gate narrowed to `scope === 'leaf'`: T2 (worker) runs and exits 0.
- `check plan-break-holder: 1` — `phase === undefined` guard dropped: the holder run dies on `readState(holder)`; T6a red.
- `check plan-break-midrun: 1` — refusal re-checked after the child exits: T5's already-accepted run is refused; exit 1.
- `check plan-break-twice: 1` — two rows appended: T4 fails `Expected length: 1 / Received length: 2`.
- `check plan-break-reuse: 1` — refusal ahead of `greenRun` in `verify()`: T8a exits 1 instead of reusing the green receipt.

Test commit `de7a1503` on the leaf branch carries the `Test-Change:` trailers, one per changed existing test file.

### Count lines

No grant-covered, paid or live launches this pass: `readiness.yaml` holds no grants and no paid step was run. Every launch above was a free local `bun test` through `akrogon run-check`; kept logs: `check plan-t1-failed-leaf`, `plan-t3-waiting`, `plan-t4-row`, `plan-t5-midrun`, `plan-t7-verify`, `plan-t8-join`, `plan-t8-join2`, `plan-t8-join3`, `plan-seam-all`, `plan-seam-verify`, `plan-break-early`, `plan-break-late`, `plan-break-scope`, `plan-break-holder`, `plan-break-midrun`, `plan-break-twice`, `plan-break-reuse` and `setup` under `implementation/`.
