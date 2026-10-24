# Opening map, merged (A, B, C)

Sources: [A](map-A.md), [B](map-B.md), [C](map-C.md).

## Agreed

- Callers: four separate herdr spawn helpers (peer-restart.ts:60 run, also used by peer-create; peer-ask.ts:36,49; peer-wait.ts:95,117; door-reset.ts:75), none pass `--session`. The most dangerous chain is peer-restart's process-info at :177 followed by kill -TERM at :215 (A,B,C).
- The repo workspace resolver is the wrong anchor: peers are operator-placed beside the door, not repo seats, and a door can chart a repo whose workspace is in another session (B,C; A did not use it).
- Pin once per operation and never re-resolve after an error or loss. Errors surface, with no fallback to the inherited socket or default session (A,B,C). Discovery reads get a bounded deadline (C), matching the sibling lock.
- "session" already means the harness session in seats.yaml, exchange JSON, outcome and restart lines and chart-usage.ts. Any herdr session value needs a distinct name and must not be confused with it (B,C).
- Every read is routed, not only mutations: process-info, agent list, waits and the final roster read (B,C).
- Blocked by session-routing for the multi-session fake (A,B,C).
- Fake tests use the same pane id in two sessions and a misleading inherited socket, and assert that the decoy session gets no prompt, split, start or process-info (A,B,C). Real proofs of herdr behavior exist (sibling P1-P7). B also proved read-only `--session pane list` with a bogus socket, 2026-10-24.

## Differences

- D1. How the session is found (the main fork).
  - A: anchor on an id herdr cannot repeat, A's own agent session id (already in seats.yaml). Find the running session holding the pane whose agent_session.value matches, and refuse on zero or several.
  - B: explicit qualified address per peer (pane plus herdr session), from the operator or a confirmed session. A lookup proves existence, not intent.
  - C: look up the pane id across running sessions and accept only a unique hit, anchored on the caller's pane id resolving to the same session. No argv change.
- D2. May peers live in a different session from A? A and C: no, refuse (co-location anchor). B: yes, a per-peer address, unless the operator chooses the restriction. C's FG1 says this is the operator's call.
- D3. Pre-prompt wait chain in questions.md. C: move the idle wait into peer-ask and delete the raw chain (changes door timing text). A and B: route the chain (B lists it under prose to update).
- D4. Code shape. A and B: reuse session-routing's discovery and argv builder from src/shell.ts. C: a peer-local helper module, because the src resolver answers repo to session and the scripts' error shapes differ. C notes direct-guards.ts already imports src/.
- D5. Proof. C: a real smoke after install, through the door under a new grant, with two sessions and a wrong socket. B: new real proofs for restart (kill in a disposable group) and door-reset need a grant and are door work. A: no new external operation.
- D6. Children and reruns. C: children inherit (peer-ask to peer-wait, door-reset's detached child), and a standalone rerun re-resolves. B: keep the original address through every child and rerun.

## Fog and open items

- Autopilot classification of a resolution refusal (C FG2).
- Callers outside a pane shell (C FG3).
- Resume of an open chart whose seats lack a herdr session, and same-name server replacement (B G3).
- `--session <stopped> pane list` error shape is unproven on this verb (C FG6).
