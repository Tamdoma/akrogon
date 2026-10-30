# Plan: abandoned-capture-stop

Synthesis from `brief.md` and `design.md` in this folder, grounded in `docs/reference-index.md`,
`src/run-check.ts`, `src/phase.ts`, `src/pack.ts`, `src/flock.ts`, `src/evidence.ts`, `src/routing.ts`,
`tests/durable-capture.test.ts`, `tests/run-units.test.ts`, `tests/helpers.ts`, `tests/AREA.md`,
`learnings/LESSONS.md`, and the fork record `issues/chart/killed-run-fixture/forks/killed-run-stop.md`.

## Decisions

- D1 — Capture liveness by shared flock on one open file description (design Q2·2a). In
  `checkedRun`, `writeFileSync(captureOut, '')` is replaced by `openSync(captureOut, 'w')` and a
  one-shot `Bun.spawnSync(['flock', '-s', String(capFd)])` locks that description before the
  `capture <name>:` stderr line and `check_start` timing. `flock` fd-mode uses the existing fd
  number: `Bun.spawnSync` defaults inherit, so the descriptor is already open in the helper. The fd
  is kept open until after both `unlinkSync` calls, in a `try/finally`, so the normal path, the
  refusal path (`refusePublish` throw) and any throw path all hold the lock until publication or
  abandonment is decided. `writeFileSync(captureErr, '')` is unchanged.
- D2 — `spawnLogged` takes the locked fd (design Q2·2a). Its `capture` argument becomes
  `{ out: string; outFd: number; err: string }`; `Bun.spawn` gets `stdout: capture.outFd` in place of
  `Bun.file(capture.out)`. `outRead`/`errRead` stay path-opened and lock-free; `stderr` stays
  `Bun.file(capture.err)`. Both the nested `flock -s <owner .lock>` call and the
  `runUnitArgv`/`systemd-run --scope` call pass stdout through, and the proof in the leaf's
  `state.yaml` `proofs` block measured the fd share surviving both wrappers, so the pair stays live
  while the wrapper or any stdout-holding descendant lives.
- D3 — Abandoned-pair listing beside the capture code in `src/run-check.ts`:
  `abandonedCaptures(folder: string): { out: string; err: string; cleared: string }[]`. It scans the
  folder recursively for `capture-<name>-<run>-out.log` files (name regex
  `/^capture-.+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-out\.log$/`), keeps
  each pair whose sibling `cleared-<run>.md` is absent, empty or whitespace-only, then probes each
  capture-out by `openSync(path, 'r')` followed by a non-blocking exclusive `flock -n -x <fd>`
  (a `Bun.spawnSync` whose `stdio` passes the probe fd, exit 0 means abandoned). `ENOENT` at open —
  the pair vanished between discovery and probe, as publication does — skips the pair; the probe
  never opens with create, so it leaves no file. A `-err.log` with no `-out.log` sibling is skipped:
  either publication removed the out file already, or the run is otherwise finished; the refusal
  keys on pairs, which the criterion names.
- D4 — The refusal is raised inside `moveGuards` in `src/phase.ts`, skipped when
  `state.phase === 'failed'` (operator recovery out of `failed` stays open; a re-refusal happens on
  the next move after recovery if the pair is still uncleared, which is the intended pressure). The
  thrown error names each abandoned pair's out and err paths and the clear step: read the pair, run
  the leaf grant's discovery, cleanup and absence read for that run, then write a non-blank
  `cleared-<run>.md` beside it. `transition` runs `moveGuards` before `checkOnly`, before the
  single-slot `recorded` save and before `commitMove`, so `--check`, one-slot completion and real
  moves all refuse; the `failed` branch returns before `moveGuards` and stays open. Design's open
  question resolved: `moveGuards` already covers every seat-driven non-failed move and `landGates`
  (which calls it), so one call site covers `--check` and one-slot completion.
- D5 — Merge-completion coverage (B F8 resolved). A run-check abandoned between `landGates` and
  `commandMerged`/`completeOwner` side effects is refused before owner side effects:
  - In `refuseEnclosingCompletion` (called by `commitMove` under `to === 'merged'` before
    `saveState`): when `ownerCompletion(...)` returns a completing owner, `abandonedCaptures(owner)`
    runs and throws the refusal error — before `saveState`, so `state.yaml` and `issues/log.jsonl`
    stay unchanged. This covers seat `merged` moves (via `commandMerged`/`seatMove`) and land-run
    merges, which both reach `commitMove`.
  - In `completeOwner`: `abandonedCaptures(owner)` probes when `completed !== null`, before
    `closeSources`, and again inside the exclusive `.lock` hold before `.closing`/`pack`/rename —
    a live capture holds a shared lock on `.lock` while completing, so once the exclusive hold
    lands, every pair found there is abandoned by definition; the second probe closes the window
    between the first probe and the hold. This covers the already-`merged` leaf path
    (`phase <slug> <anything>` calls `completeOwner` first) and the commit path.
- D6 — Skill text (criterion 6): the recovery rule goes beside the existing "incomplete evidence"
  stop-run material in `skills/check-issue/SKILL.md` under `## check.review` and `## check.repair`,
  and in `skills/implement-issue/SKILL.md` under `## implement` and `## check.fix`. Wording: after a
  run-check printed no `check <label>:` line, the seat recovers before any rerun or move: it reads
  the pair, runs the leaf grant's own discovery, cleanup and authenticated absence read for that
  run (not only the IDs the pair printed), writes a non-blank `cleared-<run>.md` beside the pair
  stating what it found, cleaned and read, and moves the leaf to `failed` with that reason when it
  cannot. A later green run clears nothing. Same rule text in all four sections, adjusted only to
  name the section's artifact (`review-<slot>.md` / `implementation/report.md`).
- D7 — Criterion 7 absence: `learnings/history/2026-10-28-killed-run-fixture-leak.md` is absent on
  the leaf's base (`git show 3e49c3d:learnings/history/2026-10-28-killed-run-fixture-leak.md` fails;
  `learnings/LESSONS.md` holds no line naming it). Per the criterion the implementation records the
  absence in `implementation/report.md` and changes no lesson file. Documented so implement does not
  hunt for it.
- D8 — Docs updates (one line each, the checklist names them): `docs/reference/checks.md`,
  `docs/reference/commands.md`, `docs/reference/files.md`, `src/AREA.md`, `tests/AREA.md` gain the
  capture liveness lock, the abandoned-pair refusal and `cleared-<run>.md`. No new doc file.

## Read-first paths

- `src/run-check.ts` — `checkedRun` (capture creation at the `capture <name>:` line, `refusePublish`,
  unlink site), `spawnLogged`, `withAdmission` nested vs real-unit branches.
- `src/phase.ts` — `moveGuards`, `transition` (failed branch, `checkOnly`, `recorded` save,
  `commitMove`), `refuseEnclosingCompletion`, `completeOwner`, `ownerCompletion`.
- `src/flock.ts` — `flockHold` (per-description lock helper the probe deliberately does not reuse:
  its helper process owns a separate description — F13 startup gap).
- `src/pack.ts` — `captureAncestry`, `enclosingCapture`, `packFolderLocked` (`*.log` only).
- `src/evidence.ts` — `locate`/`readMember` (`akrogon log` reads capture names unchanged).
- `src/routing.ts` — `failed` recovery list: `plan.synthesis`, `implement`, `check.review`,
  `check.repair`, `check.fix`, `merge`.
- `tests/durable-capture.test.ts` — the SIGKILL fixture and `spawnCheck`, `captures`, `blocking`,
  `waitFor`, `mergingLeaf` helpers to mirror.
- `tests/run-units.test.ts` — `spawnReal`, `realFixture`, `testSlice`, `sysctl`, `waitActive`/`waitInactive`,
  `fixtureUnits`, `killTree` usage under real `systemd-run` with `AKROGON_RUN_SLICE`.
- `tests/helpers.ts` — `fixture`, `cli`, `leaf`, `fakeHerdr`, `leafTempRoot`, `yaml`.
- `tests/fake-systemd-run.sh` — the seam that runs `systemd-run --scope` payloads in place.
- `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`,
  `src/AREA.md`, `tests/AREA.md` — the capture, lock and phase documentation to update.
- `learnings/LESSONS.md` + `learnings/history/` — confirms the criterion-7 file's absence.

## Needed interfaces

- `abandonedCaptures(folder: string): { out: string; err: string; cleared: string }[]` exported from
  `src/run-check.ts`; `src/phase.ts` imports it. No new module.
- `spawnLogged(argv, cwd, env, capture: { out: string; outFd: number; err: string })`.
- `Bun.spawn` `stdout: <fd>` and `Bun.spawnSync` inherited `stdio` fd pass — verified by the leaf's
  recorded proof (bun 1.4.4, util-linux 2.42.4) and the running `flockHold` helper's `Bun.spawn`
  usage.
- `flock -s <fd>` one-shot (wrapper lock) and `flock -n -x <fd>` (probe), both fd-mode.

## Waves

| Unit | Paths owned | Shared test resource | Depends on |
|---|---|---|---|
| U1 | `src/run-check.ts` (`checkedRun`, `spawnLogged`, `abandonedCaptures`) | none | none |
| U2 | `src/phase.ts` (`moveGuards`, `refuseEnclosingCompletion`, `completeOwner`) | none | U1 (imports `abandonedCaptures`) |
| U3 | `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md` | none | none |
| U4 | `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`, `src/AREA.md`, `tests/AREA.md` | none | none |

Wave 1: U1, U3, U4. Wave 2: U2. `tests/abandoned-capture.test.ts` is written and committed by A in
this pass, before any product code, so it is not a unit.

Doc checklist: `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/files.md`,
`src/AREA.md`, `tests/AREA.md`. No other doc is affected.

## Criterion proofs

All proofs run under the repo's `test` check (`bun test`); no model or outside call, no grant.
Size: minutes each (real-systemd cases reuse the shared `realFixture`). Rerun trigger: any change to
`src/run-check.ts`, `src/phase.ts` or `tests/abandoned-capture.test.ts` reruns that file.

New file `tests/abandoned-capture.test.ts`, three tests:

- T1 `an abandoned capture pair refuses non-failed moves, clears, and stays clear` (fake
  systemd-run fixture, `spawnCheck`): blocking run-check on leaf `abandoned`, SIGKILL the wrapper,
  kill the orphaned command (fake `systemd-run` leaves it), assert the pair files persist with the
  markers. Then: `phase abandoned check.review --check` exits non-zero, stderr names the out path,
  the err path and `cleared-<run>.md`; `phase abandoned check.review --slot A` (single-slot
  completion) refuses the same way; `state.yaml` bytes and `issues/log.jsonl` unchanged across both
  refusals; `phase abandoned failed --reason 'x'` exits 0; `phase abandoned implement` (operator
  recovery, no `--slot`) exits 0. Then a second leaf `abandoned-2` holds a planted pair so the
  refusal names each pair. Then: a fresh pair, `cleared-<run>.md` with `' '` still refuses;
  `cleared-<run>.md` with `'cleared'` passes the pair gate (`phase ... --check` fails only at the
  next gate, never at the pair message); capture names and bytes unchanged through it all;
  `akrogon log <out>` prints the marker bytes. Proof of criteria 1, 3 and 5's "no move refused for a
  completed run" tail, plus criterion 1's `failed` and recovery clauses.
- T2 `a live capture pair never refuses a move` (fake fixture): while the blocking command runs,
  `phase <leaf> <next> --check` is not refused by the pair. SIGKILL the wrapper with the command
  still alive: the pair is still live by the fd share, so `--check` still passes the pair gate —
  this is the deliberate-break case for criterion 2 (drop the stdout fd share and the surviving
  orphan's pair turns abandoned, flipping the test red). Nested case: run `akrogon run-check` inside
  the blocking command on a second leaf, then SIGKILL the inner wrapper while the inner command
  lives: the inner leaf's `--check` passes its pair gate. Covers criterion 2's live-command,
  surviving-holder and nested clauses.
- T3 `the liveness probe never creates a file and a vanished pair is finished`: plant a `-err.log`
  only (publication's mid-unlink state): `phase --check` exits 0 and no `-out.log` appears. Plant a
  `capture-...-out.log` dangling symlink: same assertion — the probe's create-free open yields
  ENOENT and skips, leaving nothing behind. Deliberate breaks for criterion 4: a probe that opens
  with create leaves the created file (fails the "no file" assertion); a probe that skips the
  ENOENT revalidation refuses (fails the exit-0 assertion). Proof of criterion 4; criterion 5's
  normal-completion absence of refusal is covered by T1's post-recovery re-run plus the existing
  `durable-capture` normal-exit test, which already asserts `captures(impl)` is empty.

Criterion 6 has no mechanical test (standing design): `git diff` of the two SKILL.md files shows the
rule text in the four named sections; review judges wording.

Criterion 7 is decided by D7: absence recorded, no lesson file changes.

### Condition trace (checked conditions → cases or reasons)

- C1 "refuses while abandoned pair without non-blank cleared file; names each pair and the clear
  step; `state.yaml` and history unchanged; `failed` and recovery open" → D4+D5. Cases in T1:
  refusal on `--check` and single-slot, both-pairs named (T1 plants a second leaf pair), state and
  log unchanged, `failed` then recovery exits 0. Red at planning: the base holds no gate, so the
  refusal assertions fail on base (missing behavior is the violation); recorded below.
- C1's owner-completion clause (F8) → D5's `commitMove`/`completeOwner` probes. Traced: the only
  side-effect paths are the two probe sites, both before `saveState`/`closeSources`/`.closing`;
  no other non-failed move commits state. A seat-visible merged-completion case is not in the
  criterion's reachable forms (a `merged` move requires the batch record path), so it is covered
  by tracing the two call sites, not a CLI case.
- C2 "live pair never refuses" → D1+D2. Cases in T2: command-alive, wrapper-dead/descendant-alive,
  nested. Deliberate break (implementation, not planning — the gate and fd share do not exist on
  base): `spawnLogged` reverting to `Bun.file(capture.out)` or `checkedRun` skipping the fd share
  flips the post-SIGKILL `--check` to refused, turning T2 red. The "surviving wrapper publishes
  after its command ends" clause is traced: the wrapper's own fd holds the lock until after both
  unlinks (D1 `finally`), so a probe during publication sees either live (fd held) or finished
  (ENOENT/err-only, skipped).
- C3 "non-blank cleared passes; blank refuses; names and bytes kept; `akrogon log` reads" → D3's
  cleared-file check and D1's unchanged names. Cases in T1: whitespace refuses, non-blank passes the
  pair gate, bytes compared before/after, `akrogon log` prints them.
- C4 "probe never creates; vanished pair finished" → D3. Cases in T3. Deliberate breaks (same
  reasoning as C2's): `openSync(path, 'a')` or `openSync(path, 'w')` leaves a file; skipping the
  ENOENT catch refuses the vanished pair.
- C5 "normal completion leaves no pair, no refusal" → unchanged publication plus the new `finally`.
  Existing `durable-capture` normal-exit test proves the unlinks; T1's post-recovery run proves no
  refusal for it.
- C6's recover-then-rerun ordering → D6 skill text, review-judged.
- C7's when-absent branch → D7, recorded in `implementation/report.md` at implement.

### Red-at-planning evidence

`akrogon run-check --name abandon-tests -- sh -c 'bun test tests/abandoned-capture.test.ts --timeout=30000'`
→ `check abandon-tests: 1 .../check-abandon-tests-1793194131307-2045472.log`

- Criterion 1 red (missing gate on base): T1 fails at the first refusal assertion —
  `expect(0).not.toBe(0)` at `expectPairRefusal`, because `phase abandoned check.review --check`
  exits 0 on base over an abandoned pair:
  ```
  error: expect(received).not.toBe(expected)
  Expected: not 0
        at expectPairRefusal (tests/abandoned-capture.test.ts:58:27)
        at <anonymous> (tests/abandoned-capture.test.ts:132:5)
  (fail) an abandoned capture pair refuses non-failed moves, and a non-blank cleared-<run>.md clears it
  ```
- Criteria 2 and 4 pass on base by design (no gate exists): `(pass) a live capture pair never
  refuses a move, nested run-check included` and `(pass) the liveness probe creates no file and a
  pair gone at probe time is finished`. Their proof of catching power is the deliberate break
  recorded by implementation per standing design (drop the stdout fd share → T2's post-SIGKILL
  `--check` turns refused; probe opens with create or drops the ENOENT skip → T3 turns red).
- The temporary-edit red rule's application here: T1's violation already exists on base (no gate),
  so its red needs no edit; T2/T3's violation edits cannot exist before the code they break does,
  so their breaks land with implementation per the design's (A,B) marks.
- Criterion-1 first-run log was also captured red before a test-fix pass:
  `check abandon-tests: 1 .../check-abandon-tests-1793194070486-1930330.log` (test bugs: missing
  `impl` mkdir, env PATH losing `unitbin`, orphan-drain loop).

## Open limitation

- The publish-time residual an earlier design line named is now closed by D1's fd-kept-until-unlink;
  the residual that remains is a pair abandoned between `completeOwner`'s first probe and its
  exclusive `.lock` hold, covered by the second probe inside the hold. A pair abandoned during the
  `.closing`→pack→rename window itself cannot be refused after `.closing` lands; that window is a
  filesystem rename of already-packed bytes, not a seat move.

## Note for review

No brief/design conflict found; the design's three "Open for the plan" items resolve to D4 (paths
that reach `moveGuards`), D5 (F8 recheck sites) and D7 (lesson file absent). The fd-passed stdout
keeps byte order because `spawnLogged` still reads through `outRead`/`errRead` and writes the
captured streams in the same order, so `tests/durable-capture.test.ts` assertions are unaffected.

## Implementation notes

- 2026-10-28: Publish capture-out at its discoverable name only after its shared lock is held, and revalidate the capture path after the exclusive probe, as design Q2 requires no creation-to-unlink gap and treats a pair gone at probe time as finished (review-A F1, review-B F1).
