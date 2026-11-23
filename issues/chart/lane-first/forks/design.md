# Design: lane-first

## Question

Final shape for P5 (land CPU share), host-relative slice memory and merge backpressure, after land-own-reds, run-scratch and run-ram landed.

## Findings

slots/design-B.md, slots/design-C.md.

- All three still pay. Framework hit 12 leaves in merge at once with max_active 3, dwell p50 68.5 min (C); 55% of attempt starts had 3+ in merge (B). P5 can win up to about 18% of a land (B); 80% of recent framework merge runs overlapped an akrogon verify at equal weight (C).
- The CPU controller is off inside akrogon.slice today (subtree_control = memory pids), so a weight on any child turns it on (B, host).
- The red rate is the biggest lever and outside this chart: 22 of 37 framework merge runs red after land-own-reds; five test names recur (B F3).
- 9,766 akrogon-l*.slice units are loaded, 3 with tasks. The reconcile comment at src/reconcile.ts:1263-1267 still describes stopping a slice that matches no leaf, but that branch was removed on purpose by land-own-reds (#151: other homes' slices). (B R1, A read)

## Taken

A's picks (full autopilot), 2026-11-23:

1. P5: new systemd/akrogon-land.slice with CPUWeight=1000 (child of akrogon.slice, so it keeps akrogon's memory limits and weight 20 against the desktop), linked in src/install.ts beside akrogon.slice. The land launch passes `--setenv=AKROGON_RUN_SLICE=akrogon-land.slice` (src/land.ts:36-41) and verify's pass uses runSlice('akrogon.slice') instead of the fixed name (src/verify.ts:932), so every scope of a land attempt (setup, checks, merge_checks, base runs) lands there through the existing override (src/scope.ts:18-24). The land service itself stays in the leaf slice. A seat's own verify stays leaf work. (B; C's three explicit sites reach the same scopes with more edits)
2. Memory: systemd/akrogon.slice MemoryHigh=50%, MemoryMax=75% (here 61.7/92.6 GiB vs today 64/96, 11% above the 54.9 GiB peak). (B O1; C's 60/80 is looser than today here, against signpost "headroom is a floor")
3. Backpressure: a repo's leaves in merge minus the landing one count toward that repo's own cap, only when refusing an unstarted leaf (worktree undefined); never for resuming an existing worktree or relaunching a check.repair seat, never toward the machine total. (B placement src/next.ts:406, C's unstarted-only gate)
4. Held leaves count like any waiter. (B Q2 O1)
5. The 9,766 empty leaf slices: one-time stop of empty akrogon-l*.slice units matching no leaf of this home, by A on this host before landing P5; which tests make them is traced under test-hygiene (likely test homes' leaf slices, the same leak class as P12). No reconcile branch: it would reopen #151. The stale comment at src/reconcile.ts:1263-1267 is corrected in the same change. (A; B Q3 O1 not taken for #151)
6. The red rate: B lists the five recurring framework test names; A seeds them to the framework repo per signpost "causes inside a target repo's tests are seeded to that repo". (B Q4 O1)

Proof: A1 akrogon-land.slice cpu.pressure per attempt and the slow third of lands toward 591 s; A2 akrogon.slice memory.events high stays 0; A3 framework leaves in merge at attempt start p90 from 6 toward 3.

### Final shape corrections (A, 2026-11-23, from slots/final-C.md)

- [3] start's second capRefusal call (src/next.ts:1258-1262) gets the same unstarted flag, and its message drops the now-false "leaves waiting in merge are not counted" for the repo cap. (C1)
- [1] The akrogon-land.slice link is planned only when the release has the file, like the listener unit (src/install.ts:49), so rollback to an older release leaves no broken link. (C2)
- [1] The land passes `--setenv=AKROGON_RUN_SLICE=${runSlice('akrogon-land.slice')}`, so a test that already set its own slice keeps its scopes in it. (C3)
- [1] `akrogon stop <leaf>` also stops the leaf's live run units and verify pass (records name repo and leaf, src/land.ts:185-186), the way src/stop-run.ts:27 stops one run; otherwise a stopped leaf's land suite keeps running in akrogon-land.slice and overlaps the next land. (B1, slots/final-B.md)
- [6] Seed only the names still recurring after land-own-reds: N1 and N4 (slots/final-B.md). N6 stopped after five runs in a row on 11-22 (one cause on main, not seen since); N2, N3, N5 stopped on 11-22.

## Hold truth from the cgroup (A, 2026-11-23, after D round 10 F16-F19; B and C both picked O4)

Refused stops: 0 real in ~24,000 run scopes over 9-30 days; every refusal was injected (B, C journal reads). The holes came from mirroring scope liveness into the record.
- A run record is live while its boot matches and either its writer PID lives or its scope's cgroup.events says `populated 1` (one file read under cgroupRoot(); ENOENT = gone). The `unstopped` flag goes. (B,C)
- end() stops the units and rethrows a failure without writing the record; the finally removes the record only when the scope is not populated. (B,C)
- sweepStale never writes a record: dead writer plus populated scope = try the stop and warn on failure; not live = delete the file. (B,C)
- The guard only stops the scope; it no longer deletes the record. (B; C kept a conditional rm, not taken: one fewer actor)
- stopRunUnits excuses a failed stop by the same cgroup read instead of `systemctl show`; the tests/helpers.ts systemctl shim goes, since a fake-runner scope has no cgroup and reads as gone. (B; C's env-gated shim not taken)
- state-home's PID-only liveness copy calls the same predicate. (B)
- Land hold records with synthetic units are never stopped by the sweep. (C)
