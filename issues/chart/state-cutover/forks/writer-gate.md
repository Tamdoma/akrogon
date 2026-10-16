# Writer gate

## Question
Q1. What keeps the one-time move to `~/.akrogon` from running while an old command still writes the tool root, now that the cwd scan blocks it forever?

### Carries
- INTAKE F1-F5.
- Map files: slots/map-A.md, slots/map-B.md, slots/map-C.md, slots/map-merged.md, slots/map-rebuttal-B.md, slots/map-rebuttal-C.md.

## Findings
- (A,B,C) The cwd test is the false-positive class: about 20 shells and chart sessions in the root block the move and none writes state (src/state-home.ts:85-110, tests/state-home.test.ts:144).
- (B rebuttal F1-F4) Every narrower scan still guesses: matching any in-root argv catches `peer-wait.ts`; an mtime cut lets a deferred new command keep old paths; unreadable processes may keep the host blocked; other-tree commands can point `AKROGON_HOME` at the source.
- (C rebuttal) Match only the executed entry: argv[0], or the first non-option argument of bun/node, resolved through symlinks.
- (A) What actually writes the old home, checked on main 83b9279: every state write runs under the tool-root `.lock` or a slice lock, which the move holds for its whole copy (src/state-home.ts:150-159). Paths resolve per call through `globalHome()` (src/config.ts:197-202, src/admission.ts:40, src/reconcile.ts:94), so a command that runs after the move lands writes the new home. A live run record defers the move (src/state-home.ts:46-62). The guard's only late write is `rm -f <old record>` (src/scope.ts:76): it removes an ended record from the old home, harmless. `init` writes config without the lock (src/init.ts:55-92) and can run on a configured host to register a repo (B final F1).
- (B final F1) Two current-code writers sit outside the locks during the copy: `init` (above), and an admission that creates a slice lock the move did not enumerate (src/admission.ts:43-46, src/state-home.ts:143-149) and publishes a record between the last `settled()` and publication (src/state-home.ts:129-136). The window is the copy time; the loss is one run record or one registration missing from the new home.
- (A) The other writer outside those covers is an akrogon process that started before the tool root got state-home (02:55 local) and is still alive. Measured 03:14 local: no bun process running akrogon code exists on this host. State-home moves the tool root once per host, and the host has one tool root.

## Options
- O1 Delete the process scan. The move waits only for live run records and the locks it already takes. The door checks once, at the cutover, that no akrogon process older than state-home is alive. Cost: no guard for a pre-state-home process that a future host might still run; none exists here.
- O2 Keep a scan, narrowed to the executed entry point plus a start-time cut (C). Cost: about 40 lines of /proc parsing that B shows can still misjudge both ways.
- O3 B's writer inventory with a startup barrier and per-process home attribution. Cost: the most code, for a move that runs once.

## Taken
2026-10-16, A on operator autopilot delegation ("I want you to do the charting yourself with slots just like what we've been doing so far, only you decide for me"): `1a` (O1).

Delete `foreignProcess` and its ancestry helpers. `settled()` becomes "no live tool-root run record". Locks, copy, recheck, config-last publication, relative-repo rewrite and the `AKROGON_HOME` override stay. The cwd-deferral test becomes "a process holding the tool root as cwd does not defer". Reason: it deletes the fragile part instead of guarding it, the move runs once per host, and the lock plus live-record checks already cover every current writer. Foreclosed: O2, O3. B's final F1 and direct review F1, applied in code (2026-10-16, review-B-2): admissions hold the active home's `admission.lock` shared; the move holds the tool root's exclusively, so no admission straddles it and the move no longer enumerates slice locks. Rollout (review-B-3 F1, review-B-4 F1): commands loaded before 568556b take no barrier, including ones started after state-home. The door enforces the exclusion with the gate that already exists: a live tool-root run record defers every move (`settled()`).
1. Hold: the door starts `akrogon run-check --holder <chart>/direct --name cutover-hold -- sleep 3600` in the akrogon root and confirms its live record in the tool root's `runs/`. From here no command, old or new, can move state.
2. Deploy: push the tested SHA; `akrogon next` in the akrogon root deploys it to the tool root (self-update, src/next.ts:1385). Every launch after this loads the barrier code. Note the deploy time.
3. Drain: wait until no bun process whose argv runs akrogon and that started before the deploy time is alive, except the hold. The hold itself admitted before any copy and makes no further admission; its end writes `ended` before the gate opens, and its guard's late `rm -f` of that ended record is harmless.
4. Release: end the hold by killing its `sleep`; confirm its record reads `ended` or is gone. The next command, from barrier code, moves state.
5. Read back: `~/.akrogon/config.yaml` exists, `akrogon status` works, config repos match the tool root's (no `init` raced).
Leaves keep running throughout: their launches during steps 1-3 defer on the hold, and every launch after step 2 takes the barrier.
