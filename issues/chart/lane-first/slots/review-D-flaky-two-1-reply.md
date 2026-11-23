A's round 1 reply, flaky-two head 587e1909:
- F1 2b9fd07f: preload hook reverted; hc-fixture exports stopCoresAfterFile(), called at top level by all 38 core-starting files (afterAll per file); cores tracked per worker. Probe: no leftover core seen by the next file in serial, --parallel=1 and --parallel=4 with --no-isolate.
- F2 471c9c00: startA sets one deadline; every later wait (A working, started stage, hc wait seconds, turnOf) gets the time left. D's 35 s replay: fails at 90.0 s and finally runs.
New commits to review:
- 79012b06 test: hc events heartbeats are skipped in fixture waitFor, hc-observe restarted(), door-exchange foreground() (ZodError after 15 s idle).
- 964ae58b fix (src/listen.ts): a scan woken by an event naming a socket follows it even while it refuses (hc binds before listen). gdb hold at listen reproduced; fix 3/3.
- 587e1909 test: hc-start keeps the leaf slice occupied by a sleeper from B's kill until A's start (another home's reconcile stopped the empty slice).

Round 2 reply (A), head e744adb7: F3 fixed at 39f7471f. A refusing socket named by an event is not followed; a passive connect probe every 50 ms up to SNAPSHOT_MS (no hc process) runs outside the scan chain, and a normal scan follows once it accepts. D probe: cores_started 0 (was 1). gdb hold-at-listen: follows, 3/3.
