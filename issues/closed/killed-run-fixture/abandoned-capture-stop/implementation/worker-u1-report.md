# Worker u1 report: abandoned-capture-stop, sub-brief 1

Commit: 69116075 run-check: shared flock on capture-out open description and abandonedCaptures

## Changed files and reasons

- src/run-check.ts
  - checkedRun: capture-out created with openSync('w'); its open description is
    locked via Bun.spawnSync(['flock','-s','0'], { stdin: capFd }) before the
    capture line and check_start write; capFd stays open through both unlinkSync
    calls and is closed in a finally covering refusal and throw paths. Non-zero
    flock exit throws FlockError before the command runs.
  - spawnLogged: capture gains outFd: number; stdout writes to the fd, outRead
    still opens the path for the replay read; both call sites pass capFd.
  - abandonedCaptures(folder): recursive Bun.Glob scan filtered by the capture
    name regex; skips non-blank cleared-<run>.md; probes with openSync('r') +
    flock -n -x on the fd (ENOENT skips, probe fd always closed); returns
    { out, err, cleared } absolute paths.

Brief deviation (verified equivalent): Bun does not pass extra parent fds to
spawned children (flock <parentFd> exits 65, EBADF). The fd is mapped onto the
helper's stdin instead, so flock -s 0 locks the same open description; probe
behaviour confirmed: contended lock fails while held, succeeds after close.

## Tests run

- bun src/akrogon.ts run-check --name typecheck -- bun run typecheck
  -> check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-typecheck-1793194603437-2414347.log
- bun src/akrogon.ts run-check --name durable-capture -- bun test tests/durable-capture.test.ts --timeout=30000
  -> check durable-capture: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-durable-capture-1793194553282-2268706.log (5 pass)
- bun src/akrogon.ts run-check --name run-check-test -- bun test tests/run-check.test.ts --timeout=30000
  -> check run-check-test: 0 /home/ivan/Work/infra/akrogon/issues/open/killed-run-fixture/abandoned-capture-stop/implementation/check-run-check-test-1793194555601-2270096.log (24 pass)
- tests/abandoned-capture.test.ts (diagnosis only, not run under run-check):
  live pair PASS, probe PASS, refusal test RED as planned until the phase gate lands.
- Ad-hoc script (deleted): abandonedCaptures returned exactly the two abandoned
  pairs; live-locked, non-blank-cleared, orphan-err and dangling-symlink cases
  skipped; probe created no file.

## Known limitations

- flock helper must receive the fd on a stdio slot because Bun exposes no
  inherit-extra-fds option; the locked description is identical either way.
- The phase gate that consumes abandonedCaptures is a different unit; the
  refusal test in tests/abandoned-capture.test.ts stays red here by plan.

## Unverified criteria

- None. Criterion 4's byte-order/content claim holds under durable-capture
  (5 pass). abandonedCaptures is exercised directly since the planned tests
  only reach it through the not-yet-built phase gate.
