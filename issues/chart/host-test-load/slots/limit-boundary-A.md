# Fork notes A: limit-boundary (written before reading B/C)
Pick 1a, with the seat scope adopting the already-started seat PID (seats start via `herdr agent start --kind`, src/next.ts:609-625, argv[0] must equal the kind, src/next.ts:273, so a systemd-run prefix in the harness template is refused). Reason: only a cgroup around the seat contains ad-hoc runs and detached browsers (blepsis cdp-core.mjs:628-629). Cost: Linux/systemd only; adoption mechanism needs a probe.
Rejected 1b: bypass seen in the incident (/tmp/u3-run.sh). 1c: throttling turns overload into timeouts. 1d: counts panes not workers.
Evidence: Bazel `--local_test_jobs` and `exclusive` tag (bazel.googlesource.com dffb6ee9), Skia marked emulator tests exclusive (skia buildbot 87c6f30a); practitioner tier. systemd.scope(5) man7.
Pitfalls: nested permit (base-run inside run-check) removed by an inherited hold token; lock fd inherited by browsers removed by `flock --close` or a permit tied to the scope being empty.
