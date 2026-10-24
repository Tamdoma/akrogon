# Cross-session reads

## Question

Q1. How do capacity counting, reconcile keep-vetoes and hook pane ownership read panes across sessions without bare-id collisions or unknown-as-empty?
Q2. When is an inherited HERDR_PANE_ID trusted for attribution?

### Carries

- Split taken 2026-10-24: two charts (herdr-session, pull-gh-path), herdr-session first. Operator answer `1a | 2a`.
- Map: [slots/map-merged.md](../slots/map-merged.md)

## Findings

Notes: [A](../slots/cross-session-reads-A.md), [B](../slots/cross-session-reads-B.md), [C](../slots/cross-session-reads-C.md), [merged](../slots/cross-session-reads-merged.md), rebuttals [B](../slots/cross-session-reads-rebuttal-B.md), [C](../slots/cross-session-reads-rebuttal-C.md). C's first return was delayed by the operator's pi model change to deepseek v4.1 flash; operator said wait, the file arrived 12:41 local.

- herdr v0.9.1 source (B,C): plugin commands get the firing server's HERDR_SOCKET_PATH; the rest of the parent env passes through; event JSON is server-generated with workspace_id; HERDR_PANE_ID is injected only with a focused pane, so tab.closed hooks can carry a stale inherited value.
- Q1 agreed (A,B,C): session-tagged reads of every running session, vetoes and capacity across all, acting calls only in the tagged session, unknown keeps. Correction (B): the cached inventory is updated or invalidated after launches and closes within the pass.
- Q2 agreed: event ids first, emitting session from the injected socket by exact socket_path match (A,B,C); workspace_id comparison (A,B; C raised it as a question). Manual no-event runs: establish scope from cwd or explicit target first, then the pane hint must agree (B); corroborate by recorded pane or cwd (C).
- Open difference: src/log.ts diagnostic session with no slot, null (B) vs env fallback after slot-first ordering (C; today slot-less moves read env).

## Taken

Operator 2026-10-24, verbatim: "1a | 2a | 3a | 4a |"

- Reads: every running session is listed and each pane, tab and workspace result is tagged with its session. Capacity counting (activeCount), reconcile keep-vetoes and the second-seat guard use all tagged results. Acting calls (close, rename, send, launch) go only to the tagged session. An unreadable session counts as unknown, so nothing it might hold is closed. The inventory is updated or invalidated after each launch or close within the pass.
- Hooks: ids come from the event JSON. The emitting session is the `herdr session list` entry whose socket_path exactly equals the injected HERDR_SOCKET_PATH. The event's workspace_id must equal the repo workspace's id, so hookEventSchema (src/next.ts:75-98) keeps workspace_id. tab.closed and other close events are handled here, which replaces the session-address deferral. Every action still passes the session-address acting checks.
- Manual runs: scope is set first from cwd or an explicit target. An inherited HERDR_PANE_ID is used only as a hint inside that scope and only when it agrees with it.
- src/log.ts: the slot's pane is read first. With no slot, the diagnostic pane is null, and the env HERDR_PANE_ID is not used.
