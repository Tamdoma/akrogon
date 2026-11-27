# Direct report: consultant-recipe

Base 011d47575accb875bdf898f5b52f67d016a1120f, head 0b00bfb5e016912a8e742518e037f527357473a4, worktree /home/ivan/.akrogon/worktrees/akrogon/consultant-recipe-required, branch consultant-recipe-required.

## Commits

- 6dd1e052 test: refusal case (red on base), fixtures gain consultant, hc missing-recipe test removed.
- cf9a8a2e fix: schema requires slots.consultant; dead throw, guard and conditional spread removed; docs and watch skill text.
- 0b00bfb5 test: rollback case strips consultant for the pinned pre-consultant release.

## Changed files and reasons

- src/config.ts: `globalSchema.slots.consultant` required; `superRefine` loops `config.slots` directly; `effectiveConfig` prints `consultant` unconditionally (Taken 1, 2).
- src/akrogon.ts: `recipe === undefined` throw deleted, `resolve` and `globalHome` imports no longer used (Taken 2).
- skills/watch-issues/SKILL.md `## Consult`: missing-recipe notify-only sentence deleted (Taken 3).
- docs/reference/config.md, docs/reference/commands.md, docs/start/install.md: key required (Taken 5).
- tests: see commits; Test-Change trailers in each.

## Proofs

- Refusal of a keyless config, naming the file and `consultant`: tests/config.test.ts "config refuses a machine config without slots.consultant, naming the file and the key". Red on base src at 6dd1e052 (`check red-on-base: 1 .../direct/check-red-on-base-1795615714275-4001336.log`), green on head (verify below).
- Targeted suite on the uncommitted change: `check targeted: 0 .../direct/check-targeted-1795615700488-3987771.log` (137 pass).
- First `akrogon verify --holder` on cf9a8a2e: test red, 1 fail, tests/rollback.test.ts manual-steps case (`check-test-1795615868319-4017288.log`); cause in the diff (fixture consultant refused by the pinned old release), repaired in 0b00bfb5, `check rollback: 0 .../direct/check-rollback-1795615921575-150610.log`.
- `akrogon verify --holder` on 0b00bfb5: setup, format, typecheck green; test 1466 pass 0 fail, changed-test rerun 620 pass 0 fail (`check-test-1795616068103-153766.log`). Wall time 2m21s.

## Known limitations

- e2e files (not in `checks`) were edited for the required key but not run: no live run (signpost S7a).
- Landing waits on needs row N1 (live `~/.akrogon/config.yaml` has no consultant key) and the worktree `config` gate (Taken 6).
- A mistake of A's own: a `git checkout src` with an unset TMPDIR dropped the uncommitted code edits once; they were reapplied identically before commit.
