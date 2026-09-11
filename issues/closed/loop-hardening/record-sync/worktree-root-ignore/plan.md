# Plan: worktree-root-ignore

Direct synthesis from brief and locked design. Leaf state has `debate: no`, so positions and rebuttals are not required. No execution dependency on sibling `scoped-branch-sync`.

## Read first

- Authoritative leaf: `issues/open/loop-hardening/record-sync/worktree-root-ignore/brief.md` and `design.md` in the registered main checkout.
- `REFERENCE.md` and `learnings/LESSONS.md`.
- `docs/setup.html`: init behavior and worktree configuration.
- `src/init.ts`: parsed configuration and append-only ignore handling.
- `src/config.ts`: `repoSchema` and `within`.
- `src/next.ts`: `ensureWorktree` resolves the configured root against the repo.
- `tests/init.test.ts`, `tests/helpers.ts`, `src/akrogon.ts`, and `package.json`: real CLI fixtures, entry point, and checks.

## Decisions

- D1: Change only ignore additions in `src/init.ts` and their coverage in `tests/init.test.ts`. Preserve config parsing, registration, toolkit handling, seeds and locks. No schema or sync changes.
- D2: Resolve `config.worktree_root` against the Git top-level `root`, reuse `within(resolvedWorktreeRoot, root)`, and derive the ignore entry with `relative(root, resolvedWorktreeRoot)` plus one trailing slash. This supports normalized relative paths and absolute paths inside the repo without requiring the directory to exist. External paths add no worktree entry. A path equal to the repo root adds no worktree entry because there is no descendant directory to name without ignoring the repository wholesale.
- D3: Feed the optional worktree entry into the existing additions list alongside `issues/seeds/` and `.lock`. Preserve existing text, newline handling and exact-line deduplication. Do not remove old entries or rewrite equivalent user rules. Keep all logic local to `initialize`, importing the existing helper and Node path function.
- D4: Verify behavior through the existing real CLI fixture, including Git's interpretation of the generated rule. Capture a separate successful CLI run and its resulting `.gitignore` in the required leaf artifact.

## Acceptance criteria

- C1: Fresh init with proposal `worktree_root: work/trees` produces exactly one `work/trees/` line and no `issues/worktrees/` line. A file beneath `work/trees/` is ignored by Git.
- C2: A proposal omitting the setting produces exactly one `issues/worktrees/` line.
- C3: `../trees`, an absolute external path, and a sibling path sharing the repo-name prefix produce no worktree ignore entry. Seeds and locks remain present.
- C4: `./work/temporary/../trees/` and an absolute path inside the repo both produce `work/trees/`. Run at least one case from a nested cwd to confirm resolution uses the repo root. A root equal to the repo produces no worktree entry.
- C5: Re-running init without `--from` retains the stored custom setting and leaves `.gitignore` byte-for-byte unchanged. Existing user content without a final newline is preserved and separated correctly. Seeds, locks, and the worktree rule are not duplicated.
- C6: The real CLI artifact records invocation, successful exit, and resulting `.gitignore`. Focused tests and all configured blocking checks pass.

## Ordered implementation checklist

1. A1: Extend `tests/init.test.ts` using `fixture`, `yaml`, and `cli`, with isolated cases for C1–C5 and cleanup in the existing `finally` pattern. Reuse `command` or `run` from `src/shell.ts` for `git check-ignore` against a representative custom-root file. Confirm custom and external cases expose the current hardcoded behavior.
2. A2: Update the ignore candidate construction in `src/init.ts` following D2–D3. Keep `initialize(cwd, proposal, toolkit): Promise<void>` and all existing exported interfaces unchanged. Run `bun test tests/init.test.ts` until C1–C5 pass.
3. A3: Run a standalone `bun --eval` verification from the worktree using imports from `tests/helpers.ts` and Node fs/path. Create an isolated fixture, write a proposal containing `worktree_root: work/trees`, invoke `cli(f, ['init', '--from', proposal])`, require exit zero, and assert the expected custom rule and absence of the default rule. Invoke init again and require identical ignore content. Write the invocation, both exit codes, and resulting file to the authoritative leaf's `implementation/cli-artifact.log`, then clean the fixture in `finally`. This invokes the live `bun src/akrogon.ts init --from <proposal>` subprocess through the existing helper. No persistent verification script or global configuration changes.
4. A4: Run `bun run format`, `bun run typecheck`, `bun test`, and the configured changed-test check `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"`. Inspect `git --no-pager diff --check` and the final diff for scope. Record check results and artifact path in implementation evidence.

## Evidence and limitations

Planning baseline: `bun test tests/init.test.ts` passes with 1 test and 12 assertions. The live ignore candidates still begin with hardcoded `issues/worktrees/`, while worktree creation already reads configuration.

Containment is lexical, matching existing path resolution. Symlink topology and literal escaping of Git-ignore metacharacters are not addressed by this narrow change. Existing obsolete rules remain when configuration changes. Choosing the repo itself as the worktree root cannot be protected with a descendant-directory ignore line and remains a limitation. Sync staging safeguards belong to the sibling leaf and are not established by this implementation.
