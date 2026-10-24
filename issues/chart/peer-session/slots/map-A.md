# Opening map, seat A (peer-session)

Callers (repo source): peer-restart.ts:60 shared spawn (agent list, pane process-info, agent start; kill -TERM on the read process group); peer-ask.ts:36 prompt, :49 agent list; peer-wait.ts:95 agent wait, :117 agent list; door-reset.ts:75 own spawn; peer-create.ts uses peer-restart's run (split, start). Tests: tests/{peer-ask,peer-wait,peer-restart,peer-create,door-reset}.test.ts.

## F1. How does a script learn the session of the panes it addresses?
- O1 explicit `--session` passed by the door (B's view). Cost: the door must learn its own session. Its HERDR_SOCKET_PATH and HERDR_PANE_ID are the suspect values.
- O2 look up each pane id across running sessions; a unique hit pins, else refuse (C's view). Pitfall: pane ids repeat across servers (w8 exists in infra and mdconsultingny), so collisions refuse often, and a hit in the wrong session is possible while the real pane is gone.
- O3 (A's pick) anchor on an id herdr cannot repeat: the door's own agent session id (claude session uuid, pi session file, codex id), which seats.yaml already records. Run `session list` plus `agent list` per running session and pick the session holding the pane whose agent_session.value equals A's own session. Exactly one is expected. Zero or several refuse. All scripts then get that session name explicitly, and every peer pane is checked to be in it (same session as A, because peer-create splits A's pane). Removes env trust without a new operator input. Cost: one discovery per script call, or one per door step passed down. Codex shows no session until its first exchange, which is irrelevant here because A is the anchor.
- Reuse: session-routing delivers the discovery and argv builder with an executable parameter in src/shell.ts. The scripts already import repo source (peer-wait readPeerAgent and others), so they reuse it without a second resolver.

## F2. Where is the resolved session kept?
- Pass it per call (pure) vs record `herdr_session` in seats.yaml. Recording invites drift when the door moves. Pick: resolve per script call from the anchor and record nothing new.

## F3. Supplied peers in a different session from A
- The operator may name panes elsewhere. Pick: refuse unless every named pane is found by its own agent session in A's session, naming the mismatch. Alternative: allow per-pane sessions (more surface).

## F4. door-reset detached child
- The child gets the resolved session as an argument, not env. Its start prompt names A's pane, so the fresh A re-anchors with its new session id.

## Pitfalls
- kill -TERM after a wrong-session process-info read kills the wrong process group. Removed by resolving the session before any read and passing it to process-info.
- Ordering: depends on session-routing landing (shared resolver). This chart's leaf is blocked-by session-routing.
- Tests: these scripts' fakes are single-session. They need the multi-session fake from session-routing or their own stub extension.

## Fog
none

## Proofs
`herdr --session X agent list` and the agent_session fields were proved in herdr-session operation-proofs P6. No new external operation.
