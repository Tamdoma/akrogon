# Review A: terminal-stage-marker

Base: `b538c238ba374fe2adf9bb1e23e5b0b77cc93d35`
Reviewed head: `2edea9c` — "status --charts: three terminal markers, last line wins"
Debate: off (`debate: "no"`); no positions/rebuttal artifacts expected or present.

## Diff inspected

- `src/status.ts` — stage expression at `chartRow` replaced with last-match scan over `/^(Handed off|Closed|Held)\b/gm`, `.at(-1).toLowerCase()`, unchanged `files.length + fog > 0 ? 'charting' : 'empty'` fallback. Matches D1, D2, D3.
- `tests/status.test.ts` — one new test beside the existing `--charts` case covering all five required scenarios plus the single-CHART.md layout. Matches D6.
- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md` — marker sentences name all three markers, `<YYYY-MM-DD>` shape, own-line requirement, last-wins. Matches D4.
- No `AREA.md` in the diff; the area path-existence check is vacuous.

## Verification evidence

- `bun test tests/status.test.ts` — 16 pass, 0 fail, including `--charts derives stage from last terminal marker line`.
- `bun run typecheck` — clean.
- `bun run format` — no changes; worktree clean after.
- Evidence artifact `.evidence/terminal-stage-marker/status-charts.txt` exists at worktree root and shows all five stages (`charting`, `empty`, `handed off`, `held`, `closed`) from a real `status --charts` run. Criterion 8 met.

## Criteria trace

1. Three markers recognized — regex alternation, verified by test and evidence run.
2. Trailing text permitted — `trailing` case (`Handed off 2026-09-11 into foo`) reads `handed off`.
3. Last marker wins — `forward`/`backward` cases both directions.
4. Marker not at line start ignored — `buried` case (`- Closed the gap on x`) reads `empty`.
5. `Closed` beats fork fallback — `shuttered` case with retained fork reads `closed`.
6. Multi-folder and single `issues/chart/CHART.md` resolve through same path — second half of test.
7. Writer contract in both skill files — verified in diff.
8. Evidence artifact — present and named in report.
9. Blocking checks — pass, rerun above.

## Findings

None.

Edge cases considered and rejected as findings: a marker-shaped line inside a fenced block would match, but the same held for `^Handed off\b` before and the writer contract defines markers as own-line appends; lowercase `closed` does not match, consistent with the prior case-sensitive contract; `\b` correctly rejects `Closedown`-style prefixes while accepting `Closed:` punctuation.

## Verdict

ready

## Merge evidence

- No rebase needed: `origin/main` (`b538c23`) is already the direct parent of reviewed head `2edea9c`; `git merge-base --is-ancestor origin/main HEAD` confirmed.
- `AKROGON_BASE` refreshed post-check: `b538c238ba374fe2adf9bb1e23e5b0b77cc93d35` (unchanged).
- `bun run format` — all files unchanged.
- `bun run typecheck` — `tsc --noEmit` clean.
- `bun test --changed="$AKROGON_BASE"` — 16 pass, 0 fail in `tests/status.test.ts`.
- `bun test` (full suite) — 218 pass, 0 fail, 2874 expect() calls across 12 files.
