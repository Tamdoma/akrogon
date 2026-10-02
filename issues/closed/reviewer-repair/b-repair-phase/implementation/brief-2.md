# Brief 2: check-issue skill gets the check.repair section (U2)

## 1. Goal

`skills/check-issue/SKILL.md` describes B's new `check.repair` pass and routes a review `fix` to it. Plan decisions D5, D6, D7.

## 2. Numbered acceptance criteria

1. A new `## check.repair` section sits between `## check.review` and `## Printed footer`. Write it as plain prose in the file's style, one idea per paragraph, and keep it short. It states all of the following:
   1. Input: every Fix in the review files for the latest reviewed head, meaning both initial reviews or B's latest re-check entry in `review-B.md`.
   2. B repairs every Fix except plan or design changes, missing planned units, required live runs, and work B judges too large for its pass. Each of those goes under a `Handed to A` heading in `review-B.md`, one line each with the Fix and the reason. B never edits `plan.md` or `design.md`.
   3. Operator-only items follow the operator-only rule in Shared context. Use a one-sentence pointer and do not restate the rule. They are never handed to A. When only operator actions remain after B's repairs, B makes that rule's one `failed` stop. When `Handed to A` items also remain, B moves to `check.fix`, and A's check.fix makes the stop after its repairs.
   4. Each behavior Fix gets its own commits, never shared with another Fix. First comes a commit adding a test that reproduces the recorded source, run and shown failing. Then comes the fix commit. The failing and passing output go in `review-B.md`.
   5. Each docs or command Fix is its own commit, with before and after evidence (quoted text or command output) in `review-B.md`.
   6. A red test or check with no cause in the leaf's diff takes the same base-run disposition as check.review. Point to that check.review paragraph by name and do not copy it.
   7. After repairs, B runs proof for every done-criterion in `plan.md` and every `checks` command. B does not run `merge_checks`, because merge runs them.
   8. B appends a dated `check.repair` entry to `review-B.md` naming each Fix repaired, its commits and its evidence, plus any `Handed to A` list.
   9. Finishes. With nothing handed to A and no open operator action: `akrogon phase <slug> merge --slot B`. With any `Handed to A` item: `akrogon phase <slug> check.fix --slot B`. The command counts that handoff and answers `moved failed` at the repair cap. Then print the footer and stop.
2. Line 3 description: review a leaf, repair most Fixes as B in check.repair, or re-check A's repair diff as B. Keep it to one sentence.
3. Line 10 prompt line: add `phase=check.repair`, which belongs only to B.
4. Line 61 check.review finish: request `check.repair` for fix (was `check.fix`), and `merge` for ready/nits.
5. Line 72 footer routing: `check.repair` routes to check-issue B, and `check.fix` to implement-issue A. Keep the other routes.
6. Line 59 re-check stays "after `check.fix`". Do not change it.
7. The operator-only rule paragraph (line 29) is not edited, and no second definition of it appears.

## 3. Read-first list

- `skills/check-issue/SKILL.md`, the whole file (72 lines).
- `skills/implement-issue/SKILL.md:67-77`, for the check.fix style and its operator-actions sentence.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

Pattern to copy: the existing `## check.review` paragraphs.

## 4. Change list and needed interfaces

- Only `skills/check-issue/SKILL.md`.
- Literal interfaces:
  - Phase `check.repair`.
  - Prompt `check-issue <slug> slot=B phase=check.repair leaf=<folder>`.
  - Finishes `akrogon phase <slug> merge --slot B` and `akrogon phase <slug> check.fix --slot B`, with no `--verdict` on these.
  - Heading `Handed to A`.
  - Review fix finish `akrogon phase <slug> check.repair --slot <A|B> --verdict fix`.
- Owned path: `skills/check-issue/SKILL.md`.
- Must land first: nothing.
- Shared test resource: none.

## 5. Do-not, reasons and exceptions

- Do not restate the operator-only rule or the base-run rule. Point to them. The design says the rule is referenced, not restated, and duplicate rules drift.
- Do not add a second-reader step for B's repair. The design forecloses it (Q3 3a).
- Do not edit other files. Other units own them.
- Do not change the Fix bar, Nit rules or blind-review text.

Reasons and exceptions: these keep one definition per rule and the locked scope. If a needed change conflicts with them, return a mismatch with evidence. The exception is a revised brief from A.

## 6. Ordered steps

1. Edit lines 3, 10, 61 and 72 (criteria 2-5).
2. Add the `## check.repair` section (criterion 1).
3. Check the result with the commands in section 7.
4. Commit with a message like `b-repair-phase u2: check.repair section in check-issue`, with no co-author line.

Advisory size: 1 file, under 8 turns.

## 7. Commands

- `sed -n '/^## check.repair/,/^## Printed footer/p' skills/check-issue/SKILL.md`: judge each criterion 1 item.
- `rg -n "check\.fix|check\.repair|Operator actions" skills/check-issue/SKILL.md`.

There are no code tests for prose. Wording tests are rejected in this repo.

## 8. Done-when, evidence and report

Done when each criterion 1 item maps to a sentence in the section and criteria 2-7 hold. Paste the section and the `rg` output.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
