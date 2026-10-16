# Slot B: state-cutover map

Inspected 2026-10-16 against fetched main `83b92799495c40595a09ca13e08c588f89ae66ca`. Sources below are repository code and contracts, research tier `better-than-training`. Read-only inspection only. No migration, lifecycle commands, tests, process stops or code edits.

## What the gate must prove

F1. Criterion 4 requires a quiet **state writer population**, not an empty checkout. No command may retain the ability to write the old machine home after publication of the destination config, and every completed old-home write must be included in the copy (`issues/open/run-release/state-home/brief.md:13`). Ordinary shells and chart agents with cwd in the checkout do not establish that ability. The current root-substring/cwd predicate conflates them (`src/state-home.ts:86-110`).

F2. Live admissions are necessary but insufficient. A verify command calls `checkedRun` repeatedly, with work between calls (`src/verify.ts:154-170`), and admission removes its record on return (`src/admission.ts:175-176`). An old verify command can therefore have no live admission now and create one later. Non-check commands can write machine state too: `init` writes configuration at `src/init.ts:88-92`. Gate the whole command lifetime, not just its current checked subprocess or a list of supposedly mutating verbs.

F3. Include writers carrying a saved old path. The run guard receives an absolute admission record path and later executes `rm -f` on it (`src/scope.ts:64-79`). Its parent ending is not by itself proof that this helper finished. Also, `admission.release()` marks a record ended before guard shutdown (`src/run-check.ts:235-237`), so “no live records” does not prove all finalization is over. Preserve the existing old-root locks, but do not substitute those locks for identifying these remaining writers.

F4. Parenthood is not a safe exemption. The current scan excludes every ancestor and descendant (`src/state-home.ts:74-83`, `:92`, `:107`). A nested new CLI can have an old akrogon parent that will resume later. Exempt the migrating process and its specifically known lock-holder helpers, not a whole family of processes. A shell ancestor is harmless because it is not an akrogon state writer, not because it is an ancestor.

F5. The launch name must resolve to code identity. The installed `/home/ivan/.local/bin/akrogon` currently resolves to `/home/ivan/Work/infra/akrogon/src/akrogon.ts` (read-only `readlink -f`). Raw cmdline substring matching misses that symlink spelling from an outside cwd (`src/state-home.ts:106`; intake `INTAKE.md:12`). Match the executed script/entry argument after resolving relative paths and symlinks, not arbitrary text in arguments. A prompt mentioning a repository path must not count as execution of that repository's CLI.

F6. Publication and new arrivals matter. The current migrator holds the old global lock, takes the admission locks it discovered, checks twice, and publishes destination `config.yaml` last (`src/state-home.ts:122-150`). New normal CLI invocations enter migration before command dispatch (`src/akrogon.ts:8-15`). Preserve that startup barrier. An arbitrary old executable started after the last scan does not participate in it. Likewise, a newly created slice lock is absent from the enumerated lock set (`src/state-home.ts:143-149`, `src/admission.ts:43-46`). A scan is not a general fence against uncooperative future writers.

## Smallest gate I would choose

D1. Replace `foreignProcess` with a conservative **actual akrogon writer** gate, keeping live-record deferral and the existing startup/global/admission locking. Count whole CLI processes regardless of command verb, including direct and symlinked entry paths and old akrogon ancestors. Include known helpers with saved old-home state paths. Stop treating bare cwd, all Bun processes, or a root path appearing anywhere in command text as evidence of a writer. Report the specific blocker and reason when deferring.

D2. This choice needs an explicit launch boundary: installed/current CLI arrivals must enter the migration barrier before using state, existing legacy writers must finish, and no independent legacy entry may start against the old home during or after cutover. Audit and prove that boundary on this host. Do not describe a narrower process matcher alone as an unconditional proof of criterion 4. If the host still permits such legacy arrivals, close that route for the transition or choose O3 below before migrating.

D3. This should open during a gap between actual commands while chart sessions remain open. My read-only snapshot found no candidate CLI entry in the inspected argv positions, but did find eight bash processes, four claude processes and other agents/helpers with cwd in the checkout. Two Bun processes were running `skills/chart-issues/scripts/peer-wait.ts`, not the CLI. Destination `/home/ivan/.akrogon/config.yaml` was absent and source `config.yaml` present. This is a bounded observation, not a complete writer audit: two same-user process reads were denied, and custom launchers/importers were not classified. Do not use this snapshot as permission to perform the cutover.

## Options and later consequences

O1. **Actual-writer gate plus the existing startup barrier — recommended within D2's boundary.** Smallest change that separates this host's harmless resident sessions from old state users. Cost: launcher forms and state-writing helpers need explicit coverage. Future in-process state importers must join the boundary or migration must defer for them. A command-verb allowlist would age badly, so conservatively count the whole CLI.

O2. **Only live records and existing locks.** Opens easily but fails criterion 4 for an old command between checked runs and for a queued old writer that resumes after lock release (F2, F6). Reject. Narrowing the old predicate to cwd alone or literal `akrogon.ts` text also misses supported symlink launches (F5).

O3. **One controlled cutover window.** Prevent new legacy launches, let identified old commands/helpers finish, then copy and publish under the existing locks. Prefer this if D2 cannot be established automatically. Cost: a short pause of akrogon command arrivals and an explicit owner for reopening them. It does not require closing unrelated chart agents or killing their shells. Do not turn “wait for every process in the checkout” into an operator instruction.

O4. **A command-lifetime registration/lock protocol for all state users.** Stronger ongoing coordination and clearer diagnostics, but more machinery for a one-time move. It cannot retroactively register already-running old binaries, so it still needs the legacy drain in O1/O3. Choose only if arbitrary independent state writers must remain supported through future migrations.

## Pitfalls and required proof

P1. **An apparently green overlap test can prove the wrong gate.** The existing scenario launches the new copied CLI while a `sleep` sentinel forces old-home operation (`tests/state-home.test.ts:218-255`). That sentinel remains until after both deferred assertions and outer completion (`:273-295`). Thus it cannot independently prove that real writer identification protects the gap between admissions. The accepted review established nested success propagation (`issues/open/run-release/state-home/review-B.md:209-218`), not complete legacy process identification. Replace the cwd-sleeper veto expectation at `tests/state-home.test.ts:144-158` with a successful migration alongside a harmless cwd holder. Separately exercise an actual pre-cutover-home writer, launched through the installed-style symlink from outside the root, before admission, between checks and during finalization. Assert its late writes survive and migration occurs only after it can no longer write.

P2. **New arrivals and exempt ancestors need adversarial cases.** Pause migration at its final eligibility check, start another supported CLI and prove it cannot write the source after publication. Exercise a migrating child of a still-writing old parent and an existing command that creates a previously absent admission-lock name. These are the gaps the chosen gate must close, not reasons to add more cwd exclusions (`src/state-home.ts:74-83`, `:129`, `:143-149`).

P3. **Unreadable evidence is not evidence of absence.** `liveRecords` currently discards malformed/unreadable records (`src/state-home.ts:51-58`); the process scan skips cmdline-read failures (`:95-99`). Distinguish a vanished process from an unresolved potential writer and preserve a visible deferral for the latter. Do not block on every unrelated inaccessible host process. Confirm relevant identity with the available record/entry information and leave uncertainty explicit.

P4. **Keep a single publication point and a recoverable retry.** Preserve config-last atomic publication, relative-repo normalization, explicit-home fallback, and untouched tracked source files (`src/state-home.ts:125-139`, `src/config.ts:197-201`; leaf brief criteria 3–5). A deferred or failed partial copy must not activate the destination or strand records. Re-check source state on retry, rather than treating an already-created destination directory as success.

P5. **Overrides and direct imports need a stated boundary.** `AKROGON_HOME=toolRoot` explicitly skips migration (`src/state-home.ts:119-121`) and keeps selecting that source config (`src/config.ts:198-200`). Arbitrary old `bun -e` imports or another code tree can also avoid this CLI entry. Decide whether these are independent homes outside this move or old-home writers that must be drained and prevented from returning. Do not claim “no old-home writers” while quietly excluding them.

P6. **Release deployment depends on host completion, not the merged leaf state.** The original design explicitly excludes real host migration from its done-criteria (`issues/open/run-release/state-home/design.md:17`), and the intake records the release-folder failure when the destination is still empty (`INTAKE.md:13`). Before allowing that dependent switch, verify destination config and preserved state, one normal command using the destination, and no subsequent source-state writes. This task supplies the map only; it does not execute that transition.

## Questions to settle

Q1. Are supported arrivals limited to the updated installed/direct CLI and named helpers, or must independent old entry points and arbitrary state-module importers remain usable during cutover? This determines whether O1 can satisfy criterion 4 or requires O3/O4.

Q2. For a known old writer, should the new command defer migration and continue on the old home, as today, or wait until that writer exits? Prefer today's deferral, with blocker diagnostics, unless the release-deploy boundary needs a separately coordinated drain. Do not make ordinary commands fail just because migration deferred.

Q3. Who owns the actual host transition and the release-deploy hold until its read-back succeeds? Make that dependency explicit rather than assuming the next arbitrary command will happen to find a quiet moment.
