# Report: bounce-repair-proof

Base: 2e78945849eed87c42abd56f224909f4d2050b36. Head: 12da5ce (on `bounce-repair-proof`). Skill-text leaf; no code or test changes.

## Changed files and reasons

- `skills/merge-issue/SKILL.md` (587308b): red ending now records each failing command exactly as invoked (command and arguments) with its failing output, rebase target commit and tested head, per criterion 1 / D1. Ending order, `--attempt` call and split wording untouched.
- `skills/implement-issue/SKILL.md` (8d9d3b7): check.fix merge-repair line expanded into the replay (fetch, rebase onto current `<remote>/<default_branch>`, verbatim rerun of every recorded command, evidence fields in `report.md`, red rerun stays in-pass); :80 names the recorded command as the replay's target; :63 and :84 gained the single exception sentence (criteria 2, 3 / D2, D3).
- `skills/check-issue/SKILL.md` (0f1af33): re-check after a bounce requires the replay evidence in `report.md` and treats it missing as a Fix (criterion 4 / D4); :85 exception scoped to A's `check.fix` only (criterion 3).
- `skills/plan-issue/SKILL.md` (0f1af33): :63 gained the same exception sentence (criterion 3).
- `skills/AREA.md`, `docs/guide/phases.md`, `docs/guide/setup.md` (12da5ce): each merge-only restatement gained the one exception clause; `docs/guide/merge.md` and `src/AREA.md` describe merge-time only and were left (D5).

## Commands run with results

- `bun run format` — green; it rewrote unrelated `src/status.ts` (pre-existing prettier drift, known lesson 2026-10-08); reverted, not part of the leaf.
- `bun test --timeout=30000` — 603 pass, 0 fail, 29 files, 60.15s.
- `bun run typecheck` — clean.
- `AKROGON_BASE=2e78945… bun test --changed="$AKROGON_BASE" --timeout=30000` — 7 changed files, no test files affected, 0/0. Vacuous green; doc-only diff.
- Criterion proofs (read/grep over diff, seconds each): `git diff 2e78945..HEAD` shows the merge-issue recording clause (c1), the implement-issue replay rule and evidence fields with no red handoff (c2), `merge_checks` at all seven sites carrying the single exception (c3), and the check-issue re-check Fix for missing replay evidence (c4). Workers verified the same in their worktrees before commit.

## Known limitations

None. Wording is reviewed against design Q1 1a by check.review; no test asserts skill text (none exists for these files — verified `tests/` has no skill-text pin beyond `chart-shapes.test.ts` on an unrelated asset).

## Unverified criteria

None. All five done-criteria verified: criteria 1-4 by diff inspection, criterion 5 by the green `checks` run above.
