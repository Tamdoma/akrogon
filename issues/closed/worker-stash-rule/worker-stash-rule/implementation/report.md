# Report: worker-stash-rule

Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`. Committed head: `868cac1b071ea34adf5e5e58e89dc2f8192714a3` (`skills: ban git stash in leaf and worker worktrees`).

Serial-solo run (plan D1): one unit, A implemented directly, no workers or worker worktrees, so no sub-briefs and no launch count lines were needed.

## Changed files and reasons

- `skills/implement-issue/brief-template.md` — section 5 now carries, for every sub-brief, the standing exclusion never to run any `git stash` subcommand, its reason (every worktree of a repo shares one stash and a pop can lift a sibling worker's edit) and the base-check replacement (a second worktree of the base); delegated leaf briefs add the WIP-commit replacement (`git reset --soft <creation commit>` then one returned commit); standalone briefs carry no reset step. Section 4 records, for a delegated leaf unit, the commit A created the worker worktree at, filled when A creates that worktree at its wave.
- `skills/implement-issue/SKILL.md` — the Shared context refresh paragraph now states A never runs `git stash` in a leaf or worker worktree, at a refresh or at any other time, since leaf worktrees of different leaves share the stash.

No links were added or changed. `git diff --stat 39e203a7...868cac1b` shows only these two paths (4 insertions, 2 deletions). `grep -n stash` on both files returns only prohibition sentences; no sentence permits stashing in a leaf or worker worktree.

## Done-criteria

1. Template instructs the never-stash rule with reason and replacements — met on the committed head; seat-read per plan (template sections 4 and 5 against `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` in the framework repo).
2. SKILL.md states the never-stash rule at any time and no owned-file sentence permits stashing — met; see grep above.
3. Links resolve — `akrogon run-check --name link-check -- bun test tests/docs-links.test.ts` on `868cac1b`: 12 pass, 0 fail. `check link-check: 0 .../check-link-check-1794955979336-1588999.log`. Also covered by the `test` check inside `akrogon verify` on the same head.
4. Prose-not-a-stop statement — this change is prose only; today's Retire rule does not count a prose instruction as a stop, so the framework lesson `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` stays active. No `learnings/` path is in the diff and the lesson file lives in the framework repo, outside this branch's reach.

## Commands run

- `akrogon run-check --name link-check -- bun test tests/docs-links.test.ts` on `868cac1b` — exit 0, 12 pass. Log: `check-link-check-1794955979336-1588999.log`.
- `akrogon verify` on `868cac1b` — first run red: `test` failed one test, `(fail) agy: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript` (tests/door-reset.test.ts); `format`, `typecheck` and `setup` green. Logs: `check-format-1794955985432-1592774.log`, `check-typecheck-1794955990323-1592774.log`, `check-setup-1794955981190-1592774.log`, `check-test-1794956083653-1592774.log`.
- `git diff "$AKROGON_BASE"...HEAD` shows two markdown files only, no plausible cause for a door-reset test failure — judged red with no cause in the leaf's diff. One retry of the same configured `test` command, same args and scope, in the worktree: `akrogon run-check --name 'test' -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile" && akrogon guard own-modules && sh -c "bun test --timeout=30000 --parallel=4 --no-isolate"'` — exit 0, 1224 pass 0 fail on `868cac1b`, including the previously failing agy test. Log: `check-test-1794956304978-2019400.log`. The first `test` check is marked `inconsistent` per the retry rule.
- `akrogon verify` on `868cac1b` (committed head, unchanged) — green; `verify test: 0`, `verify leaf 868cac1b...: green`. Log: `check-test-1794956431444-2865885.log` (plus the receipt's own format/typecheck/setup legs).

Wall time: `test` check ~93s (first verify leg), ~59s (retry), ~65s (second verify leg); all commands sized seconds per plan.

## Known limitations

- Prose instructs but does not mechanically prevent `git stash` in a worker or leaf worktree; the design's probes rejected every mechanical alternative (clone breaks `akrogon run-check`, no stash hook exists, `refs/stash/blocked` blocks the operator). The readiness.yaml probe on git 2.56.1 proves the shared-stash mechanism the reason cites; worker compliance itself is unproven by this leaf, as the design's interpretation records.

## Unverified criteria

- None. Criteria 1, 2 and 4 are seat-read records judged at review; criterion 3 passed above.
