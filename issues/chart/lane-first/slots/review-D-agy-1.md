# Slot D review, agy-reset, round 1

Verdict ready

- Base `c4cf74a73b4ebdfea87f1af1d570b01059cdb193`
- Head `16c85dae017c581ba5806edbd1c1194776dafc63`

`startA` waits for `working` before the test starts the helper (`tests/door-reset.test.ts:163–168,273–277`). On base, that status could arrive before agy created the database and opened the presence lock that the resolver uses (`tests/door-agent.ts:81–92`, `src/transcript.ts:136–142`). A 1.5-second delay before the initial open reproduced `started: transcript unknown` and the missing reset stages.

On head, the same delay yielded `started: queued` at boundary 1 with all reset stages passing. All four harnesses enter through the held first task and synchronously write its prompt before reporting `working` (`tests/door-agent.ts:109–116,147–157,197–224`). Claude's rename and clear paths are exercised later against an already-open transcript. Pi's stale-label and other-session checks still run and the fixture creates the folder before those checks use it (`tests/door-reset.test.ts:389–405`).

All 16 tests in `tests/door-reset.test.ts` passed with `--timeout=120000 --max-concurrency=5`. `git diff --check c4cf74a7..16c85dae` passed.
