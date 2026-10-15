# Brief: stacked-member-close

## What
When a stacked merge finishes, the merge path itself closes the tab of every merged member and dispatches each member's dependents, as `closableMembers` did before 6640ab5.

## Why
Tamdoma/akrogon#93 remainder: since 9e4c093 restored stacking without that step, merged members' tabs and worktrees wait on a hook chain that does not always arrive, so their worktrees are kept and their dependents wait.

## Done-criteria
1. After a stacked merge of a holder and two members lands through `akrogon phase <holder> merged`, both member tabs are closed by that command's merge pass without a herdr hook event, and each member's dependent leaves are dispatched.
2. The same holds when the push was first reported failed and a later fetch confirms it landed. (B)
3. The holder's own tab is not closed by this path; it closes on idle as today.
4. A dependent dispatched by this path and again by a later pass is started once.
