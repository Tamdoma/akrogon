# Review A: worktree-root-ignore

Base: 8eebd88033301dfd7dbe943641d3028bf4b3a041
Reviewed head: 67c82bad809cb2144405ed2ff3ba49d3af1686a6
Debate: no (no positions/rebuttal artifacts expected)

## Diff scope
Only `src/init.ts` and `tests/init.test.ts` changed, matching D1 and the brief's change list. No schema, sync, docs or helper edits. `initialize` signature unchanged.

## Criteria
- C1: custom `work/trees` produces `work/trees/` only, and `git check-ignore` confirms a file beneath it is ignored (test 2). Pass.
- C2: default proposal still produces `issues/worktrees/` (assertion added to test 1). Pass.
- C3: `../trees`, absolute external, and `<root>-trees` sibling add no worktree line while seeds and lock remain (rootCases). The sibling case covers the lexical prefix trap because `within` uses `relative`, not `startsWith`. Pass.
- C4: `./work/temporary/../trees/` and absolute internal both yield `work/trees/`; all rootCases run from nested cwd `issues/open`; `.` and absolute repo-equal add nothing. Pass.
- C5: repeat `init` without `--from` keeps `worktree_root: work/trees` in config and leaves `.gitignore` byte-identical; user content without final newline gets one separator and existing `issues/seeds/`/`.lock` are not duplicated. Pass.
- C6: `implementation/cli-artifact.log` records both invocations, exit 0 each, and the resulting `.gitignore` (`work/trees/`, `issues/seeds/`, `.lock`). Pass.

## Implementation
`resolve(root, config.worktree_root)` plus `worktreeRoot !== root && within(worktreeRoot, root)` reuses the existing helper and keeps the append/dedupe path untouched (D2, D3). Ponytail: no new abstraction, one expression, existing helper reused.

## Verification (rerun by A on the worktree at 67c82ba)
- `bun run format`: exit 0, no changes.
- `bun run typecheck`: exit 0.
- `bun test`: 68 pass, 0 fail, 9 files.
- `AKROGON_BASE=8eebd88... bun test --changed=8eebd88...`: 9 pass, 0 fail.
- `git diff --check 8eebd88..HEAD`: clean. Working tree clean after checks.

Tests exercise the real CLI subprocess and real Git; no mocks of the unit under test. Assertions on `.gitignore` bytes are fixed references written literally by the code, so they are acceptable.

## Docs
`docs/setup.html` says init "adds ignore lines for worktrees, seeds, and lock files" and shows `worktree_root: issues/worktrees` as the default. Still accurate; no edit needed.

## Findings
None blocking. No nits.

## Verdict
ready

## Merge (slot A)
Fetched origin; `origin/main` = 8eebd88, already the parent of head 67c82ba, so the rebase was a no-op and AKROGON_BASE is unchanged. Neither code nor integration changed since the review check run above (format, typecheck, full test, changed tests all green at 67c82ba), so that run is reused. No nits to turn into lessons.
