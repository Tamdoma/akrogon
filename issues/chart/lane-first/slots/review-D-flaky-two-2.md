# Slot D review, flaky-two, round 2

Verdict fix

- Base `1f3f0622824783e230742e41c4cf173272032e40`
- Previous head `815a1d92ad482c1c0ad0af454f70c3ae388d0c0e`
- Head `587e19097713f02035262955296e70f3b545add0`

1. **F1 fixed.** The hook registers in each calling file (`tests/hc-fixture.ts:24–33`). Three files on one worker each left a core for their teardown. The next file found the preceding sockets gone with both the default runner and `--parallel=1 --no-isolate`. In a separate two-worker probe, one worker's core answered `hc ls` after the other worker cleaned up.
2. **F2 fixed.** The reset waits share a deadline set before fixture setup (`tests/door-reset.test.ts:136–168`, `:211–218`). In the original 35-second delay probe, the helper exited at 36.5 seconds and the missing-turn wait rejected at 90 seconds. The fixture was gone and the inotify watch count was zero in `afterEach`.
3. **F3. A filesystem change can make the listener start a stopped hc core.** `src/listen.ts:128–130` treats any event naming a socket as a possible startup, and `:146–151` follows the named session even when its socket refuses. `follow` invokes `hc events` (`src/hc.ts:382–388`), which can start a core. In an isolated runtime I left behind a refused Unix socket, started the listener, then changed only the socket's mode. The previous listener left it stopped. Head made the socket accept connections by starting a new core. A separate bind-before-listen probe confirmed the new scan handles the intended startup window. Use a passive readiness check for that window before starting the event client.

The heartbeat fix passed a real hc probe. The previous fixture failed on the first heartbeat at 15 seconds, and head received the subsequent status event at 17 seconds. The `hc-start` file passed in the configured test run. Its sleeper starts inside the leaf slice before B is killed and teardown stops that same slice.

The 38 touched test files ran with `--timeout=120000 --max-concurrency=5 --parallel=4 --no-isolate`. 728 passed and two failed. The idle-gap timer test hit the known due-5 race in the separate flaky-wait work. The live-tab `.env` test passed on isolated reruns of both base and head, and the full-run failure was not reproduced. `git diff --check` passed.
