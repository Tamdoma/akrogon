# Review A: tool-cgroup-kill

Base `64681915` (origin/main), reviewed head `8015eeff0f2ced10f6b58e00a20c686b3eade3ac`. Initial blind review.

## Verification evidence read

- `implementation/report.md`: verify green at the reviewed head — format 0, typecheck 0, test 0, receipt rows in `implementation/check-{format,typecheck,test}-1795607…-4067486.log`; confirmed the log files exist and the verify output records `verify leaf 8015eeff…: green`.
- Criterion proofs at the head: `check-head-tool-kill-1795607241843` exit 0, `check-final4-tool-entry-1795607069535` exit 0, `check-head-recovered-1795607243255` exit 0.
- Red evidence from planning stands: the three files failed on base for the criteria's own observables.
- `src/AREA.md` (in the diff): every path it names exists from the repository root (checked all 33 `src/` paths in one listing); file is exactly 40 lines with the four required sections.
- `docs/reference/files.md`: the `timings.jsonl` kinds line now names both new kinds with their fields; matches `src/timing.ts`.
- Diff read in full: `src/tool-cgroup.ts`, `src/akrogon.ts`, `src/phase.ts`, `src/run-check.ts`, `src/seat.ts`, `src/hc.ts`, `src/next.ts`, `src/timing.ts`, both docs, all three test files.
- Concurrency trace: every `commitMove` caller (`phaseCommand`, `land.ts` exit paths, `next.ts` failure paths) runs inside `withLock(<home>/.lock)`, so the helper pid write is under the home lock as the design requires, and concurrent commits are serialized as designed.

## Fixes

### F1 — rmdir failures never warn and are never counted, and criterion 4's rmdir scenario has no proof

Criterion 4 of the brief: "When a kill, rmdir or helper spawn fails, the move stays committed, `akrogon phase` exits as it does without the kill, and a structured warning names the leaf, unit, `t-` and error." Design Q1's final sentence: "A kill, rmdir or spawn failure warns with structured fields and never fails the committed move." Plan D9: "Every failure (kill write, rmdir, spawn, pid write) appends to the row's `errors` and warns as one structured JSON line."

The implementation in `src/tool-cgroup.ts` swallows every rmdir failure silently: `rmdirBestEffort` catches and discards without warning or counting into `errors`, and the helper's rmdir retry loop in `toolKillHelper` likewise records nothing. Only kill-write and spawn failures warn.

Realistic source: a committed phase move sweeping the leaf's scopes — the leaf's core path, exercised at every phase advance. Consequence today: a persistently failing removal (a repopulated `t-` that keeps failing removal, or any non-race failure) leaves no signal anywhere — not on stderr, not in the row's `errors` count — so the failure the design mandates be visible is invisible. The proofs compound it: plan.md's criterion-4 construction names three sub-cases ("kill-write failure, rmdir failure (`t-` not empty in the fake tree), and helper spawn failure"), and the landed `tests/tool-kill.test.ts` has only two — the rmdir sub-case was dropped without a record, so the scenario the criterion names has neither implementation nor test.

Hits: criterion 4 (the rmdir failure scenario), design Q1's final sentence. The repair must reconcile the warning with the zombie-reaping race that makes a fresh kill's immediate rmdir failure routine (the red-evidence construction fact) — how is A's call; the silence of all rmdir failures is what the criterion and design rule out.

## Nits

### N1 — the echo writes are synchronous and can block the process

`writeSwallowingEpipe` in `src/run-check.ts` uses `writeSync` in a loop. Before the leaf, `process.stdout.write` buffered asynchronously: with a reader that is alive but not draining (pipe buffer full), the event loop stayed alive and only exit was delayed; now the whole process blocks inside the echo, freezing any concurrent async work. Deferred because: the publish (kept file, `check_end`, unlinks) completes before the echoes, harnesses normally drain tool output continuously, and the EPIPE fix required surfacing the error at write time. Promoted by evidence of a real harness (or the verify-pass chain) leaving a pipe undrained while the writer still runs.

### N2 — shells orphaned by an akrogon process inside `akrogon/<t>` escape every future sweep

After relocation, anything an akrogon process spawns lands in `akrogon/<t>`. If such a child is a shell that disowns orphans (setsid), those orphans live in `akrogon/<t>`, which no sweep ever kills — the kill targets only `t-` cgroups, and populated `akrogon/<t>` dirs are the deferral signal, not a kill target. Deferred because the chain is narrow (akrogon spawning a bash that orphans children is not a mainstream flow today) and the design keys kills on `t-` deliberately. Promoted by a realistic flow that strands a long-lived process there past phase advance.

## Verdict

fix — one Fix (F1). Everything else traced clean: placement shell semantics, relocation order and failure posture, helper spawn placement and pid write under the lock, sweep enumeration and deferral logic, the recovered-shell predicate's confinement to the lost branch, the writer publish reorder, the agy PATH wrapper resolution of the terminal-inherited PATH, the timing-row schemas, and all three test files assert the criteria's own observables at real boundaries.
