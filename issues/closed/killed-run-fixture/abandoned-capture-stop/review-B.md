# Review B: abandoned-capture-stop

Date: 2026-10-28
Base: `3e49c3d5ddc7a178a9c5ff448015e525b85fb345`
Reviewed head: `84520e23c98341e0ea8d6867a71c4030ca6934bd`
Verdict: **fix**

Reviewed the whole initial diff against brief, design, plan and implementation report. No peer review was read. No code was changed or committed.

## Fixes

### F1: The probe reports normally published captures as abandoned

Location: `src/run-check.ts:120-130`, consumed directly by `src/phase.ts:150-156` and `moveGuards`.

Real source: ordinary `akrogon run-check --leaf <fixture-leaf> --name normal-<n> -- true` invocations publishing normally while another caller probes that leaf. No capture was planted, no process was killed, and product code was unchanged in these diagnostics.

The probe can open capture-out while the writer still holds it, then run its flock helper after the writer has unlinked both captures and closed its fd. The exclusive lock succeeds on the now-unlinked inode. Line 130 adds the paths without revalidating that the pair still exists. The scan also accepts an out-only file during the startup interval before the shared lock and err file are established.

Consequence today: `moveGuards` throws a cleanup refusal for a successful normal run, including paths which have already vanished. A concurrent phase move can therefore require recovery for a nonexistent abandoned pair. This violates criterion 4's vanished-pair outcome and criterion 5's no-refusal outcome. The startup form also contradicts the pair-only contract.

Evidence, each read back with `akrogon log`:

- `check review-natural-race: 0 implementation/check-review-natural-race-1793195712126-3902865.log`. Ran 80 real fixture CLI run-checks in batches of four while polling the actual `abandonedCaptures` function. It returned 36 false abandoned entries. For 31, both paths were already absent immediately after return. Every returned entry lacked its err file.
- `check review-gate-race: 1 implementation/check-review-gate-race-1793195800401-3913612.log`. Repeated the source with 40 normal CLI run-checks and called the actual `moveGuards(repo, leaf, state, 'check.review')` boundary instead of just the probe. All 40 commands exited zero. The phase guard falsely refused 15 times across 92,064 calls. The diagnostic exits 1 when any such refusal occurs.
- A separate full CLI scheduling sample, `check review-phase-race: 0 implementation/check-review-phase-race-1793195744221-3907288.log`, ran 120 normal run-checks against 41 concurrent `phase --check` calls and did not hit the race. This does not replace the observed guard failure above.

Reproduction shape: use existing `fixture`, `leaf`, `cli` helpers, run ten sequential batches of four concurrent normal `run-check ... -- true` calls, and in a concurrent async loop call `moveGuards` on that same fixture leaf followed by `Bun.sleep(0)`. Count only the abandoned-pair refusal and require zero. The temporary diagnostic scripts and fixtures were removed after completion. No external resources were used.

Required repair: classify an abandoned pair only after a successful lock probe confirms the pair still exists. Cover normal publication after open but before the flock result, rather than only ENOENT at open. The existing T3 dangling-symlink case exercises the earlier open failure and stays green on this defect.

### F2: The required real-systemd capture-gate proofs are missing

Locations: `tests/abandoned-capture.test.ts:11-24`, design's standing-design interpretation, and report's C1/C2 proof claims.

Criteria 1 and 2 name wrapper death, command termination and surviving stdout holders. The design explicitly requires the non-nested cases to use existing `tests/run-units.test.ts` `spawnReal` / `realFixture`, because the fake-systemd fixture cannot establish inheritance through real `runUnitArgv` or the real guard's stop.

All new tests use `spawnCheck` with `<fixture-home>/unitbin` ahead of real systemd on PATH. That directory supplies `tests/fake-systemd-run.sh`, which execs the scope payload and returns success without starting a guard service. No real-systemd capture-gate case was added. Existing run-units SIGKILL tests prove unit/descendant reaping but never assert capture liveness or the phase refusal after drain.

Consequence today: the report declares C1/C2 proven and no unverified criteria without observing the explicitly required production boundary. Real fd inheritance, the surviving-holder interval, and the abandoned-pair gate after the real guard drains are unproven. This is a material verification gap against criteria 1/2 and the binding design, not a request for extra coverage.

Required repair: add the missing non-nested C1/C2 cases using the existing real-systemd runner and helpers, record current results, and correct the proof mapping. This needs cases on existing machinery, not a new runner. Under the repair split, the missing-case portion belongs to A.

Trace: `check review-test-detail: 0 implementation/check-review-test-detail-1793195616187-3892414.log`, `check review-recovery-docs: 0 implementation/check-review-recovery-docs-1793195633620-3900239.log`, and `check review-proof-locations: 128 implementation/check-review-proof-locations-1793195651898-3901223.log`. The last command's 128 is the expected `git cat-file -e` absence result for criterion 7, not a failed test.

## Verification and contract checks

- Existing configured verification is green on tree `913649f4a3f365ce03ada3c3e18ea39086a224c8`, shared by reviewed head and `a3e303f6`. HEAD is an empty trailer-only commit, so the receipt remains current. Receipt `e882225a-e6ee-495a-8805-07362046417e` records setup 0, format 0, test 0, typecheck 0, completed 2026-10-28T13:52:17.743Z. Inspected with `check review-receipt: 0 implementation/check-review-receipt-1793195800513-3915553.log` and `check review-boundary-signatures: 0 implementation/check-review-boundary-signatures-1793195775460-3913294.log`.
- Read back configured logs: `implementation/check-format-1793195469240-3575993.log` (Prettier green), `implementation/check-test-1793195535360-3575993.log` (1231 pass, 0 fail), `implementation/check-typecheck-1793195537743-3575993.log` (tsc green). Commands match configured runner semantics. No planned test, runner configuration, helper or fixture was disabled or filtered in the final proof.
- Read back `check abandon-final: 0 implementation/check-abandon-final-1793195465169-3572684.log`: all three planned tests plus durable-capture pass. This run and full verification postdate the latest test/helper changes.
- Read back planning red `check abandon-tests: 1 implementation/check-abandon-tests-1793194131307-2045472.log`: C1 fails because the base accepts the abandoned pair. Read back deliberate breaks `check break-fdshare: 1 implementation/check-break-fdshare-1793195447792-3567946.log` (nested surviving stdout holder refused) and `check break-probe: 1 implementation/check-break-probe-1793195452316-3569967.log` (create-mode probe recreates the vanished target). Both have later green proof. They do not cover F1 or F2.
- C3's non-blank clear, blank refusal, preserved names/bytes and log read are covered by T1. C5's normal exit 0/3 unlink cases pass, but omit F1's concurrent publication interval.
- C6: reviewed all four changed skill sections. Each requires discovery, cleanup and authenticated absence read before rerun/move, non-blank clear evidence, failed when recovery is impossible, and says a later green run clears nothing.
- C7: the named history file is absent on base, as confirmed by `git cat-file -e`. The report records absence and the diff changes no lesson file. `learnings/LESSONS.md` was not used as review input.
- Followed `docs/reference-index.md` to the changed checks, commands and files pages and their source links. Their new behavior claims match the intended contract, subject to F1. The phase paths place ordinary refusals before `--check`, slot recording and state save. Failed moves and operator recovery bypass the pair gate. The owner-completion additions were traced against D5.
- Listed paths from each changed AREA file from the repository root in one command. All named source/test/doc paths exist. Trace: `check review-area-paths: 0 implementation/check-review-area-paths-1793195677920-3902269.log`, read back with `akrogon log`.
- Worktree stayed clean and reviewed head stayed unchanged. No full suite rerun was needed because current green evidence existed. The new red diagnostic is caused by the leaf's new probe, so unrelated-red retry/known-red rules do not apply.

All relative log paths above are under this leaf folder and were read with `akrogon log`.

## Test-Change trailers

Listed from `3e49c3d5ddc7a178a9c5ff448015e525b85fb345..HEAD` using `git log --format="%H%n%B"`, kept in `check review-context: 0 implementation/check-review-context-1793195600573-3891586.log`:

- `a3e303f62a5937d2d68aa491fffae0556ca625c0`: `Test-Change: tests/abandoned-capture.test.ts strengthen criterion-3 proof to assert cleared pairs keep names and bytes after the gate passes (the same brief criterion, same test)`.
- `84520e23c98341e0ea8d6867a71c4030ca6934bd`: `Test-Change: tests/AREA.md documentation line naming tests/abandoned-capture.test.ts, part of the leaf's doc unit (plan D8); path-rule matched doc file, no test expectation changed`.

Both citations match their sources. `src/test-files.ts` matches the tests directory, so tests/AREA.md needs its trailer despite being documentation. The new planning test file needs no old-expectation citation. No existing regression assertion was weakened or removed.

## Nits and operator actions

None.

## 2026-10-28 check.repair

Prior reviewed head: `84520e23c98341e0ea8d6867a71c4030ca6934bd`.
Base unchanged: `3e49c3d5ddc7a178a9c5ff448015e525b85fb345`.
Repaired head: `9425fac336eab31b913881bcc083c8094a4b4a70`.
Read both initial reviews. No refresh/rebase occurred in this pass.

### Repaired findings

- **A F1, startup visibility:** test commit `85535e7d56e843eeecd1ec6d11e64feda6af684f` reproduces a normal run-check launch racing a phase check, with the shared-lock helper paused before the real flock syscall. Product commit `342e03c702c102c7fb068c9d982d32ca898c05a6` opens an undiscoverable staging name, acquires the same shared lock, then atomically renames that inode to the printed capture-out path. Commit `9425fac336eab31b913881bcc083c8094a4b4a70` gives staging a hidden `.log` name so the existing log ignore rules also cover it. The finalizer removes staging when the wrapper unwinds. The scanner cannot see an unlocked final capture. A SIGKILL before rename can leave staging, but no checked command has started at that point.
- **B F1, publication race:** test commit `747b0e36d131487afe5f9d7efc259c7f4bfa9be3` pauses the real phase probe after capture-out is opened, allows a normal run-check to publish and unlink both files, then resumes its real flock syscall. Product commit `6026fe9da5f5bc0049f67bfa7f759befde6e66ed` revalidates capture-out's pathname after a successful exclusive probe. An open descriptor to the unlinked inode no longer causes a refusal. B F1's startup observation is covered by A F1's repair above.

Each bug has its own reproduction commit before its own product fix. Both tests use the existing fixture/CLI helpers. Their per-fixture flock shim delays scheduling, then execs the installed flock without faking the lock or its result. Both test commits carry `Test-Change` trailers citing their realistic source. No existing test expectation was changed, and these are the only tests B added.

### Repair evidence

All paths below are relative to this leaf, and cited logs were read back with `akrogon log`.

- `check repair-startup-red: 1 implementation/check-repair-startup-red-1793196029635-3957735.log`: the startup reproduction fails on the reviewed product head, with the phase check returning 1 instead of 0. Command: setup under the install flock, then `bun test tests/abandoned-capture.test.ts --timeout=30000 -t "a starting run-check"`.
- `check repair-startup-green: 0 implementation/check-repair-startup-green-1793196051279-3959839.log`: startup reproduction and the three A-planned cases pass after the startup fix.
- `check repair-publish-red: 1 implementation/check-repair-publish-red-1793196075623-3963396.log`: the publication reproduction fails on product head `342e03c7`, after the startup fix, with the phase check returning 1 after successful normal publication. Command: setup under the install flock, then `bun test tests/abandoned-capture.test.ts --timeout=30000 -t "a capture published after"`.
- `check repair-captures-green: 0 implementation/check-repair-captures-green-1793196100942-3964406.log`: both reproductions, all A-planned cases and durable-capture pass after the publication fix.
- `check repair-format: 1 implementation/check-repair-format-1793196109069-3967039.log`: the added condition needed Prettier wrapping. Corrected before the publication fix commit. The subsequent configured format check on `6026fe9d` passed.
- `check repair-current-proofs: 0 implementation/check-repair-current-proofs-1793196230444-81016.log`: on the final committed head, setup under the install flock followed by `bun test tests/abandoned-capture.test.ts tests/durable-capture.test.ts --timeout=30000` passes all 10 tests. This reruns the planned proofs B did not write after the latest product change and accepts both repairs independently of B's new reproductions. It covers C1/C3/C4/C5 and the existing nested C2 proof. C6/C7 inputs did not change, so their earlier evidence remains valid. F2's real-systemd proof gap remains open.
- `check repair-staging-fix-commit: 0 implementation/check-repair-staging-fix-commit-1793196226387-80911.log`: `git check-ignore --no-index` confirms the hidden staging `.log` is covered by existing rules. No ignore or sync configuration changed.
- `check repair-final-state: 0 implementation/check-repair-final-state-1793196245261-154434.log`: worktree clean, final head recorded, `git diff --check` clean.

The repairs change only `src/run-check.ts` and the two reproduction cases in `tests/abandoned-capture.test.ts`. One dated implementation note was appended to plan.md before product edits, as required for the design's omitted atomic-visibility/revalidation steps. No documented behavior changed beyond restoring the intended contract. No external resources or grants were used. Initial Nits remain deferred. No operator actions are open.

## Handed to A

- **B F2:** criteria 1/2 lack the non-nested real-systemd cases required by design. Use the existing `tests/run-units.test.ts` `spawnReal` / `realFixture`, real guard and fixture-unit cleanup to observe the phase gate while stdout holders live and after wrapper SIGKILL and real guard drain. Update plan/report proof mapping and record current evidence. Exception: missing criterion cases on existing runner/helpers. No new proof machinery or live-action grant is needed.

## check.repair final verification

`akrogon verify` on committed head `9425fac336eab31b913881bcc083c8094a4b4a70` completed green, run `8489e4e4-ffd0-4d2e-b36b-271701fe3169`: setup 0, format 0, test 0 (1233 pass, 0 fail across 71 files), typecheck 0. Read back `implementation/check-format-1793196234944-83276.log`, `implementation/check-test-1793196305210-83276.log` and `implementation/check-typecheck-1793196310273-83276.log` with `akrogon log`. This is the current-head receipt, after the staging-name refinement. The earlier green verification on `6026fe9d` is not substituted for it.

A F1 and B F1 are repaired. B F2 remains handed to A above, so the requested destination is `check.fix`, not merge. No operator action is pending.

## 2026-10-28 check.review after check.fix

Verdict: **fix**. Existing B F2 remains open. A F1 and B F1 remain repaired. No new blocking finding is added.

Prior reviewed base/head: `3e49c3d5ddc7a178a9c5ff448015e525b85fb345` / `84520e23c98341e0ea8d6867a71c4030ca6934bd`.
Previous repair handoff: `9425fac336eab31b913881bcc083c8094a4b4a70`.
Handed-off base/reviewed head: `76a1da503af9d9108334603f06e053cdf5d93fa8` / `5079b06e108eddca6f6b7cc6d62f5c8b89d269cb`.

Computed `git range-diff 3e49c3d5ddc7a178a9c5ff448015e525b85fb345..84520e23c98341e0ea8d6867a71c4030ca6934bd 76a1da503af9d9108334603f06e053cdf5d93fa8..5079b06e108eddca6f6b7cc6d62f5c8b89d269cb` myself. It identifies the docs conflict resolution (`a6c4bc79` replacing `8fdbb5d3`), B's five repair commits, and A's new test commit `5079b06e`. Other original commits are patch-identical. Reviewed those repairs and the conflict resolution, not main's intervening commits. Evidence: `check recheck-range: 0 implementation/check-recheck-range-1793197043724-914257.log`.

### B F2: real-systemd proof remains incomplete

`tests/run-units.test.ts:440-468` waits for capture-out, asserts the phase gate before killing the wrapper, then waits for complete cgroup drain before its next gate assertion. It never observes the criterion-2 state where the wrapper is dead and a real command/descendant still holds stdout. Capture-out is also created before the command launches, so waiting for that file does not establish that the real command has started.

The wrapper's own fd makes the pre-kill assertion pass even if the command receives a different, unlocked open description. The post-drain assertion also passes with that bug, because neither description has a live holder by then. The test therefore does not prove the non-nested fd inheritance that the design and original F2 require.

Confirmed with one deliberate break, confined to the non-nested call in `src/run-check.ts`:

```ts
// Original non-nested argument:
{ out: captureOut, outFd: capFd, err: captureErr }
// Temporary violation: command gets a separate, unlocked description:
{ out: captureOut, outFd: openSync(captureOut, 'a'), err: captureErr }
```

After setup under the install flock, ran `bun test tests/run-units.test.ts --timeout=30000 -t "a killed run-check pair"`. Result: `check recheck-nonnested-break: 0 implementation/check-recheck-nonnested-break-1793197088650-955917.log` — **1 pass, 0 fail, 10 assertions**, despite the intentional loss of stdout lock inheritance. The product file was restored byte-for-byte in a Python `finally`. This passing broken-product run is evidence of insufficient catching power, not a green correctness proof.

Consequence: the repair still cannot detect the production-boundary failure F2 identified, and the report's claim that the real seam completes criteria 1/2 is overstated. The report's test-side iteration failures are not red evidence for an intentional product violation. Its claim that eventual real guard drain makes a survivor case impossible does not justify skipping the intermediate live-holder state. This is the same criterion-2 verification gap, not added scope.

Required completion: use the existing real-unit helpers to establish a real stdout holder, SIGKILL its wrapper, observe that holder still alive, and assert that the phase gate remains open before drain. Then retain the existing after-drain refusal/clear checks. Show that loss of non-nested fd inheritance makes this case red, and record a current green run plus the corrected proof mapping. No new runner, grant or product change is required by this finding.

### Earlier fixes and verification

- A F1/B F1 remain fixed: current `src/run-check.ts` and `tests/abandoned-capture.test.ts` have exactly the same blobs as the previous repaired head `9425fac3`. The current full test log includes both race reproductions passing. Evidence: `check recheck-race-fixes: 0 implementation/check-recheck-race-fixes-1793197168347-1038067.log`.
- Current configured verification is green: receipt `03a6ef0f-4217-493d-b7e9-783e9c5f1540`, head `5079b06e`, tree `c75f64f68f759b22e536bd4e456c7d4672feded6`, setup/format/test/typecheck all 0. Full test result is 1242 pass, 0 fail across 72 files. Read back `implementation/check-format-1793196919903-607691.log`, `implementation/check-test-1793196985108-607691.log` and `implementation/check-typecheck-1793196987561-607691.log`. Receipt inspection: `check recheck-receipt: 0 implementation/check-recheck-receipt-1793197108099-986159.log`.
- Read back A's `check gatekill-test7: 0 implementation/check-gatekill-test7-1793196812789-565057.log` and `check run-units-full: 0 implementation/check-run-units-full-1793196838114-565483.log`. These runs and current configured verification postdate the final test change. No required test or runner configuration was disabled or filtered in the final verification. No proof-command substitution was made. The narrow deliberate-break run above does not replace required checks.
- Reviewed the docs conflict resolution against the existing behavior page `docs/reference/checks.md` and the command/files tables. The intended behavior claims remain intact. No additional documented behavior changed in the repair. AREA references all exist: `check recheck-area-paths: 0 implementation/check-recheck-area-paths-1793197107832-985718.log`.
- `check recheck-final-state: 0 implementation/check-recheck-final-state-1793197131262-1018406.log` confirms the temporary mutation is gone, worktree clean and HEAD unchanged. No commits were made during re-check. No external resource or operator action was needed. No new Nit is retained. The configured green run was not repeated because current evidence exists.

### Test-Change trailers on the handed-off range

Read and judged every trailer in `76a1da50..5079b06e`, kept in the range log:

- `d19ccff5`: `tests/abandoned-capture.test.ts`, criterion-3 preservation assertions. Same cited brief outcome as the original reviewed commit.
- `64355e52`: `tests/AREA.md`, plan-D8 documentation citation. Same source as the original reviewed trailer-only commit.
- `342364f6`: `tests/abandoned-capture.test.ts`, A F1's real launch/phase race.
- `5bc73701`: `tests/abandoned-capture.test.ts`, B F1's real publication/probe race.
- `5079b06e`: `tests/run-units.test.ts`, missing non-nested C1/C2 cases from B F2; `tests/AREA.md`, description of that case.

The citations match their changes and the path rule in `src/test-files.ts`. No old expectation was weakened or deleted. The new case's citation is valid, but its criterion-2 proof remains insufficient as described above.

All cited relative paths are under this leaf. Logs were read back using `akrogon log`. Requested next phase: `check.repair` for unresolved B F2.

## 2026-10-28 check.repair following the second review

Base: `76a1da503af9d9108334603f06e053cdf5d93fa8`.
Head unchanged: `5079b06e108eddca6f6b7cc6d62f5c8b89d269cb`.

Read the latest B re-check, brief, design, plan and implementation report. B F2 is the only open Fix. It lacks a criterion-2 case on existing helpers, which check-issue explicitly assigns to A. No product defect requiring a B code repair was found. No code/test/plan changes or commits were made in this pass.

The earlier proof missed the defect because its pre-kill assertion is satisfied by the wrapper's own locked fd, while its next assertion waits until every holder is gone. The existing deliberate-break result remains valid on this unchanged head: `check recheck-nonnested-break: 0 implementation/check-recheck-nonnested-break-1793197088650-955917.log` passed despite removing the non-nested command's shared open description. That log was read back during the re-check and is retained, not rerun.

Searched the existing real-unit phase probes: all are in the gatekill case, before wrapper death or after drain/clear. None observes the missing intermediate state. `spawnReal`, `realFixture`, `waitActive`, `sysctl` and existing test-slice cleanup already provide the runner and lifecycle controls. `src/scope.ts` sets `TimeoutStopSec=5`, so a test child that signals readiness and ignores TERM can retain stdout after wrapper death until the existing guard finishes stopping the scope. This requires a test case on existing machinery, not changes to containment or a new runner.

Evidence: `check repair2-scope: 0 implementation/check-repair2-scope-1793197276493-1068387.log`, read back with `akrogon log`, confirms unchanged clean worktree, current head, the real-unit phase-probe sites and scope timeout. Re-read the behavior page `docs/reference/checks.md`; no documented behavior changed.

No proof input changed, so earlier green criterion proofs remain valid with F2's recorded limitation. Ran `akrogon verify`: it reused green receipt `03a6ef0f-4217-493d-b7e9-783e9c5f1540`, tree `c75f64f68f759b22e536bd4e456c7d4672feded6`. The kept result is setup/format/test/typecheck 0, 1242 passing tests. This does not clear F2. No operator action or new grant is needed.

## Handed to A

- **B F2, criterion 2:** extend the existing `tests/run-units.test.ts` real-unit case using `spawnReal` / `realFixture`. Confirm that the actual command has started, SIGKILL only its wrapper, confirm the stdout holder is still alive, and assert the phase move stays open before real guard drain. Preserve the post-drain refusal and clear assertions. Show the non-nested `outFd: openSync(captureOut, 'a')` deliberate break turns this case red, then restore the product, run it green and update plan/report proof mapping. Exception: missing criterion case on existing runner/helpers. No new test machinery or product change is requested.

No B-repairable Fix or operator action remains. Requested destination: `check.fix`.

## 2026-10-28 check.review: second check.fix accepted

Verdict: **ready**.
Base: `76a1da503af9d9108334603f06e053cdf5d93fa8`.
Prior reviewed head: `5079b06e108eddca6f6b7cc6d62f5c8b89d269cb`.
Reviewed head: `dedbc3812409b47bac579d4cd0112caed05103b2`.

Reviewed only the repair from the prior reviewed head. Independently computed `git range-diff 76a1da503af9d9108334603f06e053cdf5d93fa8..5079b06e108eddca6f6b7cc6d62f5c8b89d269cb 76a1da503af9d9108334603f06e053cdf5d93fa8..dedbc3812409b47bac579d4cd0112caed05103b2`. The existing 13 commits are unchanged and only `dedbc381` is added. The base did not move again. The only changed file is `tests/run-units.test.ts`; no AREA file is changed in this repair. Trace: `check recheck2-range: 0 implementation/check-recheck2-range-1793197794448-1551032.log` and `check recheck2-diff: 0 implementation/check-recheck2-diff-1793197703135-1526926.log`.

### Findings resolved

- **A F1:** startup race remains repaired. Product code is unchanged from the previously accepted repair and its reproduction passes in the current full verification.
- **B F1:** publication race remains repaired. Same product blob as the prior reviewed head; its reproduction passes in current verification.
- **B F2:** resolved by `dedbc381`. The real-systemd payload now ignores TERM and writes a readiness marker from inside the command. The test waits for readiness, SIGKILLs the wrapper and awaits confirmation of its death. It then probes the phase gate with a live cgroup holder before the guard's timeout drains the scope. At least one successful move with a dead wrapper and live holder is required. It subsequently requires the abandoned-pair refusal, names both capture paths and the clear file, and confirms a non-blank clear releases the gate. This covers the missing non-nested criterion-2 state using existing real-unit machinery.

Catching power is now recorded for that exact missing state: `check gatekill-break: 1 implementation/check-gatekill-break-1793197536959-1142720.log` shows the non-nested `outFd: openSync(captureOut, 'a')` violation failing the live-holder assertion (`held` false, 1 failed test). After product restoration, `check gatekill-green: 0 implementation/check-gatekill-green-1793197548455-1157321.log` passes the case with 10 assertions. Both logs were read back with `akrogon log`. These are complete test runs, including fixture cleanup, rather than killed proof commands. The earlier passing-broken-product result is superseded for this revised case.

The pre-existing refusal assertion was replaced by a branch that records only non-zero probes plus an assertion that one was found. The after-drain refusal and clear outcomes remain checked. The fixture's old unconditional `sleep 30` is changed for the criterion-2 outcome and original F2, as the trailer cites. No unrelated expectation was removed, no runner/helper/config was changed, and no planned test was disabled or filtered in final verification.

### Verification

Current-head receipt `b20b6ed2-4132-4824-941d-bde3a37e6945`, tree `2f5b80101aaa2b817787385fd5d4d45db7c2cfb7`, records setup/format/test/typecheck all 0, completed 2026-10-28T14:28:01.043Z. Full test result: **1242 pass, 0 fail across 72 files**. Read back all configured logs:

- `implementation/check-format-1793197586291-1197615.log`.
- `implementation/check-test-1793197677988-1197615.log`, including both capture race reproductions and the revised real-unit case passing.
- `implementation/check-typecheck-1793197681043-1197615.log`.

Receipt trace: `check recheck2-receipt: 0 implementation/check-recheck2-receipt-1793197739555-1544036.log`. This receipt and its full test run postdate the final test commit. Commands match the configured runner. There is no proof-command substitution, unresolved red check or need to repeat current green checks.

`check recheck2-context: 0 implementation/check-recheck2-context-1793197721729-1537376.log` confirms the unchanged base, exact product blob equality with the prior reviewed head and current commit. Worktree and whitespace checks are clean. No code was changed and no commit made during this review. Reopened `docs/reference/checks.md`; no documented behavior changed in this test-only repair. The existing limitation for merged-owner completion remains the traced proof already accepted, outside this repair.

### Test-Change trailers

Listed `76a1da50..dedbc381` trailers in the range log. The previously judged inventory is unchanged, with this one addition:

`Test-Change: tests/run-units.test.ts strengthen the gatekill case for B F2's re-check: a TERM-ignoring payload keeps the inherited stdout fd alive after the wrapper's SIGKILL until the real scope drains, asserted live while phase --check stays open; the non-nested outFd break turns it red (check gatekill-break: 1), restored product green (check gatekill-green: 0)`

The path matches `src/test-files.ts`, and the cited criterion/F2 and red/green logs substantiate the change.

All relative log paths above are under this leaf and were read back with `akrogon log`. Open Fixes: none. Open operator actions: none. No new or reusable Nit is retained by B. The earlier F2 handoff is complete. Requested next phase: `merge`.
