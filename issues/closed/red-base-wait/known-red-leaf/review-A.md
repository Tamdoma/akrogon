# Review A — known-red-leaf

Base `64f27d0` → reviewed head `27b1cc8`. Verdict: **nits**.

## Verification

- `bun test --timeout=30000` — 788 pass / 0 fail (observed at implement end; no code change since, not rerun).
- `bun test --changed` — 169 pass / 0 fail; `bun run typecheck` clean.
- Diff read in full: `src/compare.ts`, `src/red-record.ts`, `src/base-run.ts`, `src/phase.ts`, `src/akrogon.ts`, `src/status.ts`, README, AREA files, both new test files, skill/guide rewrites.
- AREA paths in the diff exist (`src/compare.ts`, `src/red-record.ts`, `tests/compare.test.ts`, `tests/red-docs.test.ts`).
- Criteria 1-9 traced to their proofs in `tests/compare.test.ts`/`tests/red-docs.test.ts`; record validation ordering, lock discipline (no nested `withLock`), ancestor-rule resolve, dedupe and notice-apart all match the locked design and its `prompted_at` freshness binding.
- `Test-Change` trailers present on every commit touching test-rule paths (`95b3c6e`, `91b7160`, `6edee21`, `f53a0d8`, `27b1cc8`), each citing its real source.

## Fixes

None.

## Nits

- N1 `src/phase.ts` `recordComparisons` runs after `commitMove` returns; an append failure between move commit and effect write leaves the leaf moved with no red entry or notice. Self-healing: a later `--compare` move re-applies the same record. Promote if a real move is observed committed without its effects.
- N2 `src/compare.ts` log-existence uses the record's raw path; a relative path resolves against the caller cwd, not `leaf.path`. Seats write absolute paths per the skill; a relative path that happens to exist under cwd is accepted. Promote if a seat is seen writing relative log paths.
- N3 `skills/check-issue/SKILL.md` Standalone review still says "the base-run rule" while the paragraph renamed to comparison disposition; the pointer still resolves unambiguously.
- N4 `applyComparison` re-folds `activeRed` per unit (O(units × events)); bounded by record size, fine today.

## Notes

- `ed7b88d` bundles two format-check rewrites unrelated to the leaf (`peer-wait.ts`, `status.ts` `phaseColor`); required by the write-mode format check for a clean worktree.
- Debate was off (`debate: no`); no positions/rebuttals exist, as expected.
