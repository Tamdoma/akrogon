# Review-B: init-lessons-union

Base: `53508e807128de2a77b22cf4874e266224cf4f0e`
Reviewed head: `b0b858d5f1bc3f0fc0fd250c0ff821c20e12dc65`
Worktree clean, head ahead of base. Blind review; peer review not read.

## Diff scope

Exactly 4 files: `src/init.ts`, `tests/init.test.ts`, `skills/init-akrogon/SKILL.md`, `docs/guide/setup.md`. No `issues/` paths on the branch. No AREA.md in the diff, so no area path-existence check applies.

## Decisions and criteria

- D1-D6 hold: `src/init.ts` appends the literal line inline after the `.gitignore` block with the same pattern, exact-line `split('\n').includes` check, separator newline, skip-when-present. No helper, no mode flag.
- C1: test asserts exact bytes `learnings/LESSONS.md merge=union\n` plus `git check-attr` printing `merge: union`. Literal git output assertion is a fixed reference that runs literally. Passes.
- C2: test covers unterminated `* text=auto eol=lf` join and byte-identical repeat. Passes.
- C3: test resolves `git rev-parse --git-path info/attributes`, tolerates absent file, asserts no rule. Passes.
- C4: two-clone test commits init output, pushes, appends different lesson lines both sides, clean `pull --rebase` exits 0 with both lines present; then conflicting `file` edits exit non-zero with `diff-filter=U` naming `file`. Setup uses throwing `command()` (failures surface), cleanup in `finally`. Passes.
- C5: `merge=union` grepped at `skills/init-akrogon/SKILL.md:76` and `docs/guide/setup.md:31`, both inside the command-writes sentences. `docs-links` passes.
- C6: report records `/tmp/init-lessons-union-init-test.log` (exists, 20 pass 0 fail). Full suite 330 pass per report.

## Exclusions and contracts

- No `.git/info/attributes` or `log.jsonl` terms in `src/init.ts`; no gacp/sync changes; nothing under `issues/`. Matches design.
- New `run()` import is the existing non-throwing `src/shell.ts:17` returning `Result`; correct for asserting pull exit codes.
- Changed behavior's doc pages (setup guide, init skill) are in the diff with true claims; no other documented behavior changed.
- Tests use real CLI + real git, no mocks of the unit under test, no prose wording assertions.
- Ponytail: shortest reasonable diff, pattern reused, no abstraction added.

## Verification evidence

- Reviewer rerun on `b0b858d`: `bun test tests/init.test.ts tests/docs-links.test.ts` → 23 pass, 0 fail.
- Relied on report for full suite (330 pass), typecheck, and format; reran the affected tests as the specific concern.

## Findings

None. No Fix, no Nit.

## Verdict

ready
