# identity: merged notes (A,B,C,D,E)

Sources: fork-identity-A.md .. -E.md.

## Probe by A, 2026-11-06 (read-only, free)
- `echo '{"jsonrpc":"2.0","id":1,"method":"doc.get","params":{"name":"herdr-app"}}' | hc connect` returns the herdr-app document (spaces with id, name, tabs, tab tree with weights) from the core. With `HC_SESSION=mdconsultingny` and `HC_TERMINAL_SOCKET/ID/SCOPE` unset it returned `version 15`, spaces `['boulevard-automation']`, while that session has no window (B observed `herdr-app ls` failing there). So space discovery does not need a window. Limits: proves the read and its shape today; the document format is herdr-app's and can change (no schema promise beyond "opaque JSON"); does not prove writes.
- `hc schema` also lists `doc.set` (versioned write, emits a doc event): relevant to start-and-pane, not decided here.

## Q1. Session and space
- Discovery by space name, same rule as today (A,B,D,E): search running hc sessions, one space whose name equals the repo name; none, several or unreadable refuse with today's reasons (`src/shell.ts:379-428`). Resolve once per process (D). C instead: one config key per repo naming its session (`repos.<name>.session`), space still by name; C chose that only because it believed discovery needed every window open, which the probe above removes.
- Read source: the core's `herdr-app` document through `hc connect` `doc.get` (probe above), not `herdr-app ls` (needs the window, B) and not the private `docs.json` file (B rejects; E proposed it as a fallback).
- Session list: from herdr-core's own socket folder `/run/user/1000/herdr-core/<session>.sock` (A) or a session enumeration inside akrogon's hc module (D); not by shelling to herdr-setup's `herdrapp` (C,D reject: engine would depend on herdr-setup), E picks `herdrapp session list --json`.
- Every hc call for a resolved session sets `HC_SESSION` (and `HERDR_APP_HOME` for herdr-app calls) and strips inherited `HC_TERMINAL_SOCKET`, `HC_TERMINAL_ID`, `HC_SCOPE` (B,D,E; intake probe method).
- Pitfalls: space renamed or unnamed space renaming itself (refuse, name the space searched for; the start helper names a space it uses, A); `extensions` space vs `pi-extensions` repo already differs (operator renames the space, C); a session started later has no listener (status lists it, D).
- Open: should discovery stay local-only (B); two spaces with the repo name in two sessions on purpose (D: refuse as today).

## Q2. State
- `tab`: herdr-app tab id, kept as today (all); found by stored id or by name == slug inside the space, refusing several (D, today's rule `src/next.ts:555-559`).
- Seat identity: hc name (A,C,D; B derives it, not stored) plus an instance marker so a replaced seat's late report is refused: address (B,C,E), `created_ms` (D), or both (C). B qualifies the address by core id (`hc server status --json` returns `core.id`).
- `prompted`: the seat's hc `turn` at prompt time, paired with the instance marker (B,C,D,E); A deferred it to the delivery fork.
- Labels on every akrogon terminal: one constant filter label (`akrogon=1` B,C,E; `akrogon.managed=1` D) because `hc events --label` is AND-only, plus `akrogon.repo`, `akrogon.leaf`, `akrogon.seat`, `herdr.space`, `herdr.tab`. D: consultants get repo/seat labels but not the constant, so the listener never wakes leaf passes for them.
- Before prompting or killing, check name + instance + labels + tab + cwd agree (D,B), the mirror of today's tab-ownership checks.
- Rejected by all: pane id as identity (a pane is a view), address alone as the stored key (changes on restart), labels alone (finished terminals vanish).

## Q3. Names
- Consultants: `<prefix>-slot-<letter>` (all, intake).
- Leaf seats, readable: `<prefix>-<slug>-<a|b>`, with a short hash replacing the slug's tail when it would pass 32 chars (A,D,E). Opaque: `akrogon-<24 hex of role/repo/slug/seat>` (B, today's shape at `src/next.ts:788`) or `<prefix>-l<12 hex>-<a|b>` (C, the slice hash at `src/scope.ts:13-14`). C measured slugs up to 34 chars over 1501 closed leaves.
- Prefix source: a per-repo config value set at registration, refusing duplicates (A,C,D; D defaults to the first two letters). E derives it (hyphenated: segment initials, else first two letters); B and C note `fw` and `hs` are not first-two-letters and `portal`/`portal-old` would collide.
- Second door on the same repo in one session: hc refuses the name (`name_taken`); the start command stops and names the live owner (A,B,C,D). E: fall back to a door-qualified name.
- Finished terminal holding a name: the start step removes it only when its labels match this repo/leaf/seat, else refuses (C,D).
- Open: names for the direct-route reviewer, watch and operator terminals (D,E).

## Corrections after rebuttals (2026-11-06)
- B: B stores the current address qualified by session/core and derives the name; it rejects only unqualified addresses. Finished terminals do not vanish: `hc ls --all` and `hc get` keep finished records, and names are unique only among live terminals, so reusing a name needs no removal of the finished record unless a probe shows otherwise. B's checks are one lookup/ownership contract at the boundary, not five scattered checks.
- C withdraws the config-key pick; discovery by space name across running hc sessions. Conditions: parse `doc.get` and the session list with a strict schema at the boundary, mismatch becomes today's refusal named in `akrogon status`; a test pinned to `hc schema` so a core update that changes `doc.get` fails the suite. Socket folder also holds holder sockets (`infra.holder.4c420e69.sock`): session pattern is `<name>.sock` with no dot in name. `personal` has no hc socket now although old herdr lists it running: list hc sessions, not old herdr's.
- C on Q3: if readable names win, use one rule for every leaf: `<prefix>-<slug head>-<4 hex of repo/slug>-<a|b>`, head cut to fit 32, hash always present.
- D, E: no disagreement.
