# Brief U3: guide and README swap

## 1. Goal

Match the operator guide and README to the new seat jobs. Refines plan D4, D5, D8. After this unit, the guide teaches A as worker and B as merger, install no longer contradicts live seat values, and parts plus README are changed or verified unchanged with evidence.

## 2. Numbered acceptance criteria

1. `docs/guide/idea.md` says A implements and B merges, the pass table assigns synthesis, implement, check.fix to A, repair review and merge to B, and the export-csv example follows the same seats.
2. `docs/guide/phases.md` phase table, example `--slot` commands, and synthesis, implement, check prose assign worker jobs to A and merge plus post-repair review to B.
3. `docs/guide/merge.md` says seat B merges, records `merged --slot B`, and keeps push, rebase, broadcast behavior unchanged.
4. `docs/guide/cheat.md` example commands report implementation as A, review verdicts and blockers on the correct seats, matching the new routing.
5. `docs/guide/install.md` no longer contradicts `config.yaml`: it either names the live seats (a pi / meta/muse-spark-1.3-contributor / max, b codex / gpt-6.1-sol / high) or drops stale values and states seats are roles.
6. `docs/guide/parts.md` and `README.md` are each listed as changed with the role line fixed, or verified unchanged with the grep evidence showing no role statement.
7. `src/AREA.md` is verified as stating no seat jobs, left unedited, with grep evidence.
8. The full sweep `rg -n "slot=[AB]|--slot [AB]|review-[AB]\.md|[Ss]eat [AB]|[Ss]lot [AB]|\bAs [AB]\b|\b[AB] (merges|implements|reviews|re-?checks|synthesi)" docs/guide/idea.md docs/guide/phases.md docs/guide/merge.md docs/guide/cheat.md docs/guide/install.md docs/guide/parts.md README.md src/AREA.md` shows no old-job hit, and a full read fixes prose the regex misses.

## 3. Read-first list

- `docs/guide/idea.md`, `docs/guide/phases.md`, `docs/guide/merge.md`, `docs/guide/cheat.md`, `docs/guide/install.md`, `docs/guide/parts.md`, `README.md`, `src/AREA.md`
- `config.yaml` (live seat values for criterion 5)
- `skills/implement-issue/ponytail.md`
- Open the index only for a gap in this list.

Pattern to copy: current guide sentences with seat letters and example slots swapped in place, no restructuring.

## 4. Change list and needed interfaces

Owned paths, nothing else: `docs/guide/idea.md`, `docs/guide/phases.md`, `docs/guide/merge.md`, `docs/guide/cheat.md`, `docs/guide/install.md`, plus verify-only `docs/guide/parts.md`, `README.md`, `src/AREA.md` (edit the verify-only files only if a role statement exists). No chunk must land first. No shared test resource. No consumed output. Independent because no other unit touches these paths.

Mapping: synthesis A, implement A, check.fix A, merge B, initial check.review A+B, post-repair check.review B. Live config: a pi / meta/muse-spark-1.3-contributor / max, b codex / gpt-6.1-sol / high.

## 5. Do-not, reasons and exceptions

- Do not touch `src/` (except verify-only read of `src/AREA.md`), `config.yaml`, `tests/`, or `skills/`. Reason: owned by other units or B. Exception: none.
- Do not touch `docs/guide/chart.md` door section or any other guide page outside the owned list. Reason: design excludes them. Exception: none.
- Do not restructure pages, add sections, or reword beyond the seat swap. Reason: smallest diff wins. Exception: a sentence false after a bare letter swap may be minimally rephrased, noted in the report.
- Do not change scope on conflict. Reason: the plan is the contract. Exception: return a mismatch naming the conflict, actual text, and smallest brief correction; a revised brief from B authorizes the change.

Reasons restated: disjoint ownership prevents conflicts, excluded pages stay stable, minimal edits keep review scoped. Exceptions restated: only a revised brief from B authorizes a scope change.

## 6. Ordered steps

1. Read all eight files fully for criteria 1 to 7, noting every seat statement including prose the sweep misses.
2. Edit `docs/guide/idea.md` and `docs/guide/phases.md` for criteria 1 and 2.
3. Edit `docs/guide/merge.md` and `docs/guide/cheat.md` for criteria 3 and 4.
4. Edit `docs/guide/install.md` for criterion 5.
5. Verify or fix `docs/guide/parts.md`, `README.md`, `src/AREA.md` for criteria 6 and 7 with grep evidence.
6. Run the criterion 8 sweep over owned paths plus a full reread, fixing stragglers.

Advisory size: about 8 files and under 32 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this, after `bun install` in this worktree:

```sh
AKROGON_BASE=3704d86a92d6369be36bf600ca413be79cf81c22 bun test --changed="3704d86a92d6369be36bf600ca413be79cf81c22"
```

Zero selected tests is expected for prose-only changes; paste the result. B runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1 to 8 hold with the sweep output pasted and each of parts, README, `src/AREA.md` recorded as changed or verified unchanged with evidence. No e2e artifact from this unit. Limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
