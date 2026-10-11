# Review A: plan-not-cap

Base `c53f619`, reviewed head `4b52994` (worktree clean, 5 commits on `plan-not-cap`). Diff: 9 files, +36/−48.

## Verification evidence

- `git diff c53f619...HEAD` read in full for all 9 files.
- `bun test tests/phase.test.ts tests/culprit.test.ts` at head: 71 pass / 0 fail.
- Full suite run by implement A: 792 pass / 0 fail; `bun run format` and `bun run typecheck` clean at head.
- `grep -rn "fix rounds exhausted\|repair cap\|final allowed\|last allowed" skills/ docs/` — empty at head.
- `grep -rn "config.fix_rounds" src/` — no leaf-lifecycle consumer remains; schema key retained per design D2.

## Criterion check

- C1: `transition()` commits `destination` unconditionally; `commitMove` `failure` arg is `undefined`. Tests assert `moved check.fix`, phase `check.fix`, count 1→2, `failure` absent — from `check.repair` (two tests) and from `merge`, plus the `--culprit` batch eject. Green at head. No path through the former cap reaches `failed`.
- C2: `src/config.ts` schema, `issues/config.yaml`, `skills/chart-issues/SKILL.md` untouched in the diff; `tests/config.test.ts` green.
- C3: check-issue `Handed to A` paragraph names the three plan-correction triggers; implement-issue check.fix paragraph orders `plan.md` correction plus an executable check before code, keeping brief/design/test-change protections.
- C4: forbidden phrases absent; reviewed broader hits are the direct-route bound (chart-issues:117, intentionally unchanged), seat table, schema/display fields and verbatim test fixtures.

## Findings

None at the fix bar.

Nit (deferred): `tests/phase.test.ts` keeps two synthetic `fix rounds exhausted` failure fixtures (restart and seat-refusal tests). They set arbitrary failure records, not behavior under test; a rename would clarify but does not block.

## Verdict

ready
