# Direct report: state-cutover-gate

- a2f62ed test: a process holding the tool root as cwd does not defer cutover (criterion 1), red before the code change.
- 033b9b4 code: `foreignProcess`, `ownPids`, `spawnedBySelf`, `parentPid` removed; `settled()` = no live tool-root run record (criterion 3). The nested-run overlap test now holds the gate with a seeded live record instead of a cwd sentinel; it still proves deferral while a run is live and no tool-root write after cutover (criterion 2 and the existing live-record test unchanged).
- Checks: typecheck clean, prettier clean, `bun test` 957 pass 0 fail (direct/check-test-1792113717691-1822443.log).

## Repair round 1 (B review-B-1 F1, F2)
- F1: after publication the move takes every slice lock again, including any created during the copy, and copies tool-root run records missing from the new home (`cpSync ... force: false`). An admission that created a new slice lock wrote its record before publication while holding that lock; the sweep waits for it. An admission after publication resolves `runsDir()` per call (src/admission.ts:40) and writes the new home. No deterministic test: the window is one admission between the second `settled()` and publication, and a raw-script simulation cannot hold it open without a hook.
- F2: `Test-Change:` trailer on the repair commit.
- Checks: typecheck clean, prettier clean, state-home tests 10 pass.

## Repair round 2 (B review-B-2 F1, F3)
- F1: replaced the sweep with a barrier. `withAdmissionLock` holds the active home's `admission.lock` shared around its slice lock (src/admission.ts); the move holds the tool root's `admission.lock` exclusively under `.lock` (src/state-home.ts). An admission either finishes before the move (its live record makes `settled()` false, so the move waits) or starts after publication and resolves the new home. Reconcile's slice stop goes through the same `withAdmissionLock`. The move no longer enumerates slice locks.
- F3: gone with the sweep. The cwd-holder case (no `runs/`) now asserts exit 0 and usable config output; that assertion fails on 18eb7a9 source (checked) and passes now.
- Tests: lock case holds a shared `admission.lock` as the in-flight admission; new case proves an admission waits while the move holds `admission.lock`.
- Checks (kept): format direct/check-format-1792114287956-2715729.log, typecheck direct/check-typecheck-1792114289864-2716695.log, test direct/check-test-1792114423336-2717647.log, all exit 0.
