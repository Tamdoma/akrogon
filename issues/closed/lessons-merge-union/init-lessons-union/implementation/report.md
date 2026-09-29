# Implementation report: init-lessons-union

Base: `53508e807128de2a77b22cf4874e266224cf4f0e`
Head: `b0b858d5f1bc3f0fc0fd250c0ff821c20e12dc65`
Branch: `init-lessons-union` (commits `7e1a268` code+tests, `5b7b5e1` docs, `b0b858d` format)

Delegated mode, one wave of 2 workers (brief-1 code+tests, brief-2 docs). Cherry-picked serially onto the lane with changed tests green after each pick. Worker worktrees removed before the full suite.

## Changed files and reasons

- `src/init.ts`: `initialize()` appends `learnings/LESSONS.md merge=union` to `<root>/.gitattributes` inline after the `.gitignore` block, reusing its exact pattern; skips the write when the line is present. Implements D1-D6.
- `tests/init.test.ts`: 4 new tests — missing-file bytes + `git check-attr` (C1), unterminated content + byte-identical repeat (C2), no local `info/attributes` rule (C3), two-clone rebase positive union + negative unrelated-conflict leg (C4). Imports `appendFileSync` and `run` (non-throwing, for asserting pull exit codes).
- `skills/init-akrogon/SKILL.md:76`: command-owns sentence names the `.gitattributes` union rule (C5, agent doc).
- `docs/guide/setup.md:31`: writes sentence names the union attribute (C5, human doc).

No AREA.md change: no new commands, files, or patterns. No doc made stale by the diff beyond the two planned edits.

## Commands run with results

Worker U1 (in `init-lessons-union-u1`, removed):
- Red first: `bun test init.test.ts -t 'gitattributes|attributes|union'` → 3 fail, 1 pass (C1, C2, C4 red; C3 trivially green pre-change).
- `AKROGON_BASE=53508e8... bun test --changed="$AKROGON_BASE"` → 2 changed files, 1/15 test files, 20 pass 0 fail.

Worker U2 (in `init-lessons-union-u2`, removed):
- `bun test --changed=...` → 2 changed files, no test files affected, exit 0.
- `bun test tests/docs-links.test.ts` → 3 pass 0 fail.

Lane (B), after each cherry-pick:
- `bun test --changed="$AKROGON_BASE"` → 20 pass 0 fail (both picks).

Final verification on head `b0b858d`:
- `bun run format` → applied (wrapped 2 lines), committed as `b0b858d`.
- `bun run typecheck` → `$ tsc --noEmit`, clean.
- `bun test tests/init.test.ts` → 20 pass, 0 fail, 105 expects. Artifact: `/tmp/init-lessons-union-init-test.log`.
- `bun test` → 330 pass, 0 fail, 3878 expects, 15 files, 70.48s.

## Known limitations

- Union merge silently retains both sides on overlapping edits to the same lesson line and on delete-vs-edit (accepted per design Q5 5a; next prune removes leftovers).
- Rebase test relies on git's built-in `union` merge driver (git 2.55.0 in this environment).

## Unverified criteria

None. C1-C6 all verified: C1-C4 by the new tests on real CLI + real git, C5 by grep (`merge=union` at both doc lines) + docs-links, C6 by the runs above.
