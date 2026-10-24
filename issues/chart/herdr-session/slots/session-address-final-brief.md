# Final-shape check brief: session-address

The operator answered: "1a - Also fix the names so they're correct | 2c | 3a - just make sure the worktrees will work |".

Proposed final shape to record (check once, as an implementer, before A records it):

- Q1 1a: discover across running sessions, exact workspace label = registered repo key, exactly one match, else visible refusal naming the label and sessions searched. Name audit 2026-10-24: every registered repo has a same-named workspace in a running session except Himne (no workspace in any session; GitHub repo Gospodnja-Obnova/himne; 4 closed leaves carry repo: Himne). Proposed fix: operator-approved creation of a workspace labelled Himne (keeps records), not a registry rename.
- Q2 2c: store no session. Stored tab/pane ids are used only inside the derived session and only when the tab label equals the slug or a member pane cwd is inside the leaf worktree (the bare tab_id arm at src/next.ts:395 and the recorded-pane close at :383 gain that corroboration). Before creating a new tab, list panes in every running session; if any pane cwd is inside the leaf worktree and outside the repo's workspace, refuse naming that session and pane. An unreadable running session makes this check unknown, which refuses too.
- Q3 3a: resolve once per repo per invocation; a vanished workspace surfaces as the herdr error.
- Worktree criterion (operator "make sure the worktrees will work"): a seat placed by akrogon in the resolved session opens with cwd in the leaf worktree (placement --cwd at src/next.ts placement), and the 2c guard detects a pane in that worktree from a session other than the repo's. Worktree paths are host paths under worktree_store, independent of session.

Return only defects or missing pieces with evidence, or "no change". Reading rule: read process text by named section, bounded, at most once per session; unread, changed or compacted content stays readable; full source allowed when it is the subject; reads name sections, never line ranges.

Return exactly: /home/ivan/Work/infra/akrogon/issues/chart/herdr-session/slots/session-address-final-check-SEAT.md (replace SEAT with your letter).
