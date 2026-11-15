# Worker brief 2 — seat known-red text in four skills

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/nameless-base-red-u2` (detached at d534acd5). Text-only unit; no install needed unless you run the doc test (then `bun install --frozen-lockfile --backend=copyfile`).

## 1. Goal

Plan decision D5 / design coverage-rule Q2 2a and Q3 3d: the known-red paragraph of each seat skill states the widened judgment rule, and the "blocked" sentence gains the agreed-known-red exception. This is the locked design text; copy its substance, not new wording.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/SKILL.md` (the known-red paragraph in `## Shared context`, ~line 40), `skills/check-issue/SKILL.md` (`check.review` paragraph, ~line 69), and `skills/merge-issue/SKILL.md` (red-verify paragraph, ~line 79): each states the judgment rule below and the blocked exception below, in that seat's own terms (its own record file).
2. `skills/chart-issues/SKILL.md` `## Direct route`, landing step 3 (the `akrogon verify --holder <chart>/direct --known-red` step): states the judgment rule below and adds the clause that a check recorded `blocked` behind an agreed known-red is named as not run in `<chart>/direct/report.md` and never reported as passing.
3. No file still says judgment means only "the red command logged a real test name and that name also fails on the base" or that a blocked check's blocker is fixed first without exception.

Judgment rule (locked design Q2 2a, verbatim substance): a known-red exit 0 counts as passing only when the seat's judgment agrees, and the judgment is runner completeness and causal fit, meaning one of: the red command logged a real test name and that name also fails on the base (unchanged); or the red command's log names no test on the head and on the base, and the seat, having read both logs whole, finds that the head shows no failure the base lacks, judged in substance and never as exact text, that the command ended by its own verdict and was not killed, timed out or crashed, and that the leaf's diff holds no plausible cause. A command that ended by its own verdict with an ordinary error, a missing input or a load diagnostic is not excluded for naming no tests. When both logs exist but show too little to establish a cause, the seat withholds agreement and the existing blocking path applies. In both cases the leaf's own done-criteria proofs must pass on their own; a cover never stands in for them.

Blocked exception (locked design Q3 3d, verbatim substance): the sentence "A check recorded `blocked` in a verify receipt did not run, so the check named as its blocker is fixed first" gains one exception: when the blocker is a known-red the judgment agrees with (named or nameless), the blocked check stays recorded as not run, is named as not run in the seat's record and never reported as passing, and does not by itself stop the leaf. A done-criterion whose proof is a blocked check cannot be shown, so that leaf stops under its existing rule. No blocked command is run by the seat or by `--known-red`.

## 3. Read-first list

- The three paragraphs named above (implement-issue ~line 40, check-issue ~line 69, merge-issue ~line 79) and chart-issues `## Direct route` step 3 (~line 117) — read each whole paragraph before editing.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

- One edit per file inside the existing known-red paragraph: replace the judgment clause "…reads the head and base logs of each red command for runner completeness and causal fit, meaning the red command logged a real test name and that name also fails on the base." (merge-issue phrases it differently; same substance) with the judgment rule, and extend the blocked sentence with the exception. Keep each skill's own record-file naming (`implementation/report.md`, `review-B.md`, `<chart>/direct/report.md`) and existing surrounding clauses (`kept logs`, `inconsistent`, filing rule, retry) untouched.
- merge-issue has no existing explicit "causal fit means" clause; add the rule in the same position the judgment is named.
- chart-issues step 3 has no blocked sentence; append the naming clause after its judgment-recording clause.

Owned paths: the four SKILL.md files. Shared test resource: none. Must land first: nothing (wave 1 of 1).

## 5. Do-not, reasons and exceptions

- Do not reword locked clauses outside the judgment and blocked sentences — the rest of each paragraph (retry, filing, whole-green skip) is settled text.
- Do not add a check list, table, or new section — the design requires one rule inside the existing paragraph.
- Do not touch `docs/` or `src/` — other units own them.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the four paragraphs whole.
2. Edit each in place per section 4.
3. Run the doc test command below (optional install first).
4. Commit with message `docs: state the nameless known-red judgment and blocked exception in seat skills`.

Size: 4 files, under 20 turns.

## 7. Commands

`akrogon run-check --leaf /home/ivan/Work/infra/akrogon/issues/open/known-red-nameless/nameless-base-red --name worker2-docs -- bun test --timeout=30000 tests/docs-links.test.ts`

Run it in the worktree. Cite the `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

All four files edited, the doc test passes, `git status` clean, commit ID returned.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
