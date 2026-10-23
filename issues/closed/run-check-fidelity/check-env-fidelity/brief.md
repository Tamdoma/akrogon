# Brief: check-env-fidelity

## What

`akrogon run-check` hands the checked command its arguments unchanged and a UTF-8 locale, and the guide states the two host facts checks depend on: systemd 254 or later, and a gh token that does not need the session bus. (A,B,C)

1. `runUnitArgv` (src/scope.ts) passes `--expand-environment=no` to systemd-run, so `${…}`, `$NAME` and `$$` in the caller's argv are no longer rewritten.
2. `constructedEnv` (src/run-check.ts) sets `LANG=C.UTF-8` before it copies the repo's `env` and `pass_env` names, so a repo that lists `LANG` keeps its own value.
3. docs/guide/install.md requires systemd 254 or later. docs/guide/setup.md's `pass_env` bullet, which already says checks run with the session bus cut, adds that the cut also hides keyring-stored credentials, so gh must keep its token in its own file (`gh auth login --insecure-storage`) or the repo declares `GH_TOKEN` in `env` or `pass_env`. (A,C)

## Why

#112: systemd-run in scope mode expands `${NAME}` anywhere in an argument and `$NAME` as a whole argument, so inline `bun -e` template literals and `sh -c '${VAR}'` reach the command as empty strings. #111: checks get no locale, so a JVM takes ASCII as its path encoding and Maestro cannot create a folder for a flow named `Četiri kartice`. #110 (credential part only; its mise shim hang stays open and uncovered, so #110 is not in this leaf's sources (A,B,C)): the session bus is cut on purpose (test browsers stay in akrogon's cgroup), which also hides keyring-stored gh tokens, and nothing tells a consumer that.

## Done-criteria

1. A command run through `akrogon run-check` in a real systemd run unit receives the arguments `a ${base} b`, `${file.key}`, `$HOME` and `$${x}` byte for byte, and so does the same command run by a nested `akrogon run-check` started inside a live run. Proof: own test through the real systemd-run, run by the `test` check. Chart proof P1 covered all four arguments on systemd 262, `$${x}` included (unflagged it became `${x}`), so no further probe is needed. (A,C)
2. A command run through `akrogon run-check` for a repo that declares no locale sees `LANG=C.UTF-8` and counts `Č` as one character (`printf 'Č' | wc -m` prints 1); for a repo whose `pass_env` lists `LANG`, the command sees the caller's `LANG`. Proof: own test, run by the `test` check.
3. docs/guide/install.md lists systemd 254 or later, and docs/guide/setup.md's `pass_env` bullet names file token storage (or a declared `GH_TOKEN`) as what gh needs under the session bus cut. (A,C)
