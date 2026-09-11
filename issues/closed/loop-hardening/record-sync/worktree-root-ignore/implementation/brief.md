# Implementation brief

## 1. Goal
Implement plan D1–D4: init ignores the configured in-repo worktree directory while preserving existing ignore content.

## 2. Numbered acceptance criteria
1. C1: Custom `work/trees` adds exactly `work/trees/`, not the default. Git ignores a representative file beneath it.
2. C2: Omitted configuration still adds `issues/worktrees/`.
3. C3: Relative external, absolute external, and repo-prefix sibling roots add no worktree entry. Seeds and locks remain.
4. C4: Normalized relative and absolute internal roots produce `work/trees/`, including invocation from nested cwd. Repo-equal root adds no entry.
5. C5: Repeat init without proposal preserves stored setting and identical ignore bytes. Preserve user content without final newline and avoid duplicate rules.
6. C6: B captures standalone CLI evidence and runs full blocking checks after worker return.

## 3. Read-first list
Read authoritative sibling `../plan.md`, `../brief.md`, `../design.md`, then worktree `docs/setup.html`, `src/init.ts`, `src/config.ts` (`within`), `src/next.ts` (`ensureWorktree`), `tests/init.test.ts`, `tests/helpers.ts`, `src/akrogon.ts`. Copy the existing init test fixture/cleanup pattern. Read `/home/ivan/.codex/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces
Only edit `src/init.ts` and `tests/init.test.ts`. Keep `initialize(cwd: string, proposal: string | undefined, toolkit: string | undefined): Promise<void>`. Reuse `within(path: string, parent: string): boolean`, Node `resolve` and `relative`, and existing fixture/cli/yaml helpers. Append normalized nonempty internal root plus trailing slash to existing ignore candidates.

## 5. Do-not, reasons and exceptions
Do not edit schema, sync, docs, or shared helpers because this leaf owns only init ignore behavior. Do not remove existing user rules or add symlink/metacharacter handling because these remain explicit plan limitations. Return a mismatch with evidence rather than expanding scope or interfaces. Only a revised brief from B authorizes an exception. These exclusions preserve the locked narrow scope and existing user files, with revised B instructions the sole exception.

## 6. Ordered steps
1. Derive tests in `tests/init.test.ts` for C1–C5 and run changed tests before changing production code to show the defect.
2. Implement minimal candidate-list change in `src/init.ts` and run changed tests until green.
3. Fill section 8 and return results. B owns CLI artifact, formatting, full suite, typecheck, commit and handoff.
Advisory scope: two files, about five turns. Return a mismatch if materially larger work is required.

## 7. Commands
Run only this test command, before and after production changes:
`AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041`

## 8. Done-when, evidence and report
C1–C5 pass with red/green evidence, temporary repos cleaned, and no unrelated code changes. C6 artifact is saved at `implementation/cli-artifact.log`; full check evidence follows. Use real CLI processes and temporary repos without external services.

Changed files and reasons: `src/init.ts` resolves the configured worktree root against the Git repo root and adds its relative directory rule only for a strict descendant, reusing `within` and existing append/deduplication behavior. `tests/init.test.ts` covers default/custom rules, Git ignore behavior, normalized internal paths from nested cwd, external and repo-equal exclusions, user text without a final newline, stored configuration and byte-identical repeat init. All fixture repos clean up in `finally`; no temporary worker files remain.
Tests run: `AKROGON_BASE=8eebd88033301dfd7dbe943641d3028bf4b3a041 bun test --changed=8eebd88033301dfd7dbe943641d3028bf4b3a041`. Red before production changes: exit 1, 1 pass, 8 fail, 29 assertions, one test file. Failures showed the hardcoded `issues/worktrees/` instead of custom or absent entries. Green after production changes: exit 0, 9 pass, 0 fail, 33 assertions, one test file. No full suite, formatting, typecheck, CLI artifact or commit run by worker, as assigned to B.
Known limitations: Lexical containment, unescaped ignore metacharacters, preserved obsolete rules, repo-equal root unprotected. Sync belongs to sibling leaf.
Unverified criteria: None. C1–C6 verified.

B verification: `bun test tests/init.test.ts` passed (9 tests, 33 assertions). `bun run format` passed with no formatting changes. `bun run typecheck` passed. `bun test` passed (68 tests, 836 assertions, 9 files). Worker changed-tests check passed against the configured base. `git diff --check` passed. Standalone CLI init and repeat both exited 0, produced only `work/trees/`, `issues/seeds/`, and `.lock`, and preserved identical bytes on repeat. Artifact inspected at `implementation/cli-artifact.log`. Existing setup documentation remains accurate and needs no change.

Committed code: `67c82ba` (`Fix init ignore rule for configured worktree root`). Post-commit `git status --short` was empty. Only `src/init.ts` and `tests/init.test.ts` changed on the leaf branch.
