# Slot D review, round 2

Verdict `fix`

Base `9c6ae0db739efcde19edff0d1b173da0ab7b234d`  
Head `e80e3be507cbf55279214ab78fd73a999d44b556`

**F4 · `src/verify.ts:901`.** A repo can still override the verify service's cache flag. Put `NODE_DISABLE_COMPILE_CACHE` in `pass_env`, export `NODE_DISABLE_COMPILE_CACHE=0`, and run a fresh `akrogon verify --holder <path>`. The captured service launch emits `--setenv=NODE_DISABLE_COMPILE_CACHE=1` followed by `--setenv=NODE_DISABLE_COMPILE_CACHE=0`. A real `systemd-run --user --wait --pipe --collect` with those arguments and `printenv NODE_DISABLE_COMPILE_CACHE` returned `0`. Commands launched directly by the service, such as checkout hooks, therefore receive `0` and violate K1's required value. Node 26 treats `0` as disabling the cache. The configured check in the fixture still passed its assertion for `1`, since it reaches `constructedEnv` separately.

F1 is fixed at `src/land.ts:44`. F2's missing service setting is present, with the configuration override remaining in F4. F3 is fixed at `src/run-check.ts:76` by applying the setting after repo env copying. Verify's setup, sequential checks and parallel merge checks still reach `checkedRun` and its constructed environment (`src/verify.ts:680`, `:711`, `:739`).

`env -u NODE_DISABLE_COMPILE_CACHE bun test tests/run-check.test.ts tests/green-merge.test.ts` passed all 45 tests. In an isolated copy with round-one source, the new override assertion failed with `cache=0` and the new land assertion failed on the missing flag. With base source, the original new run-check assertion failed with `cache=`. Both `Test-Change` trailers match their additions, and all pre-existing assertions are intact.
