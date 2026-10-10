# Brief: dependents-first

## What
Dispatch order (src/next.ts:773-778) and next-holder selection (mergeQueue, src/turn.ts:55-73) both sort by the count of unmerged leaves waiting on the candidate through `blocked-by`, directly or transitively, descending. Ties keep today's order (merged first at dispatch; merge_stamp then slug in the queue). A leaf holding a batch record stays first in the merge queue, so priority never displaces the active holder.

## Why
The operator ran a 20 s script rewriting merge_stamp so leaves that unblock others land first (#65, #70). Leaves with many dependents waiting stall the whole graph behind FIFO order.

## Done-criteria
1. In a repo where leaf X has 2 transitive dependents and leaf Y has none, both in merge with Y stamped earlier and no batch record on either, the merge queue lists X first.
2. With the same graph and a batch record on Y, the merge queue lists Y first.
3. Merged dependents are not counted: a leaf whose only dependents are merged sorts as having none.
4. Dispatch of ready leaves visits a leaf with more waiting dependents before one with fewer.
5. `akrogon status` queue places reflect the new order, and docs/guide/merge.md and docs/guide/next.md describe it.
6. The blocking `checks` pass.
