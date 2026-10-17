# Brief u2: seat-skill wording and AREA.md for known-red

Worktree: /home/ivan/.akrogon/worktrees/akrogon/known-red-pass-u2

## 1. Goal

Implement plan decisions D10–D12 of `plan.md` (at `/home/ivan/Work/infra/akrogon/issues/open/main-red/known-red-pass/plan.md`): replace the retired "every commit on the default branch passed `akrogon verify`" claim in the seat skills with the `akrogon verify --known-red` step, route the chart-issues direct landing through it, and update `src/AREA.md`.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` and `skills/check-issue/SKILL.md`: after the one retry stays red and the seat judges no cause in the diff, the text directs the seat to run `akrogon verify --known-red`, read the head and base logs of each red command for runner completeness and causal fit, record that judgment in `implementation/report.md` or the review beside the kept logs, and treat a known-red exit 0 as passing only when that judgment agrees; neither file still claims a no-cause red is never a base defect.
2. `skills/merge-issue/SKILL.md` Shared endings: a red rerun with no cause in the stack's diff gets `akrogon verify --attempt <id> --known-red` before the `check.fix` ending; the same both-logs judgment is recorded in `review-B.md`; a pass the judgment agrees with proceeds to `merged --check`.
3. `skills/chart-issues/SKILL.md` landing step 3: after a red `akrogon verify --holder <chart>/direct` on the rebased head, the door retries once on the same head, judges the diff for a cause, and on a no-cause red runs `akrogon verify --holder <chart>/direct --known-red` before direct-guards; only a failing known-red result counts as a blocking landing-check failure (repair-bound wording updated to match).
4. `src/AREA.md`: the `src/verify.ts` line and the run-description line describe `--known-red` and the `compares` link.
5. The doc-contract tests in `tests/docs-links.test.ts` (already at HEAD) pass: `--known-red` present in implement/check/merge skills, `akrogon verify --known-red` in implement/check, `akrogon verify --attempt <id> --known-red` in merge, `verify --holder <chart>/direct --known-red` and `failing known-red` in chart-issues, and the literal `Every commit on the default branch passed` absent from all three seat skills.

A worker writes and edits no test: a planned test that is wrong or red returns a mismatch, never a test fix.

## 3. Read-first list

- `skills/implement-issue/SKILL.md` — the retry paragraph in Shared context (~line 40), the implement-end retry line (~line 65), the check.fix retry line (~line 78)
- `skills/check-issue/SKILL.md` — the check.review paragraph (~line 69) and the check.repair cross-reference (~line 91)
- `skills/merge-issue/SKILL.md` — Shared endings (~line 73–77)
- `skills/chart-issues/SKILL.md` — direct landing steps (~line 109–120)
- `src/AREA.md` — lines 6, 21, 35 (verify mentions)
- `plan.md` D10–D12 at the leaf folder path above
- `skills/implement-issue/ponytail.md`
- `tests/docs-links.test.ts` — the two new tests at HEAD define the literal strings

## 4. Change list and needed interfaces

Chunks that must land first: none. Owned paths: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `src/AREA.md`. No shared test resource. Sibling unit u1 owns `src/verify.ts`, `src/flaky.ts`, `src/akrogon.ts` — do not touch them.

Edit guidance:

- implement-issue: in the Shared context retry paragraph replace the sentence "Every commit on the default branch passed `akrogon verify`, so a red with no cause in the diff is never handed off as a base defect" with the known-red disposition per criterion 1 (retry stays red → `akrogon verify --known-red` → read head and base logs of each red command → record the completeness/causal-fit judgment in `implementation/report.md` beside the kept logs → an exit 0 counts as passing only when that judgment agrees). Apply the same disposition to the `akrogon verify` run at implement end and in check.fix where the same paragraph or cross-references govern it.
- check-issue: same replacement inside the check.review paragraph (sentence "Every commit on the default branch passed `akrogon verify`, so a red with no cause in the diff is never ruled a base defect"); judgment is recorded in the review.
- merge-issue: in Shared endings, after "a red rerun takes the ending below" insert the `akrogon verify --attempt <id> --known-red` step before the `check.fix` ending; record runs and judgment in `review-B.md`; a pass the judgment agrees with goes on to `merged --check`. Keep the memberless-vs-members stack-red distinction intact.
- chart-issues: landing step 3 becomes "…writes the receipt direct-guards requires; on a red run the door retries once on the same head, judges the diff for a cause, and on a no-cause red runs `akrogon verify --holder <chart>/direct --known-red`" and update the repair-bound sentence so only a failing known-red result counts as the blocking landing-check failure.
- src/AREA.md: `src/verify.ts` line — mention `--known-red` running the merge-base fresh and linking via `compares`; the paragraph near line 35 about receipts — mention the linked base run. Keep lines under 40 total in the file's existing style.
- Grep `docs/` and `README.md` for `passed verify`, `base defect`, `default branch passed` — report any hit; do not edit hits (plan names no doc there; a hit is a report item).

## 5. Do-not, reasons and exceptions

- Do not touch `src/*.ts` other than `src/AREA.md` — u1 owns the code; the exception is a revised brief from A.
- Do not edit `skills/plan-issue/SKILL.md` — owned by sibling leaf expiring-time-rule; no exception.
- Do not edit tests or `docs/` files — the plan names none; report hits instead; the exception is a revised brief.
- Do not paraphrase the command literals — tests assert exact strings `akrogon verify --known-red`, `akrogon verify --attempt <id> --known-red`, `verify --holder <chart>/direct --known-red` and `failing known-red`; the exception is a revised brief renaming them everywhere.
- Return a mismatch with evidence instead of changing scope or wording contracts; the exception is a revised brief from A.

The reasons: the string contracts are the doc-contract tests at HEAD, the file ownership split is the merge contract with u1, and plan-issue's line is the other leaf's locked surface. Exceptions are a revised brief only.

## 6. Ordered steps

1. Edit `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` per criterion 1–2.
2. Edit `skills/chart-issues/SKILL.md` per criterion 3.
3. Edit `src/AREA.md` per criterion 4.
4. Grep `docs/` and `README.md` per the change list; record hits.
5. Run the section-7 command; it must pass. Also confirm `bun test tests/docs-links.test.ts` whole file green.
6. Commit your chunk with a clear message (skill/docs edits only; no `Test-Change:` trailer needed — no existing test file changes).

Advisory size: about 5 files and under 20 turns.

## 7. Commands

- `akrogon run-check --name u2-docs -- bun test tests/docs-links.test.ts`
- `akrogon run-check --name u2-typecheck -- bun run typecheck` (after `bun install --frozen-lockfile` in the worktree)

If `akrogon run-check` refuses the caller, plain `bun test` in the worktree is acceptable for iteration, but cite `akrogon run-check` for the final kept output.

## 8. Done-when, evidence and report

All section-7 commands exit 0, cited by their printed `check <label>: <exit> <path>` lines; `git status --porcelain` clean; commit ID returned. Report any `docs/`/`README.md` hits from the grep.

Changed files and reasons: commit 8719c85, 5 files.
- `skills/implement-issue/SKILL.md`: Shared context retry paragraph replaces the retired "Every commit on the default branch passed `akrogon verify`" claim with the known-red disposition (retry stays red → `akrogon verify --known-red` → read head and base logs of each red command for runner completeness and causal fit → exit 0 counts only when that judgment agrees, recorded in `implementation/report.md` beside the kept logs); the implement-end and check.fix lines now cross-reference "the Shared context retry and known-red rules". Criterion 1.
- `skills/check-issue/SKILL.md`: same replacement inside the check.review paragraph, judgment recorded in the review; the check.repair pointer at ~line 91 still points at that paragraph. Criterion 1.
- `skills/merge-issue/SKILL.md`: Shared endings gains `akrogon verify --attempt <id> --known-red` on the same head after the red rerun, `review-B.md` records the run and both-logs judgment, an agreed pass goes on to `merged --check`; the memberless-vs-members stack-red split is untouched. Criterion 2.
- `skills/chart-issues/SKILL.md`: landing step 3 retries the red `akrogon verify --holder <chart>/direct` once on the same head, judges the diff, runs `akrogon verify --holder <chart>/direct --known-red` on a no-cause red and records the judgment in `<chart>/direct/report.md`; only a failing known-red result or a disagreeing judgment is a blocking landing-check failure, and the repair-bound sentence says the same. Criterion 3.
- `src/AREA.md`: `src/verify.ts` line names `--known-red`, the merge-base base run and the `compares` link, and widens the gate description; the receipt paragraph names `compares` on base records; the Commands `verify` synopsis gains `[--known-red]`. 44 lines total before and after (the file was already over the 40-line target; trimming it would be unrelated cleanup). Criterion 4.

Tests run:
- `akrogon run-check --name u2-docs -- bun test tests/docs-links.test.ts` → `check u2-docs: 0` (7 pass, incl. both new doc-contract tests).
- `akrogon run-check --name u2-typecheck -- bun run typecheck` → `check u2-typecheck: 2`, pre-existing at HEAD and not from this chunk: 5 errors, all `compares` missing from `verifyRunSchema` in `tests/verify.test.ts` and `tests/receipt-gates.test.ts`, which u1's `src/verify.ts` widening supplies. Proven by stashing this chunk and rerunning on the pristine HEAD tree: `check u2-typecheck-baseline: 2`, same 5 errors.
- `git status --porcelain` clean after the commit; `bun install --frozen-lockfile` run in the worktree first.

Known limitations: `u2-typecheck` cannot reach exit 0 until u1 lands `compares` in `src/verify.ts`; the brief's "chunks that must land first: none" does not hold for the typecheck command only. `skills/implement-issue/SKILL.md` line 82 still says a red rerun after a red merge ending is never handed to `check.review`, which an agreed known-red pass now contradicts; it is outside criteria 1-3 and was left untouched.

Unverified criteria: criterion 5 typecheck half (see above) — the docs-contract half passes. Criteria 1-4 verified by string inspection of the committed diff plus the passing doc test.

docs/`README.md` grep for `passed verify`, `base defect`, `default branch passed` (also `base red`): no hits (grep exit 1). The only pre-edit hits were the two seat-skill lines this chunk replaced.
