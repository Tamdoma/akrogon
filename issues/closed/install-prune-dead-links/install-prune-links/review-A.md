# Review A: install-prune-links

Base: `13f92e0376d8b0a59ac7f9e61276e9667b0b2bf0`. Reviewed head: `391bdf9`. Leaf is `debate: no`; no positions or rebuttal exist, as expected.

## Verification (rerun by A in the worktree)

- `bun test tests/install.test.ts`: exit 0, 15 pass, 307 assertions. Prints `.evidence/install-prune-links/home-listing.json`.
- `bun test`: exit 0, 60 pass across 9 files, 815 assertions.
- `bun run typecheck`: exit 0. `bun run format`: exit 0, working tree clean afterward.
- `git diff --check 13f92e0..HEAD`: exit 0. Diff touches only `src/install.ts`, `tests/fake-herdr.ts`, `tests/install.test.ts`.
- `home-listing.json` inspected: all four temporary roots list the eight current skills as resolving symlinks plus the six preserved entries (real directory, regular file, resolving-owned, resolving-foreign, dangling-foreign, sibling-prefix); the three stale entries are absent.
- `red.txt` inspected: 14 failures, 1 pass against the pre-change installer, matching the report.

## Findings against plan and brief

- C1 (four roots, repeatable): test 1 creates all four absent roots, checks each skill link resolves, checks executable link, reruns and compares raw targets and herdr call log. Met.
- C2 (absolute/relative/nested stale removed): test 2 covers all three shapes in each root via `lstatSync` undefined. Met.
- C3 (preservation): real directory with contents, regular file, resolving foreign, dangling foreign, `skills-old/missing` sibling prefix, and a resolving relative owned link all asserted present with raw targets unchanged. Met. `sep` suffix on the prefix is what excludes the sibling prefix; verified by the test.
- C4 (conflicts): 12 parametrized tests cover directory, foreign link, and wrong-owned link at every root, assert nonzero exit, the `rm -r --` line, conflict preserved, stale owned link pruned first, no other roots created, no executable link, no herdr call log. Executable conflict retained. Met.
- C5 (herdr calls): call log compared exactly against the three configured harnesses plus plugin link path. Fake herdr additions are schema-validated tuple parses with the existing `result` path; other commands still fall through to failure. Met.
- C6 (checks): all green, see above.
- Production change is 18 lines, stdlib only, no new abstractions, no signature changes. Prune runs before the unchanged conflict filter as designed (D2, D3). Ponytail ladder satisfied.
- No lesson claim in the report, none required.

## Nits

- N1: `docs/install.html` step 02 still says "each agent's skill folder" and "Both agents", and the closing paragraph says nothing needs reinstalling. Behavior now covers four roots and a skill folder add/remove needs a reinstall to reconcile links (plan R3). Plan and brief exclude doc edits from this leaf, so this is not a defect of the diff; B owns doc authorship and can carry it as follow-up.

## Verdict

`nits`. No Fix findings. Requesting `merge`.

## Merge checks (slot A)

Rebase target `origin/main` = `13f92e0` (unchanged base); rebase was a no-op, head remains `391bdf9`. `AKROGON_BASE` refreshed: `13f92e0376d8b0a59ac7f9e61276e9667b0b2bf0`. Checks in the worktree: `bun run format` exit 0 (tree clean), `bun test` exit 0 (60 pass, 815 assertions), `bun run typecheck` exit 0, `test_changed` exit 0 (15 pass, 307 assertions). No advisory commands configured.
