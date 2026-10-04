# Worker brief: learn-issues skill file

## 1. Goal

Write `skills/learn-issues/SKILL.md`, a new operator-invoked skill that triages the registered repo's `learnings/LESSONS.md` into three outcomes. Plan decisions D1, D2, D3.

## 2. Numbered acceptance criteria

1. File `skills/learn-issues/SKILL.md` exists with frontmatter `name: learn-issues` and a `description:` that says it is operator-invoked only.
2. It states the three outcomes, their tests and actions, the evidence step, and the scope limit as specified in section 4.
3. It resolves the target file from the registered root in `akrogon config` rather than the current checkout, and stops telling the operator when `akrogon config` reports `repo: none`.
4. It says it writes no chart, map, pull or handoff.
5. No test asserts skill wording. Proof is the file existing with the required statements; A verifies by inspection.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — copy its frontmatter shape, section style, the "Re-read this file only after compaction" line, and its printed-footer convention.
- `skills/seed-issue/SKILL.md` — the destination of the `/seed-issue` line form the skill prints.
- `skills/implement-issue/SKILL.md` :31 — the applied-lesson dating rule the new skill mirrors.
- `skills/implement-issue/ponytail.md` — read before editing.
- `learnings/LESSONS.md` — the file being triaged; note two active-line formats exist: `... 2026-09-10. history/<file>` and `... 2026-10-01. History: [name](history/<file>)`.
- `src/install.ts` :12-21 — skills are discovered from the folder; no installer edit is needed.

## 4. Change list and needed interfaces

Create `skills/learn-issues/SKILL.md` (the only file this unit owns). Short plain sections in the style of the other skills. Required content:

- Frontmatter: `name: learn-issues`; `description:` stating it is operator-invoked only.
- Target resolution: run `akrogon config`; the `repo` key selects the registered repo and `repos.<name>` is its root. The triage target is `<registered root>/learnings/LESSONS.md` — the real file at the registered root, never a worktree copy. When `akrogon config` reports `repo: none`, stop and tell the operator the current checkout is unregistered.
- Read the repo's `checks` and `merge_checks` from `akrogon config` as the blocking-check surface.
- Evidence step, before sorting any line: read the line's linked history file for the observed failure, then check that mechanism against current code on the relevant path and against `checks`/`merge_checks`.
- The three outcomes:
  - **Already guarded**: a guard in command code, an `akrogon phase` guard or a blocking `checks` command is called on the relevant path and covers the lesson's whole mechanism everywhere it can recur. Remove the active line and date the line's history file with the guard's file:line, without rewriting the historical case.
  - **Checkable**: the mechanism is a fixed pattern a command can detect (a banned call or schema shape, a path or file-location rule, a required state before a step), and no running guard covers every reachable case yet. A check that exists but is not reached from blocking `checks` or the command path counts as not covering. Print one ready-to-run `/seed-issue` line naming the lesson and the reachable case, never the check to build. The operator runs it or not; the skill files nothing itself.
  - **Stays**: the default for judgment calls, unproved coverage and missing evidence.
- The skill works only from active lessons and the evidence needed to sort them; it audits no other instructions, tooling or docs.
- It shows the sorted list grouped as already guarded / checkable / stays, each entry with its file:line evidence, then removes the already-guarded lines without a further question. The uncommitted diff is the operator's review.
- It runs only when the operator starts it, writes no chart, territory map or handoff, runs no `akrogon pull`, and leaves its edits for the operator to commit.
- A printed footer in the same form as the other skills, summarizing what was removed and offered.

## 5. Do-not, reasons and exceptions

- Do not edit `learnings/LESSONS.md`, any history file, `chart-issues` or any other file: they belong to sibling units or to the operator's live checkout. The exception is none; a conflict returns as a mismatch.
- Do not add a fourth outcome for no-op/stale lines; the design foreclosed it. Operator deletes such lines by hand.
- Do not make the skill read session logs, build checks itself, or treat a missing hook/CI job as a finding; foreclosed in design note 8.
- Do not make the skill text depend on LESSONS.md header wording (design X3).
- Do not add assets, tests or an installer change; skills are discovered from the folder.
- A requirement conflict returns as a mismatch with evidence instead of changed scope; the exception is a revised brief from A.

Restated: own only `skills/learn-issues/SKILL.md`; foreclosed outcomes and behaviors stay out; conflicts come back, they are not resolved by scope creep.

## 6. Ordered steps

1. Read the read-first list (criteria 1-4).
2. Write `skills/learn-issues/SKILL.md`.
3. Verify the file contains every required statement from section 4 by rereading it.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Changed-test command: `bun test --changed=76ec78494a77dca27a7b25a2128cf1d3bcda1045 --timeout=30000`. A prose-only new file may produce no changed tests; a pass or "no changed tests" result is acceptable. Run `bun install` first only if tests fail for missing dependencies.

## 8. Done-when, evidence and report

The file exists with all section-4 statements and you committed it on the detached HEAD in your worktree. Return the commit ID and the filled lines:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
