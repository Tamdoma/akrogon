# Slot B review, 2026-11-25

- Base `085f2f88c3a1920732e10afbc0bad190cf32d540`.
- Reviewed head `d388a2d4cc1a8226870d130264a47a48c7d6179c`.
- Verdict `fix`.

## Fixes

### F1. The second pass drops a looping shell's newly orphaned children

The incident's Claude tool shell in `issues/chart/seat-turn-idle/INTAKE.md` repeatedly launches non-shell `git` and `sleep` children. When one forks after the first membership read, it is absent from the first kill list. If the shell dies and the child is reparented before the second stat read, `src/seat.ts:651` sees the child as a new root and drops it because it is not a shell. The child remains in the seat scope, survives the move, and is absent from `shell_sweep.ended`. This breaks criterion 1's explicit looping-shell descendant case. Plan D7's residual about a straggler outside the scope does not cover this same-scope case.

`check sweep-reparent-proof: 0 implementation/check-sweep-reparent-proof-1795573291609-4008788.log` exercised the process transition with a real Bash and `sleep`. The root PID `4009242` was the only initial member considered in the proof. Child PID `4009243` appeared afterward. Killing Bash left the child alive with `comm=sleep`, a different parent, and its inherited cgroup unchanged. This verifies the kernel behavior used in tracing the two product passes. The criterion test currently seeds fixed parentage and membership and does not exercise the transition.

### F2. A run-check admitted during the sweep can lose its writer

The live census in `issues/chart/seat-turn-idle/slots/fork-shell-sweep-final-check-B.md` K2 observed an actual run-check Bun writer in the seat's shell family while its payload uses a sibling scope. On an operator move or a move reported from the other seat, that writer is outside the caller chain. `src/phase.ts:338` reads the writer records once before collecting either seat. Run admission uses its own locks (`src/admission.ts:231`), so a writer already in the target tree can publish its waiting or live record after the sweep's scan. Both kill passes still use the old spare set (`src/seat.ts:627`). The writer can receive SIGKILL while waiting, running, or publishing. If its capture pair has already been created, the pair can become abandoned and refuse a later non-failed move (`src/run-check.ts:391`, `src/phase.ts:160`). Criterion 2 requires the live writer tree to survive. The test pre-seeds all run records before the phase command, leaving this ordering untested.

### F3. The signal uses a stale scope membership list

`src/seat.ts:664` re-reads cgroup membership once for the entire pass. The per-target read at `src/seat.ts:674` checks process start time, which survives a cgroup move and an `exec`. A real seat command such as the `systemd-run --user --scope` launcher used by `run-check` (`src/run-check.ts:424`, `src/scope.ts:48`) can enter its sibling run scope between that membership snapshot and its turn in the kill loop. If selected while still in the target shell tree, for example during F2's admission race, the same PID can receive SIGKILL after it leaves the seat scope. This breaks Q2's per-signal scope re-check and criterion 1's scope boundary. The test's fixed membership cannot catch this.

### F4. The planned tests miss required sweep results

- Criterion 1 requires every recorded seat to be swept and a timing row to contain program names. The only live test seat is A (`tests/shell-sweep.test.ts:125`), and the main proof projects `ended` to PIDs (`tests/shell-sweep.test.ts:376`). A sweep that skips slot B or supplies wrong `comm` values still passes. A two-seat move and assertions on the ended PID and name pairs can use the existing hc fixture and fake proc/cgroup helper. The missing looping case is covered by F1.
- Criterion 3 requires a structured warning on failure. Both tests only look for the slug as a substring of stderr and assert a non-empty errors array in the timing row (`tests/shell-sweep.test.ts:449`, `tests/shell-sweep.test.ts:477`). The seat-read stub refuses every hc command, so `repoSpace` can fail at session discovery before `terminal.list`. The proof would pass with the warning's slot and error missing, and does not exercise a per-process failure with its PID. Check the JSON warning fields using the existing CLI boundary and distinguish terminal-read failure from session discovery.

### F5. The formatting commit lacks a trailer for `tests/hc-fixture.ts`

`git log --name-status origin/main..HEAD -- tests` shows that `d388a2d4` reformats `tests/hc-fixture.ts`, an existing file covered by `src/test-files.ts`. Its final trailer block cites only the other two test files. The earlier fixture citation describes the behavior change in `f8a5682f`. The review's per-commit test lock also requires a citation for the later formatting change. A trailer-only commit can give the exact path and source without changing the fixture again. The current range-wide citation gate can accept the earlier citation since this modified base file was not in the frozen planning snapshot.

## Test-Change trailers

| Commit | Path | Source and judgment |
| --- | --- | --- |
| `d687aede` | `tests/hc-shim.sh` | Accepted. Criterion 4 and chart proof P2 supply the `spawn_pending` state. The shim's `get --json` rewrite supplies it to the actual dispatch lookup while the unmodified record provides the positive control. |
| `f8a5682f` | `tests/hc-fixture.ts` | Accepted. Chart proof P3 observed persistent non-shell harness helpers. The hook represents harness machinery in the mid-turn and blocked-seat fixture tests, as the three red test titles in `implementation/check-test-1795570972860-1020108.log` show. A renamed interpreter retains that role and leaves the assertions intact. |
| `f8a5682f` | `tests/stand-in.sh` | Accepted. The fixture change and criterion 2 are the source. Routing the hook through the renamed interpreter preserves the direct-child relationship without classifying fixture internals as a shell root. |
| `f8a5682f` | `tests/shell-sweep.test.ts` | Accepted. The run writer's real field 22 is the source for admission's equality check. Using that same value for the positive cases and a different value for the stale case preserves the test's writer-identity requirement. |
| `d388a2d4` | `tests/seat-recovery.test.ts` | Accepted. The commit diff shows line wrapping only. |
| `d388a2d4` | `tests/shell-sweep.test.ts` | Accepted. The commit diff shows line wrapping only. |

## Verification and documentation

- Green receipt `23123b58-10b9-4be1-aae6-793f3169ed7e` matches the reviewed head and base. Read the format, typecheck, and test logs. The test command ran 1,427 tests and its changed-file reruns ran 40, all green. No planned test or runner configuration was disabled. `git diff --check origin/main...HEAD` passed.
- Reran the exact four proof commands from the plan on the committed head. This confirms the planned filter for criterion 1 separately from the full-file run cited in the implementation report, and refreshes the earlier proof logs after the fixture and formatting changes.
  - `check sweep-commit: 0 implementation/check-sweep-commit-1795573291850-4008787.log`.
  - `check sweep-shape: 0 implementation/check-sweep-shape-1795573291853-4008785.log`.
  - `check sweep-fail: 0 implementation/check-sweep-fail-1795573291850-4008789.log`.
  - `check seat-recovery: 0 implementation/check-seat-recovery-1795573295126-4008786.log`.
- Read the plan's red-first logs and the later recovery red/green evidence. The positive recovery tests exercise the shared lost path. `tests/hc-delivery.test.ts:290`, which passed in the full suite, verifies that the shared path fails the leaf on its third loss. The boot-case correction has its separate green base proof. The recovery test covers a real core and the documented `spawn_pending` rewrite.
- Read `docs/reference/state-and-phases.md`, `docs/reference/files.md`, `src/AREA.md` and the pointer in `docs/reference-index.md`. The repository-root path listing found every path named by `src/AREA.md`. The documented guarantees for ending shell trees and sparing run writers are ahead of the behavior in F1–F3. The documented timing kind and recovered-seat lost path match the implementation.

## 2026-11-25 check.repair

Reviewed head `d388a2d4cc1a8226870d130264a47a48c7d6179c`. Handoff head `6a19e1165a45263c3c872cc056eb261c3c4c85f2`.

### Repaired by B

- **F4** in `d0f7dd100816f69d6c88ffb284c0cc70869f5fae`. The existing Bun runner and hc fixture now exercise a move with live seats A and B and check the exact ended PID/program pairs and one timing row for each (brief criterion 1). The prior test covered only A and projected out the names. The warning tests now parse stderr, require the leaf, slot and error, and fail only the leaf's `terminal.list` RPC for the seat-read case, while other hc calls reach the fixture core. The signal case injects `EPERM` at `process.kill` for one owned fixture PID and asserts the PID and error in stderr and timing alongside an exit of zero and committed phase (criterion 3).
  - `check repair-sweep-old-proof: 0 implementation/check-repair-sweep-old-proof-1795573745295-4189028.log`. All four original cases passed with the skip-B, wrong-name and missing-warning-fields breaks combined.
  - `check repair-sweep-red-seat: 1 implementation/check-repair-sweep-red-seat-1795573726472-4165653.log`. The two-seat case caught B's surviving shell with B excluded from the sweep.
  - `check repair-sweep-red-comm: 1 implementation/check-repair-sweep-red-comm-1795573726972-4176373.log`. The timing assertion caught incorrect program names.
  - `check repair-sweep-red-warning: 1 implementation/check-repair-sweep-red-warning-1795573727416-4177807.log`. Omitting the slot for read errors and the PID for signal errors made all three warning cases fail. All five cases ran in each deliberate break. The breaks were restored.
  - `check repair-sweep-proof: 0 implementation/check-repair-sweep-proof-1795573759265-7529.log`. All five cases passed on the handoff head.
  - The three affected commands from the plan passed on the handoff head. `check sweep-commit: 0 implementation/check-sweep-commit-1795573759253-7531.log`, `check sweep-shape: 0 implementation/check-sweep-shape-1795573759253-7528.log`, and `check sweep-fail: 0 implementation/check-sweep-fail-1795573759255-7527.log`. Criterion 4's proof inputs did not change.
- **F5** in trailer-only commit `6a19e1165a45263c3c872cc056eb261c3c4c85f2`. `git show d388a2d4 -- tests/hc-fixture.ts` shows the import and core environment wrapping without a trailer naming the fixture. `git show -s --format='%(trailers:key=Test-Change,valueonly)' 6a19e116` now prints the citation naming that path and source. The commit has an empty tree diff.

### Handed to A

- **B F1 and A F1**. The incident's looping shell can leave a newly orphaned non-shell child in the same cgroup. The product fix and one deterministic regression proof for the fork/re-collect criterion go together. The existing fixed-membership tests would pass with the re-collect deleted.
- **B F2**. A run-check writer admitted after the spare snapshot can be killed and leave abandoned captures. The fix and proof of the admission-versus-sweep ordering go together. The existing pre-seeded records cannot distinguish the repaired behavior.
- **B F3**. A PID selected in the seat scope can migrate before its signal. The fix and proof of the membership change before a signal go together. The existing tests keep membership fixed.

## 2026-11-25 check.review after repair round 1

- Base `085f2f88c3a1920732e10afbc0bad190cf32d540`. Reviewed head `11837b67d21700f9d9fec2ddad3de6eb16654ade`.
- Reviewed the repair commits after B's handoff at `6a19e1165a45263c3c872cc056eb261c3c4c85f2`. The branch has the same base and the report records no refresh.
- Verdict `fix`.

### Earlier findings

- **B F1 and A F1 remain open.** The new test puts both orphaned children in the first `cgroup.procs` snapshot (`tests/shell-sweep.test.ts:375`) and leaves the membership fixed. It would pass with the second collect removed. The fake zombie PID is also absent from the membership, so the test never exercises the new zombie check. The broader root rule catches those seeded children by killing unrelated orphans as well (F6). Criterion 1 still needs a child of a selected shell that appears between collections.
- **B F2 remains open.** The first snapshot is still the source of ancestry for `expand` (`src/seat.ts:650`). A real seat shell can start a same-leaf `run-check` after collection. Its new record is visible to the fresh read, but its PID is missing from the old map, so the parent shell is still signalled. This violates criterion 2. In `check recheck-sweep-order: 1 implementation/check-recheck-sweep-order-1795578598316-2029045.log`, the fake proc/cgroup boundary advanced after collection using real fixture PIDs and the actual admission reader. The late writer had a matching live record and its target shell was still signalled. The committed freshness test puts the writer in the initial map, and its recorded red before the fix is a call-count assertion on the old function's incompatible spare argument, not a failed survival assertion.
- **B F3 remains open.** The migration test proves the new per-PID read sees a target already outside the seat. In production, a `systemd-run --scope` launcher can still move while `leafRunWriterPids` reads and parses the run directory and expands trees *after* the cgroup lookup (`src/seat.ts:693`–`697`). The `late-cgroup` case in the same ordering log changed the per-PID file during that consultation and the sweep still signalled the migrated PID. This is the old scope race at the new ordering point, so Q2 and plan D7's immediate per-signal check still lack proof.
- **F4 and F5 remain resolved.** The two-seat and warning tests pass after the cgroup fixture changes. The missing fixture-format trailer is present in `6a19e116`.

### New fixes

#### F6. The repair kills unrelated non-shell processes in the seat scope

The new root test at `src/seat.ts:679` accepts every process whose parent is outside the seat scope. This drops Q2's shell-root requirement for any orphan, including one already present before the sweep. A real example is a seat starting `ssh-agent -a <private socket> -s` for later Git work. The SSH agent forks and outlives its launcher, keeping the inherited cgroup even though its parent changes. Killing it breaks later authentication through that socket. `check recheck-detached-agent: 1 implementation/check-recheck-detached-agent-1795578487887-1708171.log` launched a private agent without credentials, read its actual comm, parent and inherited cgroup from procfs, and replayed that topology through the existing scope boundary. The repair signalled the agent and recorded it as ended. The prior shell-root rule excluded it. Criterion 1 and design Q2 require a shell root or an identified descendant of one. Reparenting alone does not establish that ancestry.

#### F7. The new freshness test leaks its fixture home into the test runner

`tests/sweep-freshness.test.ts:54` changes `AKROGON_HOME` before line 107 saves it. The finally block restores the fixture value, then the cleanup hook removes that directory. The configured `test` command uses `--no-isolate`, so the runner retains the wrong home for subsequent in-process work that calls `homePath()` or inherits its environment. `check recheck-sweep-env: 1 implementation/check-recheck-sweep-env-1795578513684-1712871.log` used that runner mode with a temporary after-all assertion. The new test passed but the assertion found `AKROGON_HOME` pointed at the removed fixture. This breaks isolation for the new criterion-2 proof in the configured shared runner.

### Verification and trailers

- Receipt `ade96789-7eb7-4fc6-a4a8-135880e3c503` matches the reviewed head and base. Format, typecheck and test passed. The test log shows 1,430 cases and 55 changed-file reruns, all green. No runner configuration changed. `git diff --check` passed.
- The planned commands passed on this head. `check sweep-commit: 0 implementation/check-sweep-commit-1795578488106-1708172.log`, `check sweep-shape: 0 implementation/check-sweep-shape-1795578488057-1708173.log`, `check sweep-fail: 0 implementation/check-sweep-fail-1795578488058-1708175.log`, and `check seat-recovery: 0 implementation/check-seat-recovery-1795578491336-1708174.log`.
- The `e194228d` trailer cites the incident loop and `systemd-run` migration for the additional sweep test cases. The `326e6cd2` trailer explains why the new case's timing count moved from 12 to 14. The count matches that fixture's expected deaths, while the fixture leaves the timing gap above. The `11837b67` trailer matches the formatting-only freshness test diff. The late-writer red evidence does not prove the required outcome, as recorded under F2.
- `docs/reference/state-and-phases.md` and `src/AREA.md` still describe a shell-tree sweep. These claims match the brief. F6 is a product regression against them.

## 2026-11-25 check.repair after repair round 1

Reviewed head `11837b67d21700f9d9fec2ddad3de6eb16654ade`. Handoff head `ccecb69109d09472713954375da369aef77614c2`.

### Repaired by B

- **F7**. The freshness test wrote its fixture path to `AKROGON_HOME` before saving the original value. Reproduction `b52fb57c3ade35a1205fa29fc1759b2b3d2da220` asserts that the configured shared runner retains its starting value. Fix `ccecb69109d09472713954375da369aef77614c2` removes the write and restore entirely. The test derives the fake scope's slice through the same `homePath()` as the sweep, and continues to seed the proc and cgroup files under its temporary directory. The test now only reads `AKROGON_HOME` for the preservation assertion.
  - `check repair-f7-home: 1 implementation/check-repair-f7-home-1795578728130-2307965.log`. Five runs failed the new assertion. The first run changed an unset home to the fixture directory, and each later run inherited the previous fixture directory.
  - `check repair-f7-home: 0 implementation/check-repair-f7-home-1795578750802-2321688.log`. The same five runs passed after removing the fixture mutation.
  - `check repair-f7-shared: 0 implementation/check-repair-f7-shared-1795578773809-2329400.log`. All 35 executions of the two sweep test files passed in shared-runner mode on the handoff head.

F4 and F5 remain resolved. The sweep implementation and seat-recovery proof inputs are unchanged by this repair.

### Handed to A

- **B F1 and A F1**. Both children in the prior fixture are present before the first collect. The product repair and a proof that introduces a confirmed shell descendant between the two collections go together with F6. No unchanged case tests that ordering.
- **B F2**. The fresh writer scan still expands against the old process snapshot. The existing freshness case seeds the writer before collection, and the red `late-writer` check from re-review exposes the product defect after collection. Repair and proof of late writer ancestry go together. The F7 fixture repair covers runner state only.
- **B F3**. The previous change moved the cgroup check ahead of the fresh writer lookup, through which a migration can still race the signal. The committed migration fixture moves the process before either lookup. The product repair and proof of migration during the sweep go together, as shown by the `late-cgroup` check from re-review.
- **B F6**. The broad orphan rule kills detached non-shell processes. Restore Q2's shell-root boundary and establish ancestry for non-shell descendants. The existing test expects deaths for unproven orphans, so the fix and a proof protecting an unrelated detached process go together.

## 2026-11-25 check.review after repair round 2

- Base `085f2f88c3a1920732e10afbc0bad190cf32d540`. Reviewed head `4d33533b219eeb55e3ec624d7e6ef5b5ff80b770`.
- Reviewed the repair commits after B's handoff at `ccecb69109d09472713954375da369aef77614c2`. The merge base is unchanged and the report records no branch refresh.
- Verdict `fix`.

### Earlier findings

- **B F1 and A F1**. The new fixture adds a child after the first membership read and the child dies on the reviewed head. Its recorded red stops at the assertion that the parent is frozen, before it checks whether the child survived. The named late-child outcome still needs red evidence independent of the attempted SIGSTOP mechanism. The freeze also conflicts with F8–F10 below.
- **B F2**. Live parentage now reaches a writer whose PID is missing from the membership snapshot. The new test's recorded red is the control shell surviving. The assertions for the writer and its parent both passed on that run, so it does not reproduce the lost protection. In addition, the freeze loop takes one spare scan per round and can stop a tree whose check was admitted after that scan. The late-writer proof must detect harm to the writer or its tree at the actual admission boundary.
- **B F3**. The SIGKILL path now reads membership after the spare lookup. The recorded red of the new migration case fails because the mutation requires a frozen victim and never runs on the old implementation. The repair also introduces a signal before any per-PID membership proof in the freeze path (F8). The signal-boundary proof must exercise the migration on both versions.
- **F4–F7**. Two-seat timing, warnings, the fixture trailer, protection of detached non-shell orphans and preservation of the runner home remain covered. The F6 survival expectation is supported by the real detached-agent example from the previous review.

### New fixes

#### F8. SIGSTOP crosses the seat-scope boundary

The freeze sends SIGSTOP based on the earlier membership and stat snapshot (`src/seat.ts:665`–`676`). It checks neither the candidate's individual cgroup nor its start time right before that signal. The final cgroup check at `src/seat.ts:699` only controls SIGKILL. A real source is the `systemd-run --scope` launcher used by `run-check` (`src/run-check.ts:424`, `src/scope.ts:48`). It can move to its sibling scope between the census and the freeze. `check recheck-sweep-stop: 1 implementation/check-recheck-sweep-stop-1795583443197-1715344.log` drove the sweep with a real owned Bash PID, a stale membership list and the PID's cgroup file already pointing to a sibling run scope. Real procfs showed it stopped before the decision pass, then running after cleanup with zero ended processes. The freeze interrupted a process outside the seat boundary, violating Q2's identity and scope proof before signalling and criterion 2's protection of live run-check trees. The current migration tests only check survival.

#### F9. Interrupting a sweep can leave a shell stopped indefinitely

The sweep tracks stopped PIDs only in memory and resumes them in a local `finally` (`src/seat.ts:652`, `src/seat.ts:739`). An operator interrupting an in-flight `akrogon phase` with Ctrl+C can terminate that process before cleanup. The listener also kills an overdue pass process group (`src/listen.ts:51`). Neither signal can be recovered by this local cleanup. The interrupted case in the same `recheck-sweep-stop` log used the current sweep and a real owned Bash. After procfs confirmed SIGSTOP, SIGINT ended the sweep process with exit 130, and the target remained in state `T`. A production move has already committed when the sweep runs, so the interruption can leave a surviving shell frozen after the move, with neither the cleanup nor the warning row executed. This breaks criteria 1 and 3 and introduces a failure mode absent from the prior SIGKILL-only sweep.

#### F10. The sweep waits for process exit while holding the global lock

`src/phase.ts:1031` holds the global lock through transition and the post-commit sweep. The new polling loop at `src/seat.ts:731` waits for the kernel to report each signalled process dead or reaping, up to two seconds per seat. A normal move sweeping an asynchronously exiting target therefore keeps other lifecycle passes behind that lock, and a pending exit can consume the full budget. Q1 explicitly requires no wait under the global lock, and its final-shape correction repeats that requirement. This is a bound on the actual transition, so the plan note describing the new wait as a replacement means does not resolve the design conflict.

### Verification and trailers

- Receipt `e1945955-7c4f-4d40-83f9-941bd14fd262` matches the reviewed head and base. Format, typecheck and test passed, with 1,433 tests and 70 changed-file reruns green. `git diff --check ccecb691..HEAD` passed.
- The four planned commands passed on this head. `check sweep-commit: 0 implementation/check-sweep-commit-1795583443368-1715348.log`, `check sweep-shape: 0 implementation/check-sweep-shape-1795583443368-1715346.log`, `check sweep-fail: 0 implementation/check-sweep-fail-1795583443368-1715349.log`, and `check seat-recovery: 0 implementation/check-seat-recovery-1795583446573-1715347.log`.
- The `6179ddae` trailer for `tests/shell-sweep.test.ts` cites the real detached-agent scope evidence and matches the new survival expectation. Its `tests/sweep-freshness.test.ts` trailer cites the incident and admission/migration traces. The red log `implementation/check-fix2-repro-red-1795580339639-3231581.log` leaves the proof gaps above. Both `4d33533b` trailers match formatting-only changes.
- The shell-sweep reference in `docs/reference/state-and-phases.md` describes the brief's scope and protections. F8 and F9 are new failures against that contract.

## 2026-11-25 check.repair after repair round 2

Reviewed and handoff head `4d33533b219eeb55e3ec624d7e6ef5b5ff80b770`. Searched the sweep's direct callers and tests for an unchanged proof of the late-child, writer admission, scope migration, interruption and lock boundaries. The cases in `tests/shell-sweep.test.ts` and `tests/sweep-freshness.test.ts` supply green control coverage, but the relevant cases omit those transitions or depend on SIGSTOP itself. The retained red runs below still apply to this head. There are no independent proof-only fixes or operator actions in this pass.

### Handed to A

- **B F1 and A F1**. The previous red run fails on the mechanism assertion that the parent was frozen before reaching the late child's survival check. The sweep behavior and an outcome-based proof of the late descendant go together with the correction of the freeze regressions.
- **B F2**. The previous red run fails on the control shell, while the writer and its parent both survive. The freeze now takes one writer scan per round, so a tree can still be signalled after admission changes. Repair and proof of the late admission boundary go together. The prior `late-writer` trace is in `implementation/check-recheck-sweep-order-1795578598316-2029045.log`.
- **B F3**. The previous red run failed before the migration happened because its trigger required a stopped process. The final SIGKILL check now reads membership last, but the earlier SIGSTOP crosses the boundary. A product repair and a proof that exercises the migration even on the broken revision go together with F8.
- **B F8**. The `migrated` case in `implementation/check-recheck-sweep-stop-1795583443197-1715344.log` proves the per-PID cgroup already shows the sibling scope when the sweep stops it. Existing tests check whether the target survives and miss the stop. Correct signal targeting and the proof of that boundary together.
- **B F9**. The `interrupted` case in the same log proves SIGINT leaves a target in state `T` when the sweep exits. The current proof covers normal return only. Repair and an interruption proof go together.
- **B F10**. Q1 requires the move to avoid waiting for process exit under the global lock. The new polling loop runs inside that lock, and no unchanged test checks lock release while a signalled process is still exiting. Restore the locked behavior and pair it with a proof of non-blocking completion.

## 2026-11-25 check.review after repair round 3

- Base `085f2f88c3a1920732e10afbc0bad190cf32d540`. Reviewed head `8ba8e389e29f87c865db1bf1ef65946789854a96`.
- Reviewed the repair diff after `4d33533b219eeb55e3ec624d7e6ef5b5ff80b770`. The merge base is unchanged and the report records no branch refresh.
- Verdict `fix`. F1 and F2 still reproduce on the reviewed head.

### Still open

- **B F1 and A F1**. The round-3 test changes a late `sleep` descendant to an orphaned Bash. That proves the second pass can end a new *shell* root. The incident's actual loop in `issues/chart/seat-turn-idle/INTAKE.md:36` launches `sleep 30` and `git`. Criterion 1 requires the descendants of that looping shell to be gone. In the `late-child` case of `check recheck-round3-order: 1 implementation/check-recheck-round3-order-1795585404774-2994899.log`, a real Bash started a real `sleep` after the first membership read. The fixture pinned the ordering in which the kernel reparented that child before the second collect. The child retained the shell's actual process group and inherited cgroup, and the fake proc/cgroup files reflected those observed relationships. The sweep signalled the parent and returned with the child alive, without an error. At `src/seat.ts:625` the second pass classifies the reparented child as a non-shell root, dropping its known shell ancestry. Plan D7's accepted race covers a process outside the scope. This child remained inside, so the round-3 note does not satisfy the locked criterion. Chart proof P1 also observed that the tool Bash leads its own process group, the same relationship observed here.
- **B F2**. Live ancestry lookup now protects a writer already visible at the target's final spare scan. It leaves a race after that scan, before the signal at `src/seat.ts:683`. Real admission publishes the record by rename under a different lock (`src/admission.ts:54`, `:82`, `:231`). In the `late-record` case of the same log, the fixture published a matching live record after the real admission reader's final scan. A read-back confirmed the record and writer identity before signalling. The sweep still killed the parent shell, reparenting the live writer. This breaks criterion 2's subtree protection. The committed test supplies the writer during the initial spare consultation, and all its survival assertions already pass on the round-2 head in `implementation/check-fix3-repro-red-1795583915680-1847772.log`.

### Resolved

- **F3 and F8**. The `late-cgroup` case changed membership inside the per-target spare consultation and the current sweep delivered no signal. The membership read now follows that consultation. The updated migration case fires on both heads, fails on round 2 because the migrated process was stopped, and passes after removal of SIGSTOP.
- **F9 and F10**. The product diff deletes the freeze, continue and exit polling paths. An interrupted sweep has no stop state to undo, and the phase lock no longer covers an exit-confirmation wait.
- **F4–F7**. The reruns still cover per-seat timing rows, structured warnings, detached non-shell survival and shared-runner home preservation. The fixture-format trailer remains in `6a19e116`.

### Verification and trailers

- Receipt `de9d3836-8263-4266-8f13-66b6fbb3155f` matches this head and base. Format, typecheck and test passed, including 1,433 suite cases and 70 changed-file reruns. `git diff --check 4d33533b..HEAD` passed.
- All planned commands passed on this head. `check sweep-commit: 0 implementation/check-sweep-commit-1795585407487-2994867.log`, `check sweep-shape: 0 implementation/check-sweep-shape-1795585406932-2994937.log`, `check sweep-fail: 0 implementation/check-sweep-fail-1795585406967-2994872.log`, and `check seat-recovery: 0 implementation/check-seat-recovery-1795585410537-2994895.log`. The freshness file passed all 20 shared-runner executions in `check recheck-round3-freshness: 0 implementation/check-recheck-round3-freshness-1795585404782-2994922.log`.
- The `9e4541c3` trailer cites the previous review. Its migration change validly checks the earlier unproven SIGSTOP. Changing the late `sleep` to Bash loses the specific criterion-1 scenario, as demonstrated in F1. The `1d321182` trailer cites the worker's observed asynchronous exit and design Q1. Polling in the test is consistent with the sweep returning without waiting under the lock.
- `docs/reference/state-and-phases.md` still promises ending each leftover shell tree and protecting run writers. F1 and F2 are failures against those documented outcomes.

## 2026-11-25 check.repair after repair round 3

Reviewed and handoff head `8ba8e389e29f87c865db1bf1ef65946789854a96`. The red `recheck-round3-order` run still applies to this head. I checked the sweep cases and the admission/run-unit tests for an existing proof that distinguishes either failure. The sweep tests use a late Bash root or a writer visible before the final scan. The admission/run-unit tests cover their own locks and teardown and do not interleave admission with the phase sweep. Both fixes therefore require changes to sweep behavior and the corresponding proofs.

### Handed to A

- **B F1 and A F1**. Keep the `late-child` ordering from `implementation/check-recheck-round3-order-1795585404774-2994899.log`: a real Bash starts a real `sleep` after the first census, its parent receives SIGKILL, and the second scan sees the child under its new parent in the same seat cgroup. Prove that the child is signalled and ends while the detached non-shell control survives. The kernel trace and chart proof P1 both identify the tool Bash as its process-group leader, and the child in the trace retains that group after its parent dies. This gives the repair concrete lineage evidence beyond current PPID. Keep Q1's no-wait and Q2's per-PID proof and shell-tree boundary. The existing late-Bash test never exercises this loss of ancestry.
- **B F2**. Keep the `late-record` ordering from the same log: take the last writer snapshot, publish and read back the matching live record before the shell signal, then assert that both the writer and its parent shell survive. Admission publishes records under its own lock and the sweep's final read and signal do not share that publication boundary. Repair and proof must cover this interval. The current test's earlier publication would also pass while this interval remains open.

## 2026-11-25 check.review after repair round 4

- Base `085f2f88c3a1920732e10afbc0bad190cf32d540`. Reviewed head `308fc4b203161c663617fcff2406e10c2fc3e5b7`.
- Reviewed the repair diff after `8ba8e389e29f87c865db1bf1ef65946789854a96`. The merge base is unchanged and the report records no refresh.
- Verdict `fix`. The round-4 changes cover the earlier F1/F2 reproductions and introduce F11/F12.

### Earlier findings

- **B F1 and A F1**. The new non-shell child case fails on the original leak in `implementation/check-fix4-repro-red-1795585977503-3568067.log`, then passes on this head with the detached control alive. This covers a child retaining the killed shell's process group after reparenting. F11 shows group membership also has a topology that the current rule fails to exclude.
- **B F2**. New writer publication and the sweep's writer scan and signals share the admission lock. The corrected fixture locks the CLI's actual lock file. Worker log `implementation/check-u4-lock-mismatch-evidence-1795588291434-736.log` shows the old CLI could write its sweep row under the hold and the repaired CLI only does so after release. This closes the original publication window. F12 covers the new outer-lock consequence.
- **F3–F10**. The migration, timing, warning, detached-orphan and home-preservation proofs still pass. The trailer-only fixture citation remains present. The sweep still uses SIGKILL without freezing processes or waiting for their exit.

### New fixes

#### F11. Process-group lineage kills a live non-shell harness child

`src/seat.ts:633`–`638` accepts any member sharing a signalled shell's group. It allows a member with an in-scope non-shell root, including a direct child of the harness. A job-control pipeline launched by a shell harness is a real source. Bash starts both pipeline stages as its own children and puts them in the same job group, which the first stage can lead. This fits the configurable harness command path in `docs/reference/config.md` and `src/seat.ts:startSeat`. In `check recheck-round4-siblings: 1 implementation/check-recheck-round4-siblings-1795588803839-384110.log`, a scratch PTY ran a real Bash job-control pipeline. Procfs showed the helper was a direct child of the harness and shared the Bash stage's group and inherited cgroup. The sweep replayed those records through the cgroup seam and reported both the shell and its non-shell sibling as ended. The helper was already in the first census, had the same live parent through the second, and was never a descendant of the signalled shell. This violates criterion 2 and Q2's protection of non-shell harness children. The detached-control test only covers a different process group.

#### F12. An unrelated admission can stall every phase move behind the sweep

`src/phase.ts:349` acquires `admission.lock` exclusively while the phase transition holds the home-wide `.lock`. The exclusive acquisition in `src/state.ts:389`–`402` uses blocking flock without a deadline. A real run admission (`src/admission.ts:235`–`236`) can hold the shared admission lock while queued on its own repository line lock. In `check recheck-round4-admission-wait: 1 implementation/check-recheck-round4-admission-wait-1795588900719-399806.log`, a worker used the actual admission function for another repo while the fixture held that repo's line lock. The real phase CLI committed the move, then blocked in the sweep. A separate lock probe showed the home-wide lock remained unavailable and the sweep had produced no row. Both commands completed after release. This adds a wait on unrelated repo work under the global lock, the cross-repo stall forbidden by Q1 and explained in the chart's D rebuttal R4. F2 requires an admission fence, and that fence must preserve Q1.

### Verification and trailers

- Receipt `4e9f71f3-8dd0-4568-8efb-fc00d1674947` matches this head and base. Format, typecheck and test passed, with 1,435 tests and 80 changed-file reruns. `git diff --check 8ba8e389..HEAD` passed.
- Planned checks passed on this head. `check sweep-commit: 0 implementation/check-sweep-commit-1795588739088-374443.log`, `check sweep-shape: 0 implementation/check-sweep-shape-1795588739082-374441.log`, `check sweep-fail: 0 implementation/check-sweep-fail-1795588739083-374445.log`, and `check seat-recovery: 0 implementation/check-seat-recovery-1795588742291-374444.log`. The freshness file passed 25 shared-runner executions in `check recheck-round4-freshness: 0 implementation/check-recheck-round4-freshness-1795588858638-389927.log`. The corrected contention case passed in `check recheck-round4-lock: 0 implementation/check-recheck-round4-lock-1795588862721-389926.log`.
- Both `c44ba55d` trailers cite the prior real-process trace. The `7feac14f` trailer cites logged before/after evidence that the same-file lock fixture corrected its target and releases before awaiting the CLI. The `308fc4b2` trailer matches the test's formatting-only change.
- The documented shell-tree scope is still the brief's scope. F11 is a regression against it.

## 2026-11-25 check.repair after repair round 4

Reviewed and handoff head `308fc4b203161c663617fcff2406e10c2fc3e5b7`. Checked the sweep, phase and admission tests against the two retained red cases. The helper tests use a different process group. The admission test checks publication exclusion while its lock is held and does not observe the home-wide lock. Both product fixes need matching regression tests.

### Handed to A

- **F11**. Reproduce the topology in `implementation/check-recheck-round4-siblings-1795588803839-384110.log`. A Bash stage and a non-shell stage are direct children of the harness and share a job group from the first census. After the sweep, the Bash stage must be gone and its sibling alive. Preserve the F1 case where a late non-shell descendant becomes orphaned and keeps the selected shell's process group. The existing detached control has a distinct group, so it cannot distinguish the erroneous signal.
- **F12**. Reproduce the contention in `implementation/check-recheck-round4-admission-wait-1795588900719-399806.log`. Hold another repository's line lock while a real admission waits under the shared admission lock, commit the target phase, and check availability of the home-wide phase lock while the other repository remains queued. Preserve F2's publication fence around the writer scan and signals. The current admission test would pass while the sweep blocks the home-wide lock.
