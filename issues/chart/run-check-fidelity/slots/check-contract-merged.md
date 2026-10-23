# Merged notes: check-contract (run-check-fidelity)

Sources: slots/map-A.md, slots/map-B.md (C1-C3), slots/map-C.md (G1-G2).

## Q1 argv (#112)
- 1a add `--expand-environment=no` to `runUnitArgv` (src/scope.ts:43-60) (A,B,C). Removes the transformation for every caller. Cost: requires systemd >= 254 (B); install docs state only "a systemd user manager" (docs/guide/install.md:14), so the leaf adds the version floor there (B Q3). C said "since ~v233"; B cites the installed man page saying 254 (B correct per man page; A accepts).
- 1b escape each argv item as `$$` (B rejects: encoding layer, double escape risk).
- 1c document "avoid `${`" (A,B,C reject: trap stays).
- Evidence: man systemd-run 262 `--expand-environment=BOOL`; probe 2026-10-22 (A): without the flag `[a  b] [] [/home/ivan]`, with it `[a ${base} b] [${file.key}] [$HOME]`. Nested runs spawn directly (src/run-check.ts:229-231) and are already literal (A,B,C). land.ts:19 and scope.ts:67 pass no caller argv (A).
- Pitfall: a fake-argv assertion cannot prove the real transformation is gone (B). Removed by: the proof runs through real systemd-run, as tests/run-units.test.ts already does (A).

## Q2 locale (#111)
- 2a set `env.LANG = 'C.UTF-8'` in constructedEnv before the env/pass_env loop (A,B,C). Deterministic across callers; a repo can still override by listing LANG/LC_ALL in env or pass_env. glibc 2.44 here; `locale -a` lists C.utf8 (A).
- 2b copy caller LANG/LC_* (A,B,C weaker: evidence depends on the seat's session).
- 2c docs only (A,B,C reject).
- Evidence: src/run-check.ts:34-43,56-67 (no locale). Probe 2026-10-22 (A): `env -i sh -c 'printf Č | wc -m'` prints 2, with LANG=C.UTF-8 prints 1. JDK claim is intake (B).
- Pitfall: the proof should create and read a non-ASCII filename, not grep Java properties (B).

## Q3 gh credentials (#110)
- 3a no code; docs say checks run with the session bus cut, so keyring-backed credentials are unreachable; gh must store its token in its own file (`gh auth login ... --insecure-storage`), per the 2026-10-13 operator decision in issues/closed/host-test-load/leaf-stop/design.md "Addendum after proof T1" (B). A and C first proposed GH_TOKEN via env/pass_env; that decision foreclosed akrogon copying GH_TOKEN, while a consumer declaring its own pass_env name stays an existing option. Merged: docs name file storage as the requirement and pass_env/env GH_TOKEN as the existing alternative (A adopts B).
- 3b restore the bus or proxy it (A,B,C reject: Chrome escapes the leaf cgroup; proxy is new machinery and was foreclosed).
- Evidence: probe 2026-10-22 (A): `env -i HOME PATH DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent gh api repos/<private>` -> 404; same with GH_TOKEN -> `private`. src/shell.ts:83-84 notes akrogon's own gh calls get the real bus back.
- mise shim hang: Off route (A,B,C). Host shim issue; the run guard stops the scope when the wrapper dies (C, src/scope.ts:63-80); a run deadline is a product change with no agreed limit (B,C).

## Q4 split
- 4a one leaf with three criteria (A). Three small edits; one lifecycle.
- 4b separate leaves, serialized on run-check/scope (B). C groups argv separately from env as charts.
- A pick reason: the outcomes are independently checkable, but each is one or two lines; three lifecycles cost three plans, reviews and merges for no parallel gain since they would serialize anyway (B's own note).

## Differences
- C's systemd version (v233) vs B's (254): man page says 254.
- Split: A one leaf; B separate leaves serialized; C two charts.
