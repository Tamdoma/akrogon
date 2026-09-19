# Limits

Things that will surprise you if you don't know them. Read this before you get surprised. I got surprised by most of these, so you don't have to.

Ordering: blocked-by is checked before every dispatch. Not once at start, every time next looks at the leaf. Edit the list, run next, it matters. A running leaf with a tab still gets its blockers checked — dispatch doesn't skip that because a tab exists. Change order before you need it, not after you're annoyed.

Ordering: blocked-by only names leaves. Not epics, not issues. To wait for a whole epic, name its last leaf. One line in one file. For export-csv, if export-json must wait, put blocked-by [export-csv] in export-json. That's it.

Capacity: max_active is machine-wide, first come first served. Counted across every registered repo. The global value is the machine ceiling. Ready leaves start in folder order. One epic can take every seat. Priority in state.yaml is not read — old files may have it, the command ignores it. I keep max_active at 3. One busy epic plus export-csv waiting taught me why.

Capacity: folder targeting doesn't reserve seats. next <folder> starts only that folder leaves now, but the next hook call sweeps everything, and startup runs --all. To keep work out of the loop for real, use akrogon park. Targeting is a nudge, parking is a fence.

Cleanup happens only when you or startup run next. Herdr idle signal flickers between tool calls, so nothing destructive is tied to it. A merge closes its own tab. Worktrees and branches wait for a hand-typed akrogon next in that repo, next --all, or the next Herdr start. The hook never deletes worktrees. That's deliberate — deleting on a flicker would be awful.

The last tab may stay open. If a merge session dies before its final close, the tab lingers until the next startup sweep or hand-typed next cleanup. It's harmless. Close it by hand or run akrogon next --all. I close them by hand when I see them. Takes two seconds.

Files: issue files never go on a leaf branch. Every phase move refuses any file under issues/ on the branch, and refuses a dirty worktree. The move into review also refuses an empty branch. Agents write issue files only in the registered checkout. Export-csv code lives on branch export-csv in the worktree; its plan and reviews live on main in ~/Work/widgets/issues/. Different places, different branches, no overlap.

Files: sync commits only eligible issue records. Not everything. akrogon sync stages issues/ minus seeds, lock files, and the worktree root, commits as sync issues, rebases, pushes. It refuses staged paths outside those records. You can leave half-done code in the checkout and sync will stop rather than sweep it in. That's safer than it sounds — I leave messes everywhere.

Agents: blocked is not counted, stuck is. A permission dialog waits for you forever with no penalty. A prompt that doesn't take counts one attempt. Three consecutive failed deliveries and the leaf fails. Attempts reset when a prompt lands. So answering a dialog is free, ignoring a broken pane is not.

Broadcast: only the merge slot broadcasts. Never a subagent, never a cheaper model. The merge pane holds the issue context and closes its own tab as its last act, so anything it hands off could be cut short. A failed broadcast doesn't reopen the issue. The merge is done, the message just did not send.

Previous: [In practice](in-practice.md) · Next: [Problems](problems.md) · [Home](../../README.md)
