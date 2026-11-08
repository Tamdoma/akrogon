# Brief: bugs that stopped leaves on 2026-11-08 (blind map, one file per slot)

Operator, verbatim: "That must not happen anymore, this is a crucial part. Those bugs MUST not happen, continue working with slot b consultant and slot c and slot d consultant to fix these bugs."

Repos: akrogon `/home/ivan/Work/infra/akrogon` (main `75f61f00`, installed release `~/.akrogon/releases/75f61f00...`), herdr-setup `/home/ivan/Work/infra/herdr-setup`. Read only; edit nothing. A leaf (herdr-sweep) is running in a worktree; do not touch it.

## Bugs with evidence

- K1 Listener died and stayed dead. `journalctl --user -u akrogon-listener` at 09:24 CET: `error: connect ECONNRESET /run/user/1000/herdr-core/aktaq9f-22.sock` (a test core closing), uncaught, exit 1; systemd restarted 6 times then `start-limit-hit`; dead ~23 min, so no turn-end pass ran and herdr-sweep sat in implement with no prompt until door A ran `akrogon next` by hand. Code: `src/hc.ts` `listening()` raises every probe error except ECONNREFUSED/ENOENT; `sessions()` probes every `*.sock` under `$XDG_RUNTIME_DIR/herdr-core`; `src/listen.ts` `scan()` routes any rejection to `fail`, which ends the listener. `sessions()` is also used by `src/next.ts:207`, `src/hc.ts:219`, `src/transcript.ts:123`. Unit file `~/.config/systemd/user/akrogon-listener.service`: `Restart=on-failure`, default start limits. Nothing tells anyone the listener is down.
- K2 Test cores share the operator's runtime dir. `tests/hc-fixture.ts:3-4,169,188-193`: test cores keep the real `XDG_RUNTIME_DIR` (for `systemd-run --user`), so their sockets sit in `/run/user/1000/herdr-core/` next to the operator's cores; the real listener sees and subscribes to them (its log is full of `watcher wake skipped: unknown repo` for test seats) and probes them as they close (K1).
- K3 hc leaks one systemd unit per core stop. hc 0.1.18 starts `hc-shutdown-<id>.service` (`systemd-run --collect --service-type=oneshot -p RemainAfterExit=yes`, `/bin/sh -c :`) per core; it stays `active exited`. Test runs left 32,575 by morning, slowed the user manager and turned every verify red on 15/30 s timeouts; clearing them made verify green (learnings/history/2026-11-08-hc-shutdown-unit-leak.md). Each full suite adds about 500. Operator decision O1: akrogon's test setup removes the unit of each core it starts when the test ends.
- K4 A test depends on the operator's own core. `tests/hc-identity.test.ts` "the parts of hc schema akrogon parses match the pinned copy" runs plain `hc schema`, which answers from whatever core the environment points at (under verify: the operator's `default` session). It passed while `default` ran 0.1.17 and fails since the operator restarted `default` onto 0.1.18 (new `Terminal.first_message`). Every verify on main and every leaf will now go red on it.
- K5 (herdr-setup) New tabs should open at the end of the tab line. Draft in herdr-setup's working tree (`mods/panel-bar/routine.js` `tailMoves`, `main.js` render hook, `tests/panel-bar.test.js`). Slot B's review found two defects: the `board` layout uses the shipped `tabs` mod, so no policy runs there; and two windows on one session with per-view `seen` sets can reorder (B's repro). Operator: "just make them open at the end of the line"; all changes for this in herdr-setup.

## What to return

For each K, independently: the root cause (file:line), the fix that removes the whole class rather than guarding one case (name what already exists that could carry it), what it could break, and the test that fails before and passes after (an observable result, not a constant). Add any other way the same outcome (a leaf silently stops moving) can happen that this list misses, with evidence. Practitioner or documentation sources for systemd restart policy and hc behavior where you rely on them, with path or URL.

Write your file to `/home/ivan/Work/infra/akrogon/issues/chart/listener-hardening/slots/map-<your slot letter>.md`, then run `hc send t15 "done <letter>: <path>"`.

## Operator direction (added during the map, verbatim)

"during the fixing always look at how to make the system less complex rather than adding more and more complexity for potential future failures."

Prefer fixes that delete a part or a path over fixes that add a guard, a retry, a watchdog or a new check. A fix that adds code must name what it lets us remove, or why nothing simpler removes the bug class.
