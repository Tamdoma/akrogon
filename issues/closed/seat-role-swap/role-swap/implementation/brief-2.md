# Brief U2: skill wording swap

## 1. Goal

State the new seat jobs in every owned skill. Refines plan D4 and D5. After this unit, synthesis, implement and check.fix read as A work, merge and post-repair re-check read as B work, evidence paths and footers route correctly, and no owned skill assigns the old jobs.

## 2. Numbered acceptance criteria

1. `skills/plan-issue/SKILL.md` says synthesis is written as A, finishes with `akrogon phase <slug> implement --slot A`, and the description names slot A synthesis.
2. `skills/implement-issue/SKILL.md` says leaf prompts use `slot=A`, the A seat proceeds without questions, credentials and failed stops use `--slot A`, handoffs use `check.review --slot A`, repair starts at `review-B.md` rebased head. Standalone reads as session A.
3. `skills/implement-issue/brief-template.md` and `worker-protocol.md` read as A writes, delegates, cherry-picks, runs the full suite, and self-repairs.
4. `skills/check-issue/SKILL.md` says re-check after repair belongs to B, B reads `positions-B.md`/`rebuttal-B.md`, appends to `review-B.md` from the prior head or the rebased head B recorded at merge, doc authorship stays with A, footer routes `check.fix` to implement-issue A and `merge` to merge-issue B.
5. `skills/merge-issue/SKILL.md` says `slot=B`, B merges, blockers and evidence go in `review-B.md` with `--slot B` stops, red checks call `check.fix --slot B`, push then `merged --slot B`, repair footer names `implement-issue <slug> slot=A phase=check.fix`.
6. `skills/watch-issues/SKILL.md` required-seat table reads synthesis A, implement A, check.fix A, merge B, check.review A+B (B only when `fix_rounds > 0`).
7. `skills/AREA.md` reads worker returns plus A runs the final full suite, stays at most 40 lines with exactly the four H2 sections Commands, Key files, Non-obvious patterns, See also.
8. `rg -n "slot=[AB]|--slot [AB]|review-[AB]\.md|[Ss]eat [AB]|[Ss]lot [AB]|\bAs [AB]\b|\b[AB] (merges|implements|reviews|re-?checks|synthesi)"` over the eight owned skill paths shows no old-job hit; a full read also fixes prose the regex misses (`B runs`, `authorship with B`, seat tables).

## 3. Read-first list

- The eight owned skill files listed in section 4
- `src/routing.ts` (new seat mapping is the source of truth once U1 lands; this brief copies the mapping so no read dependency exists)
- `skills/implement-issue/ponytail.md`
- Open the index only for a gap in this list.

Pattern to copy: current skill sentences with seat letters swapped in place, no rewording beyond the job swap.

## 4. Change list and needed interfaces

Owned paths, nothing else: `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/implement-issue/worker-protocol.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `skills/AREA.md`. No chunk must land first. No shared test resource. No consumed output. Independent because no other unit touches these paths.

Mapping: synthesis A, implement A, check.fix A, merge B, initial check.review A+B, post-repair check.review B, standalone implement session A, merge evidence `review-B.md`, non-implementing reviewer reads `positions-B.md`/`rebuttal-B.md`.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `config.yaml`, `tests/`, `docs/`, or `README.md`. Reason: owned by other units or B. Exception: none.
- Do not touch `skills/broadcast-issue/`, `skills/chart-issues/`, or `skills/watch-issues/scripts/observe.ts`. Reason: design locks them unchanged. Exception: none.
- Do not rewrite skill structure, add sections, or reword beyond the seat swap. Reason: smallest diff wins and review stays scoped. Exception: a sentence that is false after a bare letter swap may be minimally rephrased, noted in the report.
- Do not change scope on conflict. Reason: the plan is the contract. Exception: return a mismatch naming the conflict, actual text, and smallest brief correction; a revised brief from B authorizes the change.

Reasons restated: disjoint ownership prevents conflicts, locked skills stay stable, minimal edits keep review scoped. Exceptions restated: only a revised brief from B authorizes a scope change.

## 6. Ordered steps

1. Read all eight owned files fully for criteria 1 to 7, noting every A/B job statement including prose the sweep regex misses.
2. Edit `skills/plan-issue/SKILL.md` for criterion 1.
3. Edit the three `skills/implement-issue/` files for criteria 2 and 3.
4. Edit `skills/check-issue/SKILL.md` for criterion 4.
5. Edit `skills/merge-issue/SKILL.md` for criterion 5.
6. Edit `skills/watch-issues/SKILL.md` and `skills/AREA.md` for criteria 6 and 7; verify AREA line count and H2 set.
7. Run the criterion 8 sweep over owned paths plus a full reread, fixing stragglers.

Advisory size: about 8 files and under 32 turns. Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this, after `bun install` in this worktree:

```sh
AKROGON_BASE=3704d86a92d6369be36bf600ca413be79cf81c22 bun test --changed="3704d86a92d6369be36bf600ca413be79cf81c22"
```

Zero selected tests is expected for prose-only changes; paste the result. B runs the full suite separately.

## 8. Done-when, evidence and report

Done when criteria 1 to 8 hold with the sweep output pasted and the AREA line count plus H2 list pasted. No e2e artifact from this unit. Limitations and unverified criteria stay explicit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
