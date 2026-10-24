# session-address merged notes (A, B, C)

## Q1 discover or declare
- Discover across running sessions, exact label = registered repo key, exactly one match (A,B,C). Cost: label becomes the address, case included (C, Himne has no workspace today); list calls cached once per repo per invocation (A,B,C).
- Declared setting rejected: per-repo config puts host layout in version control and strict schema churn (C); global config changes `repos:` shape (C); second mapping that drifts (A,B,C). Revisit only for intentional duplicate labels (B,C).
- Workspace cwd as address rejected: `workspace list` has no cwd, only herdr's private session.json (C).
- Resolve before the first recorded-id use, not at src/next.ts:407: allocate closes recorded panes at :383 (A,B,C) and busy observation at :719-723 reads stored pane ids before allocate (B).
- Who may create a missing workspace: operator only (C, A map).

## Q2 store session or derive
- Derive each pass, store nothing new; stored ids read only in the derived session; allocate's label+cwd re-match repairs moves and restarts (A,C). Cost: session context threads through allocate, dispatch, reconcile, phase, land.
- Store session beside ids, compare to discovered placement, refuse on mismatch with both locations, no auto-migration (B). Cost: schema field, legacy adoption rule, repair path.
- Point of difference: after a workspace move or legacy wrong-session state, derive re-allocates in the new session while a seat may still run in the old one (B); store refuses and leaves recovery to the operator (B); derive self-heals and the old session's objects are new/unrelated (C).
- tab_closed hook has no live tab to prove origin (B); event session can come from the firing server's injected socket matched against `session list --json` socket paths (C).
- Session restart: processes are replaced either way, public tab/pane id continuity unproven (B,C); neither option needs a boot epoch (B,C).

## Shared pitfalls
- Bare-id matches (allocate tab_id arm src/next.ts:395, ownsPane :159, tab_closed owners :1432) need cwd/ownership corroboration before adopt or close (A,B,C).
- Unreadable or stopped session never reads as an empty pane list; keep the null-list keep path (B,C). Belongs with stopped-and-ambiguous and cross-session-reads.
- Dispatch `pane get` throws on a missing recorded pane (src/next.ts:584) instead of re-allocating (C).
- Phase/land committed work is not replayed when a follow-up herdr call fails (B).

## Open questions raised
- Is the resolved target fixed for the whole invocation, refusing on mid-pass change (B,C)?
- Dead ids in merged/failed leaves: left as is or stamped (C)?
