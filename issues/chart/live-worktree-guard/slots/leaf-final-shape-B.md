F3 — Limit report pruning to kept entries.

`issues/open/worktree-cleanup/store-sweep/brief.md:13` (criterion 2) deletes “its report entries for paths that no longer exist.” The new draft `worktree-keep-rule/brief.md:13` (criterion 4) and `design.md:35` require that same report to retain every registered worktree removed during the pass. Those paths necessarily no longer exist. The unqualified pruning rule therefore includes the new removal evidence and leaves the implementer to choose which requirement to satisfy.

Replace criterion 2's final clause, “and its report entries for paths that no longer exist”, with:

> and prunes only `kept` report entries for paths that no longer exist; the pass's `removed` entries are never filtered by path existence.
