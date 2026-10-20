# Worker brief 3 — merge-issue routes corrections to A + criterion-4 sweep

## 1. Goal

Update `skills/merge-issue/SKILL.md` so a needed proof-command correction routes to A through `check.fix` under the rule in `skills/plan-issue/SKILL.md` `plan.synthesis` (never fixed by B in place), and run the repository-wide criterion-4 sweep proving no text under `skills`, `docs` or `README.md` cites `test-proof-rules`. Plan decisions: D5 (B routes, never corrects), D6 (replace `test-proof-rules` wording, not stacked).

Context: the rule (being written in `plan-issue` `plan.synthesis` by a sibling worker) says `plan.md` owns the proof command and A replaces a wrong one under an equivalence guard; B never corrects. Cite it as "the `plan-issue` `plan.synthesis` proof-command rule".

## 2. Numbered acceptance criteria

1. In `Shared endings`, the red-verify paragraph's sentence "...so A corrects it, including any wrong expectation in its own done-criteria under test-proof-rules..." no longer cites `test-proof-rules`: it states A corrects a wrong expectation in its own done-criteria and that a needed proof-command correction is made by A under the `plan-issue` `plan.synthesis` proof-command rule.
2. In `attempt top: the worktree is the rebased top`, the paragraph listing B's in-place repair exceptions ("The check-issue repair exceptions apply: no test expectation correction, no locked brief or design change, no new or widened live action.") gains the missing exception: a needed proof-command correction is not a B repair — it goes to A through `check.fix`.
3. `git grep -n "test-proof-rules" -- skills docs README.md` in the worker worktree returns no hits after the edit (the two sibling files may still hold their citations in this worktree until their commits land — report each remaining file, line and which sibling unit owns it: `skills/plan-issue/SKILL.md` and `skills/implement-issue/SKILL.md` are unit 1, `skills/check-issue/SKILL.md` is unit 2; hits inside `skills/merge-issue/SKILL.md` after your edit are your failure).
4. `grep -rn "test-proof-rules" docs/ README.md` returns no hits (docs and README must be clean — no sibling owns them).
5. `skills/merge-issue/SKILL.md` no longer contains the string `test-proof-rules`.

## 3. Read-first list

- `skills/merge-issue/SKILL.md` — full file; edit sites: "B may fix a mechanical red in place ..." paragraph under `attempt top`, and the "On a red verify, judge the cause." paragraph under `Shared endings`.
- `skills/implement-issue/ponytail.md` — style bar.
- Copy the voice of the existing paragraphs: single long sentences, code-spans for file names and commands.

## 4. Change list and needed interfaces

Path owned by this unit: `skills/merge-issue/SKILL.md`. No shared test resource, no prerequisites; runs in wave 1.

Interfaces: none beyond the file.

Current `Shared endings` sentence ending: "...then calls `akrogon phase <slug> check.fix --slot B --attempt <id>`, which moves the leaf to `check.fix` so A corrects it, including any wrong expectation in its own done-criteria under test-proof-rules, and finishes with the actual result and repair footer." — replace so it reads that A corrects it, including a wrong expectation in its own done-criteria, and a needed proof-command correction is A's under the `plan-issue` `plan.synthesis` proof-command rule.

## 5. Do-not, reasons and exceptions

- Do not restate the rule — cite the `plan-issue` `plan.synthesis` section only.
- Do not let B repair a proof command in place at merge — it always routes to `check.fix`; exception: none.
- Do not change retry, known-red, verify or push machinery; exception: none.
- Do not edit any file other than `skills/merge-issue/SKILL.md`; exception: none.
- A conflicting requirement is a mismatch returned to A with evidence and the smallest brief correction; exception: a revised brief from A.

## 6. Ordered steps

1. Read `skills/merge-issue/SKILL.md` fully (criteria 1–5).
2. Make the two edits (criteria 1–2).
3. Run the sweep commands (section 7); record remaining sibling-owned hits with their owning unit.
4. Commit the file: `docs(command-owner): route proof-command corrections to A at merge` or similar conventional form; return the commit ID.

Advisory size: 1 file, under 8 turns.

## 7. Commands

Targeted checks after edits, keep output through run-check:

```sh
akrogon run-check --name u3-file-sweep -- sh -c 'if grep -n "test-proof-rules" skills/merge-issue/SKILL.md; then exit 1; else exit 0; fi'
akrogon run-check --name u3-repo-sweep -- sh -c 'git grep -n "test-proof-rules" -- skills docs README.md; test $? -ne 0'
akrogon run-check --name u3-docs-sweep -- sh -c 'if grep -rn "test-proof-rules" docs/ README.md; then exit 1; else exit 0; fi'
```

For `u3-repo-sweep` in your worktree: sibling files (`skills/plan-issue/SKILL.md` — actually clean; `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`) still hold citations at your base, so the command will exit 1; read its log, confirm the only remaining hits are the two sibling-owned files plus none in `docs/`/`README.md`, and report them. Your own file must not appear.

No dependencies needed for the greps.

## 8. Done-when, evidence and report

File edited, `u3-file-sweep` and `u3-docs-sweep` green (cite each printed `check <label>: <exit> <path>` line), `u3-repo-sweep` result reported with the sibling-owned remaining hits named, commit ID returned. Command output kept only through `akrogon run-check --name <label> -- <cmd>` citing its printed line; `akrogon log <path>` reads a cited log.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
