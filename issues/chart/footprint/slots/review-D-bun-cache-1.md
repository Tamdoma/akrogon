# Slot D review, bun-run-cache, round 1

Verdict ready

- Base `b9fe502784d08ac2edbfcbf61fb515dbb9e4cef6`
- Head `09b4ef30c61339f4f0cbcac1f08619f0aa057a49`

The check environment sets `BUN_RUNTIME_TRANSPILER_CACHE_PATH` below its own `TMPDIR` after forwarding `env` and `pass_env` (`src/run-check.ts:62–79`). The new test passed on head and failed in two independent mutations. Pointing it to `other-cache` failed the default assertion, and moving the assignment before forwarding let the caller's `0` through and failed the override assertion (`tests/run-check.test.ts:214–252`).

A nested `run-check` probe wrote real `.pile` files, used distinct outer and inner paths, and removed both roots. A separate `verify --attempt` probe wrote entries in distinct roots for setup, a check, and a merge member, then removed all three. Framework's `test:route-verdicts` from the cheap lane passed all 12 tests through `run-check` at framework `5cc9735d58`, with its cache present during the check and removed at exit. Coverage for framework was limited to that check.

The existing publish-refused path retains the whole run root, including any cache it created, as specified in the brief (`src/run-check.ts:472–474`).

All 161 tests in `tests/run-check.test.ts`, `tests/durable-capture.test.ts`, `tests/verify.test.ts` and `tests/config.test.ts` passed with `--timeout=120000 --max-concurrency=5`. `git diff --check b9fe5027..09b4ef30` passed.
