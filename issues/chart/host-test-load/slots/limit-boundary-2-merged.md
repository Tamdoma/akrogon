# Merged notes 2: limit-boundary after measurement

## Options
- Revised 1a (A,B,C): one host-wide permit in run-check/base-run plus every seat contained, with an explicit unreachable `DBUS_SESSION_BUS_ADDRESS=unix:path=/nonexistent` set in both the seat env at pane allocation and constructedEnv after the env/pass_env loop, and the name reserved so pass_env cannot reopen it (A,B,C; C: pass_env XDG_RUNTIME_DIR alone finds /run/user/1000/bus, so omitting the variable is not enough). DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR untouched (B,C).
  - No TasksMax as a working limit (A,B,C).
  - Ceiling kind differs: A,C soft only (CPUWeight low, MemoryHigh). B: CPUWeight is priority not a bound; choose between fixed budget (CPUQuota, MemoryMax emergency) and desktop priority as an explicit operator choice. Moved to ceiling-values.
- 1b / run-only containment (A,B,C rejected): incident bypass; C names it the fallback if the seat bus probe fails.
- 1c hard ceiling (A,B,C rejected on evidence: 41 core dumps at TasksMax 3000).
- 1d (A,B,C rejected).
- Browser-level counter (A,B,C rejected as sole): many launchers, tasks not browsers dominate (C); B keeps framework pool limits as a complement.
- Managing Chrome app-*.scope units (C rejected): operator's Chrome matches the pattern.
- Fake SNAP/FLATPAK (B,C rejected): changes unrelated behavior.

## Evidence
- Measurement and probe in fork (A,B,C). Chromium systemd.cc (A,B,C). run-check constructedEnv src/run-check.ts:41-56, reserved names src/config.ts:68-88 (B,C). Inheritance paths: pi worker-shell.ts:184-188, framework page-measure.mjs:265-313, blepsis cdp-core.mjs:563-628 (B). systemd private manager socket under XDG_RUNTIME_DIR, so scope control works without the session bus (B, systemd v262 bus-util.c). Meta cgroup2 pressure practice (B, practitioner).
- No dbus use found in akrogon src, pi extension, blepsis scripts, framework workflow (A,B,C); grep is not proof (B,C).

## Pitfalls and removal
- Other browsers (Chromium, Playwright headless-shell) unprobed: door probes each under the cut env, pending (A,B,C).
- A seat tool needs the bus (gh keyring, git credential helper, xdg-open): door seat smoke probe under the cut env, pending (B,C); C fallback: private session bus without systemd1.
- Manager control needs the private socket path, not the session bus (B).
- Single admitted run may still be too heavy past 2.5 min: full solo run unmeasured (B,C).

## Open questions raised
- Ceiling: fixed budget vs desktop priority (B) → ceiling-values.
- Framework cap on browser branches/pools in scope? B yes necessary, C permit 1 at load 12 may suffice, A fog.
- Stop must not touch operator's own Chrome (C) → stop.
- Operator-invoked browser work exempt? (C)
