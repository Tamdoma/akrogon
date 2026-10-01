# Brief-1: chart-audit-rules prose edit

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/chart-audit-rules-u1`. Do all reading, editing, testing and committing only in that worktree. Commit only this chunk on the detached HEAD and return the commit ID.

## 1. Goal

Add the two chart-handoff audit rules to `skills/chart-issues/assets/shapes.md` in place (plan D1, D2, D3). No new file, section or template field.

## 2. Numbered acceptance criteria

1. The done-criteria placeholder (`shapes.md` line 132, `1. <concrete check ...>`) names only the two allowed proof kinds: a command in the destination's blocking `checks`, or a test the leaf itself adds (own tests, end-to-end evidence, real outside calls and live runs that standing-design.md allows).
2. The implementer-audit paragraph (`shapes.md` line 170, starting `Read the briefs as an implementer`) states rule 1: a done-criterion may cite only those two kinds; a leaf needing a larger repo-wide command gets it added to `checks` first, after a prerequisite makes it pass; the audit refuses a criterion citing a repo-wide command outside `checks`.
3. The same paragraph states rule 2: for every `blocked-by` entry, the door writes into the dependent's brief (What or Why) the output it consumes; when that output is a part the producer could merge with its own proof, the door proposes that part as a prerequisite leaf. No count, size or duration trigger, and no recorded reason for a kept bundle.
4. The spine paragraph (`shapes.md` line 172, starting `A chart with a chain`) and the whole file `skills/chart-issues/SKILL.md` are byte-unchanged.
5. No test asserting the new wording is added (a wording test is a vanity test per standing design). Proof is reading the changed paragraphs plus the changed-tests command below.

## 3. Read-first list

- `/home/ivan/Work/infra/akrogon/issues/worktrees/chart-audit-rules-u1/skills/chart-issues/assets/shapes.md` (owned surface, lines 120-175)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/chart-audit-rules-u1/skills/chart-issues/assets/standing-design.md` (rule interpretation)
- `/home/ivan/Work/infra/akrogon/issues/worktrees/chart-audit-rules-u1/skills/chart-issues/SKILL.md` (excluded, read-only reference)
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md` (fewest files, shortest working diff)
- Pattern to copy: the existing spine paragraph at `shapes.md:172` shows the audit-rule style: one dense paragraph stating what the chart names and what the audit refuses, pointing at standing-design rules instead of restating them.

Open the repo index only for a gap in this list.

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/assets/shapes.md`, exactly two regions: the placeholder line inside the brief template fence (line 132) and the implementer-audit paragraph (line 170). No prerequisite chunks; this is the only unit. Needed interfaces: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

- Do not touch `skills/chart-issues/SKILL.md`, `assets/standing-design.md`, `assets/questions.md`, the spine paragraph, any other skill, or any file under `issues/`. Reason: the design locks those surfaces as excluded, and `akrogon phase` rejects `issues/` diffs on the branch. Exception: none.
- Do not add a test file or wording assertion. Reason: standing design forbids vanity tests; proof is paragraph reading plus checks. Exception: none.
- Do not add a count, size or duration trigger to rule 2, or a recorded reason for a kept bundle. Reason: the locked operator decision forecloses numeric gates. Exception: none.
- Do not widen the placeholder beyond the two allowed proof kinds. Reason: an over-broad placeholder reopens the failure class this leaf closes. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface. The exception is a revised brief from A authorizing that change.

Restated: the exclusions above hold because locked scope, the vanity-test rule and the no-gate decision require them; the only way past one is a revised brief from A.

## 6. Ordered steps

1. In `skills/chart-issues/assets/shapes.md`, rewrite the placeholder line 132 to name only the two allowed proof kinds (criterion 1). Keep it one line inside the existing fence.
2. In the same file, extend the audit paragraph at line 170 with rule-1 sentences: allowed kinds, prerequisite route, audit refusal (criterion 2). Match the dense style of the neighboring spine paragraph.
3. Extend the same paragraph with rule-2 sentences: `blocked-by` keying, consumed output into What or Why, prerequisite proposal, no triggers (criterion 3).
4. Run `git --no-pager diff -- skills/chart-issues/SKILL.md` (must be empty) and `git --no-pager diff -- skills/chart-issues/assets/shapes.md` (must show only the placeholder and audit paragraph; spine paragraph untouched) (criterion 4).
5. Grep `docs/` for `done-criterion may cite`, `blocked-by` brief-output prose, and `concrete check executable` to confirm no human doc restates these rules; report hits, do not edit `docs/` without a revised brief.
6. Run the section 7 command (criterion 5 evidence plus checks).
7. Commit only `skills/chart-issues/assets/shapes.md` on the detached HEAD and record the commit ID for the return.

Advisory size: 1 file, under 8 turns (one file costs a read, an edit and a test run; this chunk is two small prose edits). Work clearly beyond it returns a mismatch with evidence, not a hard cutoff.

## 7. Commands

Run only this changed-tests command (A runs the full suite separately):

```sh
AKROGON_BASE=2ad0acf70a85dacefa3a89c53a53233e2aae11ca bun test --changed="$AKROGON_BASE"
```

Run it from the worktree root. Install dependencies there first if `bun test` needs them (`bun install` in the worktree only, never global).

## 8. Done-when, evidence and report

Done when criteria 1-5 hold, the diff shows only the owned regions, the section 7 command passes, and the chunk is committed. Paste the diffstat, the two verification diffs from step 4, and the section 7 output into the return, with the commit ID. No end-to-end artifact is required: prose-only change provable by reading.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
