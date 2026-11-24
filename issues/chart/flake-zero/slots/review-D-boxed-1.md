# Slot D boxed-tests review, round 1

Verdict **fix** for `c65d03cd` on `7aafd2eb`.

- **F1. The wrapper rewrites test arguments containing environment references.** A regex matching the literal `${HOME}` passed through direct `bun test`, but `bun run test` reduced it to an invalid regex. I added `--expand-environment=no` in a disposable package and the same invocation passed. See `package.json:6`. [systemd-run manual](https://freedesktop.org/software/systemd/man/latest/systemd-run.html)
- **F2. The environment instructions need a usable invocation.** `PATH` and `HOME` reached the service, but a caller-only variable did not. Appending `-E NAME` to `bun run test` sent it to Bun, which rejected it. Passing it to `systemd-run` before `--` worked. The wrapper also needs the host user bus. I replayed the bus setting from `run-check` and the wrapper failed before launching Bun. Document where to add `-E` and keep direct `bun test` for the already-contained checks that cut the bus. See `tests/AREA.md:6` and `src/run-check.ts:81`.
- **F3. The interruption guarantee is broader than the service's cleanup.** Killing the main process cleaned up a child that used `setsid` and ignored TERM and HUP. Killing the `systemd-run` launcher left both the service main and the child live. The one-hour runtime cap still applies. State that cleanup follows the service's Bun process, and that stopping `akrogon-test.slice` stops all boxed runs. Processes started in separate units retain their own cleanup. See `tests/AREA.md:6`.

I found no tracked executable caller of the package test script. Verify invokes Bun directly at `issues/config.yaml:9`. The unit suite preload sets its own scratch paths and fixture environment. The e2e entry points still require their documented variables.

All seven `cli-help` tests passed through `bun run test`. The wrapper preserved a failing Bun test's status 1, and the same service flags preserved a deliberate exit 17 and both output streams. On systemd 262, SIGKILL of the service main returned 255. The fault probes used private units, and diff check passed.
