# Worker report: U2 — chart-issues skill and guide prose for the usage table

## Changed files and reasons

- `skills/chart-issues/SKILL.md` — Open gained the seat-record rule (open time at first-pass start, pane/harness/session from `herdr agent list` as `pane_id`/`agent`/`agent_session.value`, temp files until the chart folder exists, written to `<chart>/seats.yaml` at folder creation, appended entry per changed session id on each `herdr agent list` re-read for a peer exchange or chart write, open time never reset, outside-herdr form with `usage unmeasured`, no new operator question). Take gained the `restatements` increment (by meaning, no word list) and the Taken sentence on how often the round was restated. Handoff gained the `bun <skill-folder>/scripts/chart-usage.ts <chart-folder> [<until>]` run right before the handoff review with printed lines shown there, outcome-word reporting, `outcome partial` continuing, and a rerun when `Handed off`, `Held` or `Closed` is appended. Pure insertions; no existing sentence rewritten or reordered.
- `skills/chart-issues/assets/shapes.md` — chart records tree gained `seats.yaml` and `USAGE.md` lines; new `### seats.yaml` section placed before `### readiness.yaml` (test finds the readiness heading first, so order is safe) with the brief's exact yaml example, the replaced-session second-entry note and the outside-herdr empty `seats` note.
- `docs/guide/chart.md` — chart records listing gained `seats.yaml` and `USAGE.md`; new prose names `first turn in window`, `operator turns` and `usage unmeasured` and states the limits: window tokens/minutes show usage and elapsed time changed, not that dollar cost fell; a whole-session dollar total can include other charts and is not this chart's cost; subagent usage is not counted; turn and operator-wait definitions given.
- `docs/guide/files.md` — read only; no edit (verdict below).

## files.md verdict

No chart-records list found in `docs/guide/files.md`. It covers leaf artifacts only (ISSUE.md, brief, design, state, planning/implementation/review artifacts); no change made.

## Tests run

- `bun install` — 9 packages, clean.
- `bun test --changed=3ce20853c64d843d97a1ebe0fbef335958ac0dff --timeout=30000` — 3 changed files, no test files affected, 0 tests run, so the fallback ran.
- `bun test tests/chart-shapes.test.ts tests/docs-links.test.ts --timeout=30000` — 5 pass, 0 fail.
- `bun test --timeout=30000` (full suite) — 501 pass, 0 fail, 23 files.
- `bun run typecheck` — clean.
- Label check: `seats.yaml`, `USAGE.md`, `first turn in window`, `operator turns`, `usage unmeasured`, `outcome partial`, `restatements` all present verbatim where required.
- No-literals check on the three edited files — no hits for model names, prices or rates.

## Known limitations

- `ponytail.md`, named in the read-first list, does not exist in the skill folder; nothing to read.
- Prose changes only; the usage script behavior itself is U1's and was not exercised here.

## Unverified criteria

None. All seven criteria verified by the greps and tests above.

## Commit

f056158dc7f5aebcbe3aec86372dfccd4b36e587 — docs: chart usage records in skill and guide (3 files, 29 insertions, 3 deletions; insertions only, no existing sentence rewritten).
