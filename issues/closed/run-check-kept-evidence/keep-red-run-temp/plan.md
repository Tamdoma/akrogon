# Plan: keep-red-run-temp

Slot A, plan.synthesis. Brief and design agree; no conflict recorded.

## Read first

- `brief.md`, `design.md` in this leaf folder (locked: marker is an empty `.akrogon-kept` file at the run root; keep is decided only on a nonzero completed exit; reconcile skips marked roots silently; lifetime is the leaf temp release / holder idle sweep; silent, no new output).
- `src/run-check.ts` — `checkedRun`: `refused` flag, `refusePublish` (writes `refusal.json`, removes `.owner`), the successful return block (`kept` log write, `check_end` timing, `unlinkSync` captures), and the outer `finally` (`if (!refused) rmSync(runRoot)`).
- `src/reconcile.ts` — `ownerKeeps` (run-*/batch-* `.owner` liveness, recursed from `dropChecked`/`dropPath`) and the scratch-root run-root loop (refusal.json → missing `.owner` → dead/live owner).
- `tests/run-check.test.ts`, `tests/verify.test.ts`, `tests/reconcile.test.ts` and `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `leafTempRoot`, `scratchFor`, `keptReport`, `dispatchFixture`/`hcFixture`, `fakeSystemctl`).
- `docs/reference/checks.md` (private-`TMPDIR` sentence) and `src/AREA.md` (run-check and reconcile lines).
- `learnings/history/2026-11-15-run-check-tmpdir-drops-kept-evidence.md` and `learnings/history/2026-10-22-run-check-tmpdir-cross-device.md` — both stay per the design's Retire reading (a killed wrapper and the holder idle sweep still lose evidence).

## Decisions

- D1. `checkedRun` keep decision (design verbatim): at the successful return of the inner block — after the late `ownerRefusal` check and the `check_end` timing row — set a `keepRunRoot` local when `result.code !== 0`, as the last statement before `return`. The outer `finally` keeps today's `if (!refused)` gate: inside it, when `keepRunRoot` holds and `existsSync(runRoot)`, write an empty `.akrogon-kept` in the run root and skip `rmSync(runRoot)`; otherwise `rmSync(runRoot, { recursive: true, force: true })` as today. A late refusal throws before the flag is set (`refused = true` also bypasses the gate), a thrown error never reaches the flag, a zero exit never sets it, and a child that deleted `$TMPDIR` makes `existsSync` false so no marker is written and no root remains. `.owner` stays as written.
- D2. `reconcile` scratch run-root loop: after the `refusal.json` check and before the `.owner` read, `existsSync(resolve(runRoot, '.akrogon-kept'))` → `continue` with no `keep` and no `drop`. A marked root then leaves `kept.length === keptBefore`, so the leaf temp's existing release (`dropChecked(dir)` once the tab is gone, slice idle) removes it with the dir; the `ownTemps` (`checkout`/`self-update`) dirs fall to the existing `dropUnowned` idle sweep.
- D3. `ownerKeeps`: for a directory named `run-*` holding `.akrogon-kept`, return `[]` before computing/reading its `.owner` file and do not recurse into it. Checked before the owner-file branch so a live stale `.owner` never pins a leaf temp release.
- D4. `verify` inherits with no parameter: its three `checkedRun` call sites (setup, serial members, parallel members) get the rule unchanged.
- D5. Silent (design 5): no new stderr, status or leftovers output. `src/status.ts` and `src/leftovers.ts` read kept entries only — untouched.
- D6. Docs (criterion 6): `docs/reference/checks.md` private-`TMPDIR` sentence gains that a red run's `TMPDIR` is kept until the leaf temp is released, a `--holder` run's until the idle sweep; `src/AREA.md` run-check and reconcile lines state the same lifetimes.
- D7. Test deltas in the same commit before product code:
  - Retitle and retarget `run-check TMPDIR is a fresh run root under the leaf temp dir and is removed on success and failure` → `…and is removed on success` (drop the failure half; the design names this the false expectation, removed with its reason).
  - New `a red run-check run keeps its run root marked .akrogon-kept and its files readable` (criterion 1 red half).
  - Extend `run-check never recreates an owner moved between the existence check and lock acquisition` with `.akrogon-kept` absence beside `refusal.json` (criterion 1 refusal half; `Test-Change` trailer).
  - New `a red run-check command that deleted its own TMPDIR keeps its exit and leaves no run root` (criterion 5 run-check half).
  - Retitle and retarget `verify removes each command TMPDIR on success and failure` → `verify keeps a red command TMPDIR marked .akrogon-kept and removes a green command TMPDIR`, adding a third `gone` check (`rm -rf "$TMPDIR"; exit 5`) covering criterion 2 and the verify half of criterion 5 (`Test-Change` trailer).
  - New `a marked run root stays silently while its leaf lives and goes with the leaf temp release` in `tests/reconcile.test.ts` (criterion 3, dead and live `.owner` marked roots, kept-report/`status`/`leftovers` silence, release removes all).
  - Extend `run root with a dead owner pid is removed, live owner kept` with the `run in progress` reason assertion (criterion 4's reported wording; `Test-Change` trailer).
- D8. Held disagreements: C's four dissents (non-empty-only keep, verify opt-out, 60-minute holder window, chmod guard) stay unanswered; the locked decisions stand, rewording lessons is `/learn-issues` work after landing.

## Interfaces

- Marker: empty file `.akrogon-kept` directly inside the run root (the dir `checkedRun` gave the command as `TMPDIR`).
- Consumers of marked roots: reconcile scratch run-root loop (skip), `ownerKeeps` (`[]`, no recursion), leaf temp release / `dropUnowned` (remove with the dir), `status`/`leftovers` (no entry — unchanged readers).
- No signature changes; `checkedRun` callers unchanged.

## Units — serial-solo

The product diff is two guarded hunks (`src/run-check.ts` finally + flag, `src/reconcile.ts` two marker checks) plus doc lines. Decomposing further would split one rule across artificial units with no independence; A implements serially.

### U1 — src and docs

- Owns: `src/run-check.ts` (D1), `src/reconcile.ts` (D2, D3), `docs/reference/checks.md` (D6), `src/AREA.md` (D6).
- Depends on: the test commit below.

## File/criterion checklist

Affected agent and human docs, one line each:

- `docs/reference/checks.md` — private-`TMPDIR` sentence: red run's TMPDIR kept until leaf temp release, `--holder` run's until idle sweep.
- `src/AREA.md` — run-check and reconcile lines: same lifetimes.
- `skills/*/SKILL.md` `$TMPDIR` guidance — unaffected (advice still holds; lifetime statement lives in checks.md).
- `docs/reference/config.md` `TMPDIR` mention — unaffected (env-name refusal list unchanged).

## Criteria → proofs

All proofs run the real CLI/product boundary in fixture isolation via `bun test`, each invoked as `akrogon run-check --name <label> -- bun test --timeout=30000 <file> -t '<pattern>'` from this worktree. Size: seconds each. Rerun trigger: any diff touching `src/run-check.ts`, `src/reconcile.ts`, or the owning test file; C6's grep reruns whenever the doc files change.

### C1 — run-check red keeps TMPDIR + `.akrogon-kept`; green leaves none; refused keeps root with `refusal.json` and no marker

- Observation: `run-check` exits with the child's code; on red the printed `$TMPDIR` path still exists holding `.akrogon-kept`, `.owner` and the file the child wrote; on green no `run-*` root remains; a publish-refused run root holds `refusal.json` and no `.akrogon-kept`.
- Boundary: `akrogon run-check -- <sh -c ...>` spawned through `cli()` against a leaf worktree fixture; real run root under `leafTempRoot(f)`.
- Tests: `a red run-check run keeps its run root marked .akrogon-kept and its files readable` (red half: `printf %s "$TMPDIR"` + evidence file + `exit 7`, then `existsSync` marker/`.owner`/file reads); `…removed on success` (green half, retained); refusal assertion added to `run-check never recreates an owner moved…` (`Test-Change`).
- Failure caught: the #145 regression — evidence printed by the child under `$TMPDIR` is gone before anyone reads it.
- Checked conditions: (a) nonzero marks — T-red on base (marker absent); (b) zero exit never marks and removes — violation sim Edit B (flag on `=== 0`, guarded marker, skip rm) makes the green half red; (c) refusal never marks — violation sim Edit A (unconditional marker write before `rmSync`) leaves `.akrogon-kept` beside `refusal.json`, making the new refusal assertion red.
- Red records: appended below after the runs.

### C2 — verify red keeps TMPDIR; green removes

- Observation: `akrogon verify` on a fixture with `ok`/`bad` checks; the `bad` command's recorded log holds the TMPDIR path that still exists with `.akrogon-kept`, `.owner` and its `command-temp`; the `ok` command's TMPDIR is gone.
- Boundary: `cli(f, ['verify'], worktree)` — real verify pass, three `checkedRun` sites covered by the serial `bad` member.
- Test: `verify keeps a red command TMPDIR marked .akrogon-kept and removes a green command TMPDIR` (`Test-Change` retitle/retarget of `verify removes each command TMPDIR on success and failure`; the red half fails on base, green half stays).
- Failure caught: same loss class through the verify path, e.g. a red merge or leaf check deleting the evidence dir.
- Checked conditions: nonzero marks / zero removes — T-red on base via the `bad` path assertion; the green half stays green only under the correct condition (Edit B also covers this seam since verify shares `checkedRun`).

### C3 — reconcile leaves marked roots silently, releases them with the leaf temp, live `.owner` yields no entry and no block

- Observation: a leaf temp holding a dead-owner marked root and a live-owner marked root: after a reconcile pass both still exist, `kept` report has no entry for either, `status <slug>` and `akrogon leftovers` name neither; after the tab closes, the next pass removes the whole leaf temp including both roots.
- Boundary: `dispatchFixture` + `next --all` driving real `reconcile` against a fake-hc leaf; roots built with `mkdtempSync` + hand-written `.owner`/`.akrogon-kept` — the same shape `checkedRun` leaves.
- Test: `a marked run root stays silently while its leaf lives and goes with the leaf temp release`.
- Failure caught: silent evidence loss on the next reconcile pass (dead-owner sweep) or a report lie claiming a kept leftover.
- Checked conditions: (a) marker skipped before `.owner` read in the run-root loop — red on base (dead `.owner` drops the marked root today; live `.owner` reports `run in progress` today); (b) `ownerKeeps` marker check before `.owner`, no recursion — red on base (live `.owner` inside the released temp returns `live owner inside` and blocks `dropChecked` today). Standing design names dropping the marker check in `ownerKeeps` as the deliberate break; base already embodies it.
- Red record: appended below.

### C4 — unmarked dead-owner root removed; unmarked live-owner kept as `run in progress`

- Existing test `run root with a dead owner pid is removed, live owner kept` proves both halves; adding a `run in progress` reason assertion (`Test-Change`) pins the reported wording the criterion names.
- Condition check: no leaf decision can reachably break this — D2/D3 only add a skip for marked roots before existing logic, and an unmarked root never holds `.akrogon-kept`. Traced, no violation case owed. Green on base by the existing test.

### C5 — red command that deleted `$TMPDIR` keeps its exit code and leaves no run root

- Observation: run-check exits 7 with no `run-*` root left; verify records `gone` exit 5 and no second root.
- Tests: `a red run-check command that deleted its own TMPDIR keeps its exit and leaves no run root` (new); the `gone` member of the retitled verify test (`Test-Change`). Both are green on base today (exit code and empty root already hold) — the kept-property they guard is D1's `existsSync` guard.
- Checked condition: marker write must not run when the root is gone — violation sim Edit A (unconditional `writeFileSync` marker) throws ENOENT and turns both halves red.
- Red records: appended below.

### C6 — doc lines state the new lifetimes

- Observation: `docs/reference/checks.md` and `src/AREA.md` name `.akrogon-kept` lifetime (red run's TMPDIR until leaf temp release; `--holder` run's until idle sweep).
- Proof: `grep -n 'akrogon-kept\|TMPDIR' docs/reference/checks.md src/AREA.md` read by the reviewing seat — red on base (term absent). Size seconds.

## Grants, env, count lines

`readiness.yaml` carries no `grants`, `produces` or `inputs`; `akrogon status keep-red-run-temp` shows no `Missing:` lines and `env_names` is empty. No paid or live operation is planned; every launch is a free local `bun test` under `akrogon run-check` kept logs, so no count lines are owed.

## Red records

All runs from this worktree, `akrogon run-check --name <label> -- bun test --timeout=30000 <file> -t '<pattern>'`; logs under `implementation/`.

- C1 red half — `c1-red-keep`: **red on base**, `.akrogon-kept` absent (`Expected: true / Received: false` at run-check.test.ts:296). `check c1-red-keep: 1 implementation/check-c1-red-keep-1795173984187-3779326.log`
- C1 green half — `c1-green-removed`: pass on base. `check c1-green-removed: 0 implementation/check-c1-green-removed-1795173986666-3779810.log`
- C1 refused half — `c1-refused`: pass on base (no marker exists yet); under Edit A the new `.akrogon-kept`-absence assertion is red (`Expected: false / Received: true` at run-check.test.ts:154). `check c1-refused: 0 implementation/check-c1-refused-1795173988281-3780070.log`; violation `check c1-refused-viol: 1 implementation/check-c1-refused-viol-1795174006414-3782260.log`
- C5 run-check half — `c5-gone`: pass on base; under Edit A red (`Expected: 7 / Received: 1`, ENOENT from the unguarded marker write). `check c5-gone: 0 implementation/check-c5-gone-1795173989873-3780219.log`; violation `check c5-gone-viol: 1 implementation/check-c5-gone-viol-1795174008352-3782398.log`
- C1/C2 zero-exit condition — `c1-green-viol` and `c2-verify-viol` under Edit B both red (`existsSync` expected false, received true: green root kept). `check c1-green-viol: 1 implementation/check-c1-green-viol-1795174015418-3782874.log`; `check c2-verify-viol: 1 implementation/check-c2-verify-viol-1795174018690-3783128.log`
- C2 — `c2-verify-tmpdir`: **red on base**, `.akrogon-kept` absent (`Expected: true / Received: false` at verify.test.ts:447); `gone` exit 5 recorded before the failure point. `check c2-verify-tmpdir: 1 implementation/check-c2-verify-tmpdir-1795173992414-3780497.log`
- C3 — `c3-marked-root`: **red on base**, dead-owner marked root dropped on the first pass (`Expected: true / Received: false` at reconcile.test.ts:318). `check c3-marked-root: 1 implementation/check-c3-marked-root-1795173996990-3780915.log`
- C4 — `c4-dead-owner`: pass on base including the `run in progress` reason. `check c4-dead-owner: 0 implementation/check-c4-dead-owner-1795174001959-3781610.log`
- C6 — `grep -n 'akrogon-kept\|TMPDIR' docs/reference/checks.md src/AREA.md`: `.akrogon-kept` absent on base (exit 1); red until U1's doc lines land.

Tests committed on the leaf branch (fc4ea833) before any product code; both violation edits reverted (`git status` shows only the test commit, src clean).

## Deliberate-break (violation) edits used at planning

- Edit A: `writeFileSync(join(runRoot, '.akrogon-kept'), '')` unconditionally at the top of the outer `finally`, before the `rmSync` — simulates marking refused runs and marking a deleted root. Reverted.
- Edit B: implement D1 with the flag set on `result.code === 0` — simulates marking green runs. Reverted.
