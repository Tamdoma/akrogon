# Brief: record-only-reuse

## What
When the command's batch push (from merge-batch) is refused because main moved, the command fetches the new main and restacks the batch onto it. It then prints `reuse` and treats the green run as still valid when all three hold:
1. The tested main and the new main are equal outside the record folders.
2. The tested top and the new top are equal outside the record folders.
3. `issues/config.yaml` is equal.

Otherwise it prints `rerun`, which is merge-batch's `fresh checks required`. Every later refused push compares against the original tested main and tested top, never against an earlier reused top. (A,C)

On `reuse`, the command stores the new top as the publication candidate next to the unchanged tested top and tested main, and B runs `merged --check` and `merged` again. The push accepts HEAD equal to that candidate. (A,B,C)

The record folders are `issues/` except `issues/config.yaml`, plus `learnings/`. They are fixed in akrogon with no setting. A restack conflict, including in `learnings/history/*`, follows merge-batch's conflict rules and prints `rerun`, and a restack that had a conflict never qualifies (A,C). The command decides and prints the tested SHA, the pushed SHA and the decision, and the batch record holds all three. `skills/merge-issue/SKILL.md` tells B to copy that printed line into `review-B.md` (A,C). `docs/guide/setup.md` states next to `checks` that checks must not read tracked files in the record folders, except `issues/config.yaml` as the check list.

Consumes from merge-batch: the command-owned push, the batch record (tested main, tested top, publication candidate), the command-owned restack, and the `fresh checks required` result.

## Why
The operator commits issue records to main with plain commits and `akrogon sync` (`src/sync.ts:136`), and `add issues` commits also touch `learnings/`. Today each such commit during a 30-40 minute run forces a full rerun even though no code changed. A chart probe found that no akrogon or framework check reads tracked files in those folders.

## Done-criteria
1. A record-only commit to main during a batch run ends in one check run total and a push.
2. A one-line code commit to main during the run ends in a second run.
3. A main commit matching part of a member's change fails the first condition and reruns.
4. A change to `issues/config.yaml` on main reruns.
5. A restack conflict, including one in `learnings/history/*`, prints `rerun`, and nothing is pushed until a new check run on the new top is green. (A,C)
6. The command prints the tested SHA, the pushed SHA and the decision, the batch record holds all three, and `skills/merge-issue/SKILL.md` tells B to copy the printed line into `review-B.md`. (A,C)
7. A second refused push after a `reuse` compares against the original tested main and top. (A,C)
8. The decision is the same when `akrogon phase` runs from a subdirectory of the holder's worktree. (A,B,C)
9. `docs/guide/setup.md` states the record-folder rule next to `checks`.
