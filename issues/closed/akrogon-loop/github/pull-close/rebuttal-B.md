# Slot B rebuttal

Both positions agree on the main implementation: a pull module, existing shell boundary, async close after owner rename under the existing locks, fake-gh command tests, and a startup declaration before next. Resolve the behavioral forks below against the brief and live code. No peer rebuttal was read.

## Resolutions

D2. Keep literal origin for intake. A's configured-remote substitution changes behavior, not wording. With `remote: upstream`, origin `github.com/team/intake`, and upstream `github.com/vendor/product`, A mirrors vendor/product. The brief explicitly requires the checkout's origin and failure when that origin is missing or non-GitHub. Config's merge-target meaning does not override that requirement. Test differing origin and configured remote.

D3. Keep complete pagination. A's acknowledged 1,000-issue truncation violates the complete-listing requirement. At 1,001 open issues, an existing seed for the omitted issue gets deleted despite remaining open. Installed `gh api --help` explicitly supports `--paginate --slurp`, so the limitation is avoidable through gh itself. Use the REST listing with pull requests excluded, buffer and validate everything before mutation, and exercise multiple pages plus partial-output failure. No fixed cap is acceptable as the retained limitation.

D4. Keep the repo lock around fetch and reconciliation. Another pull is a writer even though other commands do not write seeds. Two unlocked pulls observing old and new titles can each delete the other's newly written path and leave neither file. Existing `withRepoLock` serializes this without a new lock mechanism. Retain numbered-path reconciliation. Deleting arbitrary non-seed files is unnecessary for the one-file-per-issue contract. Use A's write-new/delete-old approach and deterministic `issue` slug for an empty normalized title, with a bounded filename length.

D5. Await completion in all three callers. Live `src/next.ts:306` calls `completeOwner`, and lines following it remove the worktree and branch. A's claim that next only adds worktrees is incorrect. An unawaited close could lose both the issue lock and the worktree needed for the comment. Preserve B's recovery test and explicit lock assertion.

D5 also retains the triggering leaf's worktree commit for sourced owners. `logMove` does use `worktree ?? repo.root`, but that diagnostic default cannot prove the registered checkout HEAD is the merged leaf head. Test distinct commits. If a sourced owner lacks the required worktree context, print a contextual failure after moving the folder rather than comment with an unproven commit. Source-free fixtures need no extra commit lookup.

D6. Retry check-and-close as one operation, once. A's direct retry of close does not recheck state after a remotely successful close whose response failed. Rechecking skips another close in that scenario. A failed view must never authorize close. Keep structured final failures, attempt later sources, and deduplicate repeated references across leaves.

D6 clarification: accept A's final nonzero exit after attempting all sources with failures. B's position did not specify an exit status. This matches the existing committed-state/log-failure behavior and makes failure visible to the caller without reversing the move. Preserve full source and process context in the aggregate failure. This is an error report, not permission to replay a completed transition. Malformed references must be isolated per source so valid later sources still run.

D5 ownership correction: `completeOwner` retains an unfinished epic in open. It does not move each completed issue out of the epic first. Its owner is the epic parent, and it waits for every leaf under that parent to merge. Gather sources from the entire actual moved folder, including earlier-completed issues. No new ownership metadata is needed.

D7. Accept A's small `plugin/pull.sh` wrapper alongside `next.sh` as consistent with the existing plugin. Keep the startup file-shape assertion in `tests/pull.test.ts`, preserving the locked one-test-file-per-subcommand organization. No generalized dispatcher or separate plugin test file is needed.

## Verification and limits

A1. Keep the fake-gh executable patterned on existing fake-herdr tests. It must support paginated output, partial failure, stateful view/close retries, and call recording. Do not add a generic gh wrapper merely to duplicate existing shell execution. Typed response parsing is needed where JSON enters the program.

A2. Retain B's concrete negative and recovery scenarios, plus A's aggregate nonzero-close-failure assertion. Add origin-versus-merge-remote and concurrent-pull scenarios for the resolved forks. These tests validate observable contracts, not output wording. Run configured format, typecheck, and bun test checks during implementation and record invocation evidence under the leaf.

A3. Use temp-repo invocations for required acceptance evidence. A real pull against the operator's checkout is not required to prove command behavior and should not be part of routine tests. No real GitHub close or herdr socket interaction is needed.

R1 remains pagination's external race when GitHub changes during a multi-page fetch. R2 remains a crash between local rename and GitHub close or exhausted close retries, with no durable replay queue under this design. R3 remains longer existing lock duration during GitHub calls. These are actual limitations, unlike the avoidable fixed-listing cap. No additional debate round or implementation dependency is needed.
