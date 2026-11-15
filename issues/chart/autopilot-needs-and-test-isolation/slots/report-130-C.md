# Fork notes: report-130, slot C

## Q1 — pick: a cause remains; #130 is not delivered

The reported symptom (30 s per-test timeout under load) is gone under pure CPU load — A's 5 runs at load 19–30 were flat at ~15 s (evidence logs), and the full `test` check passed in 55 s. That clears the leaked-units channel: reconcile's `systemctl list-units`/`show` calls (src/reconcile.ts) read the whole unit table; `97034315` keeps test cores out of the real runtime so the suite adds ~0 hc-shutdown units, and the operator cleared the 32 k backlog.

But a cause remains that CPU burners cannot reach: the shared host slice. `leafSlice({name:'repo'}, slug)` (src/scope.ts) hashes `repo.name + slug`. Every fixture registers `repos: {repo: root}` (tests/helpers.ts:76), so every run of `hd-send` on this host — this suite's own `--parallel=4` sibling files excluded only because slugs differ, but any second `akrogon verify` on any leaf — lands its seat scopes in the same `akrogon-l<hash>.slice` in the real user manager (core PATH carries `tests/core-bin/systemd-run`, which execs the real `systemd-run` with `XDG_RUNTIME_DIR=/run/user/$uid`; `firstTask` then checks `/proc/<pid>/cgroup` ends with that slice). Every teardown calls the host's `systemctl --user stop` on that slice, killing all scopes in it — including another run's live seat.

## My line-145 fail at ~10:10 — overlap, yes

B's focused run of the same slug was in flight in the same window (map-B.md line 19 documents running `-t 'pinned copy|a working seat'`; map-B.md written 10:12:37, my run just after `uptime` at 10:09:58). B's teardown stopping `akrogon-l<hash(repo/hd-send)>.slice` mid-my-run kills my stand-in scope; a `send` to the dead seat then reads `started:true`-or-killed inconsistently and a task count lands wrong — the `toHaveLength(2)` failure at 10.6 s, half the normal duration, fits a mid-test kill exactly. Medium confidence on the timestamp, high confidence on the mechanism: it is the only host-global mutable state the test touches, and B's own map warned identical slugs interfere across runs.

This also reframes #130's original observation: the leaf's five failed verifies ran while other verifies ran — concurrent verifies of different leaves execute this same file with the same slugs. The slice collision, not load scaling, is the surviving cause.

## Q2 — pick: make the run's host-global footprint unique; keep every assertion

One change covers it: the fixture's repo name (the `repos` key → `repo.name`) becomes unique per fixture, e.g. derived from the fixture home, so `leafSlice` hashes a different slice per run. Teardowns must read the name from the fixture's config instead of the hardcoded `{name:'repo'}`. That removes the cross-run kill for every slug in the file at once — `hd-silent`, `hd-done`, `hd-agy`, `hd-status-retry` included, so the sibling is in scope by construction (signpost 3a: the boundary the report directly implies is "the run's host-global resources").

Keep all assertions and the real-core proof. No scenario split (each scenario still waits out hc's send confirmation — splitting moves the flake), no shim-controlled `started:false` (the unavailable shim models a refusal kind, not the start-confirmation path; fabricating `started:false` would make the settle/settlement asserts circular — the test would prove its own stub).

Done-criterion without a wall-second cap: two concurrent executions of this file on one host both pass every assertion (the stated property is independence between runs, not speed), plus the configured `test` check green. The load demonstration A already ran supplies the flat-timing evidence; the criterion should not name seconds at all.

## Rejected options

- "Delivered, close naming `97034315`": clears the leak channel but leaves the slice collision live and reproducible — two verifies today can still red each other. Closing now re-creates the report.
- Split the reported test into two scenarios (B's O1): same total wait windows, same per-pass costs; only moves where the 30 s is spent. The collision fix makes splitting unnecessary.
- Shim-controlled negative delivery reply (B's O2): circular for `started:false`; the shim already models `unavailable`, a different kind. Keep the real boundary.
- Per-test timeout raise or product-wait change: excluded by signpost 2a, and the recorded revert (233d01ca→75f61f00).
- Teardown stopping only its own scope instead of the slice: halves the blast radius but still shares the slice (list-units, naming); unique repo name is smaller and total.

## Evidence

- better-than-training: `src/scope.ts` `leafSlice` (hash of `repo.name/slug`); `tests/helpers.ts` `fixture()` `repos: {repo: root}`; `tests/hc-delivery.test.ts` teardown `spawnCaptured(['systemctl','--user','stop', leafSlice({name:'repo'}, slug)])` — no env, hits the host manager; `tests/core-bin/systemd-run` (real systemd-run, real runtime); `src/seat.ts` `firstTask` cgroup check. Read 2026-11-09.
- measured: A's 10-run flat timings and 55 s full check (evidence/ logs, 10:18); my own runs: fail 10.6 s at ~10:10 (overlapping B's same-slug run), pass 14.9 s at ~10:14.
- history: learnings 2026-11-08-hc-shutdown-unit-leak (verify reds tracked the unit table; 5/5 failures under concurrent verifies matches the collision too).

## Pitfalls

- Unique repo name must reach `leafSlice` in teardowns — hardcoding the new name reintroduces the collision; derive it from the fixture.
- The fix must survive two `akrogon verify` runs of different leaves (fresh checkouts, same slugs) — per-fixture uniqueness covers it; per-slug or per-suite uniqueness does not.
- Do not let the leaf also "improve" the ~15 s fixed wait — that is hc client behavior outside signpost 2a scope.
- A unit-count precondition in the test would be machinery the standing design refuses; the fix removes the cause instead.
- My earlier map line claiming a "send race" was wrong — attributed to collision now; the rebuttal round may need to correct it if A merged it.

## Question the fork does not ask

Does the same shared-slice hazard reach other test files that call `systemctl --user stop` on a `{name:'repo'}` slice (session-routing.test.ts teardown, others)? If the leaf names the boundary "this file's host-global resources" it is out of scope; naming it "any test's host-global teardown" pulls sibling files in under one fix. Worth deciding in this round since it sets the leaf's file list.
