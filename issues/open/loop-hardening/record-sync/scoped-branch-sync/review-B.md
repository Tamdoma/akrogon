# Review B

Verdict: fix.

Base: `8eebd88033301dfd7dbe943641d3028bf4b3a041`.
Reviewed head: `17048a06f95dfd332d2fd9ccacb91353aa2d0f29`.
The worktree is clean, HEAD is one commit ahead of the base, and the diff contains only `src/sync.ts` and `tests/sync.test.ts`.

## F1 — Fix: incoming tracked files overwrite ignored operator files

Location: `src/sync.ts:88` through the rebase and push at line 102.

Contract: brief's requirement to leave unrelated tree/index contents untouched, plan D5's requirement to preserve unrelated untracked files, and implementation acceptance criterion 3. An ignored file is still an untracked operator file. Autostash does not preserve it, and Git's checkout during rebase permits overwriting ignored files.

Reproduced through the real CLI in an isolated initialized repository and local bare remote:

1. Baseline main tracks `issues/config.yaml`, an ordinary file and `.gitignore` containing `collision`.
2. In a second clone, write `collision` with `remote bytes\n`, force-add it with `git add -f collision`, commit and push main.
3. In the original checkout, write the ignored, untracked `collision` with `operator untracked bytes\n`, plus an eligible `issues/record`.
4. Run `bun <reviewed-worktree>/src/akrogon.ts sync` with an isolated `AKROGON_HOME`.

Observed: exit 0, no error output, `collision` now contains `remote bytes\n`, and the remote advances with the sync commit. The original operator bytes are lost. The same scenario without `.gitignore` exits 1, preserves `operator untracked bytes\n`, and does not advance the remote. This establishes the ignored-file gap rather than a general collision handling failure.

Required repair: protect ignored operator files from incoming/replayed Git changes too. Refuse an integration that would overwrite them, leaving their contents intact and preventing push. Add a fail-first real CLI regression for this scenario. Do not solve it by adding ignored files to the sync commit or by silently reporting success after restoration failed.

## Verification evidence

- Read the complete two-file change against the finalized plan and revised brief, including branch/index guards, literal exclusions, active-lock tree/history validation and post-autostash conflict handling.
- Confirmed documented scope exclusions: `docs/files.html` and `docs/limits.html` still describe the former behavior, with updates explicitly owned by command-reference. This is not a finding on this leaf.
- Existing evidence belongs to the reviewed commit: `bun test` passed 84 tests with 1007 assertions, targeted/changed sync tests passed 25 tests with 198 assertions, formatting and typecheck exited 0. These checks were observed during implementation in this session and were not repeated without a code change.
- Read `implementation/cli-artifact.log`: real bare-remote scenario contains only `issues/open/demo/record.md` in the sync commit and preserves unrelated noncolliding files.
- Ran the two additional real CLI collision scenarios above during review. Temporary fixtures were removed. Neither run accessed the actual project remote or operator files.

No additional blocking findings or nits. Passing existing checks does not cover F1's ignored-file collision.
