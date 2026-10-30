# Fork notes, slot A: killed-run-stop (written before reading B's notes)

## Q1
- Pick (a) loud refusal at `akrogon phase`. The capture pair is already a durable per-run record written before launch (`checkedRun`, run-check.ts) and holds the printed IDs, so the stop needs no new state, no timer and no credential. It catches every death cause because it keys on the leftover, not the killer. Cost: nothing cleans until a seat returns to the leaf; the leaf is held until then.
- Reject (b): covers wrapper death only, reverses the #120 Off-route ownership line, lets a hung test outlive its caller, and SIGKILL or reboot still leak. Reject (c): an independent janitor is a watchdog (lock 2026-09-18) and needs cleanup credentials outside the leaf grant. Reject (d): the "stopped or killed run is incomplete evidence" line already exists in check-issue and implement-issue SKILL.md and did not stop this.
- Evidence: better-than-training, measured 2026-10-28 bun 1.4.4: SIGTERM ends `bun test` with no `finally`. `startRunGuard` (scope.ts) stops the run scope on wrapper death.
- Pitfalls: the refusal blocks the exit a seat needs when cleanup cannot be done; removed by leaving moves to `failed` open.

## Q2
- Pick: a pair is live when any process holds that capture file open, read from `procRoot()`/*/fd. The wrapper holds read fds on both files (`spawnLogged` openSync) and the child holds them as stdout/stderr, so a live run of any kind, nested included, shows; a reboot, a SIGKILL or a finished stop shows none.
- Reject admission records (`liveRuns`): nested runs have none, and `startRunGuard` removes the record before the scope stop ends, so a still-dying test reads dead. Reject owner `.lock` probing: the shared lock is per owner, not per run.
- Pitfall: a scan cost on every move; bounded by scanning only when the leaf folder holds a pair.

## Q3
- Pick every leaf (one rule, no readiness read; a killed non-fixture run is cleared by one rename). Move to `failed` and operator recovery from `failed` stay open. Clear: the seat cleans what the pair printed under the leaf grant, records the result in its own review or report file, then renames the pair to `killed-<name>-<run>-{out,err}.log`, so `akrogon log` and `pack` still read it.
- Reject a new clear command: adds a surface for a plain rename.
- Pitfall: renaming without cleaning; nothing mechanical removes it, the record line in the seat's file is the evidence the reviewer reads.

## Questions the fork does not ask
- The owning leaf owns a loud refusal for the seed's lesson; its retirement criterion names the seed's history path, conditional on that file existing on its base.
