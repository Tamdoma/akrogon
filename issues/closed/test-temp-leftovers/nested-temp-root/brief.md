# Brief: nested-temp-root

## What

`akrogon run-check` passes `AKROGON_LEAF_TEMP_ROOT` and `AKROGON_RETIRED_TEMP_ROOT` from its caller into the checked command's env, beside `AKROGON_HOME`, in `src/run-check.ts` `constructedEnv` (the `copied` list). A nested akrogon call inside a checked command then resolves the same leaf temp root as its caller. When the caller holds neither name, nothing changes, which is the production default.

## Why

akrogon's own test suite leaves empty `/var/tmp/akr-<uid>/<hash4>/<hash8>` dirs on the host every run: four per run, about 2,900 in two days. The suite preload points `AKROGON_LEAF_TEMP_ROOT` at a per-worker scratch root, but `constructedEnv` drops that name. A nested `akrogon run-check` inside a checked command (`tests/state-home.test.ts`, `tests/run-permit.test.ts`) falls back to the default root. `ensureLeafTemp` creates the leaf dir there, and the run removes only its own `run-*` dir. `src/verify.ts` `passForwarded` and `src/land.ts` `launchLand` already forward both names. run-check is the one boundary that drops them. The product host sweep keeps unregistered dirs on purpose (#151), so nothing ever removes these.

## Done-criteria

1. A nested `akrogon run-check` run inside a checked command, in a repo whose `issues/config.yaml` lists neither `AKROGON_LEAF_TEMP_ROOT` nor `AKROGON_RETIRED_TEMP_ROOT` in `env` or `pass_env`, receives the caller's values of both names and creates its run dir under the caller's leaf temp root. After the run, the default-root leaf dir for that repo and slug (`/var/tmp/akr-<uid>/<sha256(repo root)[0:4]>/<sha256(repo root + "\n" + slug)[0:8]>`) does not exist. The nested call's checked command records the values it received, and the test compares both to the caller's. Proof: own test through the CLI, failing on the base and passing after the change. (A,D)
2. A repo config that already lists `AKROGON_LEAF_TEMP_ROOT` in `env` or `pass_env` still parses, and its checked command still receives the caller's value. Proof: the existing run-check tests that declare it, run by the `test` check.
