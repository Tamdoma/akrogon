# Proposed final shape 2 (A), within operator's 1c

Mechanism moves from push sites to one place: `akrogon next`.
1. In the akrogon repo's pass of `akrogon next` (identity: realpath(repo.root) == realpath(toolRoot)), after its existing fetch: if the root's current branch is the configured default_branch and HEAD is an ancestor of <remote>/<default_branch> and behind it, run `git pull --ff-only <remote> <default_branch>`.
2. After a pull that moved HEAD: run `bun install --frozen-lockfile` (always, no lockfile detection; cheap when unchanged, retries naturally on the next pull), then re-run install's skill-link routine so added/removed skill dirs get links (existing conflict refusals kept).
3. Output is one printed line: `deployed <old>..<new>` or the refusal/failure with lag count and remedy (`akrogon sync` when root is ahead/diverged; finish or commit edits when a dirty file overlaps). Never throws, never fails or alters the pass's other work.
4. Never: checkout, stash, reset, rebase or merge of root state. Root on another branch, detached, or diverged: skip and report.
5. Runs under the existing global lock so two `next` processes do not pull at once.
6. Covers lifecycle merges (mergeWake runs next), direct-route pushes, by-ancestry completion, and landings from another machine, with no push-site hook and no new verb. Direct-route skill step 5 unchanged.
7. The plugin's herdr startup/events run `next --all`, so the akrogon pass runs on seat events.
Answers B F1-F4, C C1-C8. Off route unchanged.
