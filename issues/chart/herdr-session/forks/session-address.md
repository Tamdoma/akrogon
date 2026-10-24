# Session address

## Question

Q1. How does akrogon learn which herdr session holds a repo's workspace: discover across running sessions by exact workspace label = registered repo name, or a declared per-repo setting?
Q2. Does leaf state record the session for its tab and pane ids, or is the session derived each pass from the repo's workspace?
Q3. Is the resolved session fixed for one whole akrogon invocation? (raised by B and C)

### Carries

- Split taken 2026-10-24: two charts (herdr-session, pull-gh-path), herdr-session first. Operator answer `1a | 2a`.
- Map: [slots/map-merged.md](../slots/map-merged.md)

## Findings

Notes: [A](../slots/session-address-A.md), [B](../slots/session-address-B.md), [C](../slots/session-address-C.md), merged [notes](../slots/session-address-merged.md), rebuttals [B](../slots/session-address-rebuttal-B.md), [C](../slots/session-address-rebuttal-C.md).

- Q1: discover by exact label across running sessions (A,B,C). Evidence: operator #117 Expected behavior; src/next.ts:407-408; src/config.ts:29,219-225; herdr 0.9.1 `session list --json` and `--session` precedence probes 2026-10-24 (B,C).
- Q2: derive, store nothing (A,C) vs store session and refuse on mismatch (B). Rebuttals agree the real risk is a second paid seat when the old seat still runs in another session (B,C). Neither pure option removes it under derive; store only stops the second allocation. A proposes 2c: derive, and before creating a tab refuse when any running session has a pane whose cwd is inside the leaf worktree outside the repo's workspace. The worktree path is unique per leaf across sessions, and activeCount already uses inWorktree(pane.cwd) (src/next.ts:360).
- Hook tab_closed origin (B rebuttal 2) moves to cross-session-reads.
- Q3: resolve once per repo per invocation (B,C,A). A vanished workspace mid-pass surfaces as the herdr error, no silent retarget (B).

## Taken
Operator 2026-10-24, verbatim: "1a - Also fix the names so they're correct | 2c | 3a - just make sure the worktrees will work |"

Recorded after the final-shape check by B and C ([B](../slots/session-address-final-check-B.md), [C](../slots/session-address-final-check-C.md)):

- Q1 1a. Discover across running sessions: one `herdr session list --json`, then `herdr --session <name> workspace list` per running session; the repo's workspace is the one whose label equals the registered repo key exactly; zero or several matches refuse visibly, naming the label and the sessions searched. akrogon never creates a workspace. Reason: operator expectation in #117, no new config. Foreclosed: declared per-repo session (drift, schema churn), ambient socket (the bug).
- Name fix ("fix the names so they're correct"): audit 2026-10-24 found every registered repo has a same-named workspace in a running session except `Himne` (no workspace in any session, running or stopped). Fix is an operator layout step, not a registry rename, because 4 closed Himne leaves carry `repo: Himne`. Session choice is open in the next round. Check: the chosen session's `workspace list` shows label exactly `Himne`.
- Q2 2c. No session stored in leaf state. Binding rules:
  - Resolution happens before the first pane or tab list in every entry path: allocate (before src/next.ts:373), dispatch busy observation (src/next.ts:719-723), hook ownership, reconcile, phase, land wake paths.
  - Scoped-only uses (liveness and keep-vetoes such as reconcile `tabLive`, phase rename to and from `<slug> failed`): the stored id is looked up in the resolved session only, with no label or cwd condition, so a veto never weakens.
  - Acting uses (allocate tab reuse, recorded-pane close at src/next.ts:383, `ownsPane`, dispatch `pane get`, reconcile tab closes): the tab must belong to the repo's workspace (pane -> tab -> workspace_id join in the resolved session) and have a member pane whose cwd is inside the expected leaf worktree; a recorded pane is acted on only as a member of that accepted tab.
  - Second-seat guard: before creating a new tab, list panes and tabs in every running session; a pane whose cwd is inside the expected worktree path (the path ensureWorktree returns, not `leaf.state.worktree`) and whose tab is outside the repo's workspace (another session, or another workspace in the same session) refuses, naming session and pane. An unreadable running session makes the guard unknown and refuses. Panes with null cwd are not matched, the same as activeCount today (A's detail, stated limit).
  - `tab_closed` owner matching has no live tab to corroborate; it is explicitly deferred to cross-session-reads and is not made safe by this fork.
  Reason: blocks a second paid seat without a stored field. Foreclosed: 2a (second seat possible), 2b (new field, manual repair on every move).
- Q3 3a. Resolve once per repo per invocation; a workspace that vanishes mid-pass surfaces as the herdr error, never a silent retarget.
- Worktree criterion (operator "make sure the worktrees will work"): a seat placed by akrogon in the resolved session opens with cwd in the leaf worktree, and the second-seat guard detects a pane in that worktree from a session other than the repo's. Worktree paths live under worktree_store and do not depend on session.
