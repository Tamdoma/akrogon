# Brief 1: locked-setting-proof

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/locked-setting-proof-u1` (all reads, edits and commands happen there).

## 1. Goal

Add the locked-setting proof rule to `skills/chart-issues/SKILL.md` and sweep `skills/chart-issues/` for contradicting lines. Plan decisions D1, D2, D4 of `plan.md`.

## 2. Numbered acceptance criteria

1. The Take operation-proof paragraph in `skills/chart-issues/SKILL.md` (today `:57`, the paragraph beginning "Every external operation a brief names") gains exactly one sentence, inserted after "…run with the real identity and target." and before "Declining a required probe holds the handoff":

   > When a decision locks a setting of an outside tool (a config key, file setting, flag or environment variable), its proof uses that same key, location and value and observes the property the decision relies on, and a proof of a different form, such as the CLI flag for a locked config key, does not count for it.

2. A sweep of every file under `skills/chart-issues/` (`SKILL.md`, `assets/*.md`, `scripts/*.ts`) by meaning finds no line allowing a different form to prove a locked setting. Any in-scope hit is repaired in the same commit; any out-of-scope hit is listed in the report.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — the owned paragraph at `:57`.
- `skills/chart-issues/assets/shapes.md` — `:284` (refuses a brief operation with no recorded proof) and `:286` (allowed proof forms); sweep targets already judged compatible at plan time.
- `skills/chart-issues/assets/questions.md` — `:56` ("never replaces required operation proof"); sweep target.
- `skills/chart-issues/scripts/*.ts` — sweep targets.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — read before editing.

## 4. Change list and needed interfaces

- Owns: `skills/chart-issues/SKILL.md` only (plus any in-scope sweep fix, none expected).
- Chunks that must land first: none. Shared test resources: none.
- Needed interfaces: none — a prose insertion; match the paragraph's existing voice (terse, comma-separated clauses, no lists).

## 5. Do-not, reasons and exceptions

- Do not add a test asserting the sentence: the locked design calls this proof-by-report, and a wording-assertion test is a vanity test under `assets/standing-design.md`. Exception: none.
- Do not edit any file outside `skills/chart-issues/SKILL.md` unless the sweep finds an in-scope contradiction: scope is locked to the owned surface. Exception: a sweep hit that genuinely licenses a different-form proof gets the smallest in-scope repair.
- Do not restructure the paragraph, split it or add a new section: the design caps the change at one appended sentence. Exception: none.
- Do not write a file under `issues/`: `akrogon phase` rejects `issues/` diffs on the branch; report sweep hits only inside the report below. Exception: none.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Restated: no test, no out-of-scope edits, no restructuring, no `issues/` files; a scope or interface conflict returns a mismatch unless A revises the brief.

## 6. Ordered steps

1. Read `SKILL.md:55,58` and insert the criterion-1 sentence verbatim at the named position (criterion 1).
2. Run `grep -rniE "prove|proof|probe|counts|call" skills/chart-issues/` from the worktree root and judge every hit by meaning: does it let a different form prove a locked setting? Fix in-scope hits; record out-of-scope hits (lines about operation proofs that do not concern locked-setting form) for the report (criterion 2).
3. Run `git diff --stat` to confirm the diff touches only `skills/chart-issues/SKILL.md` (or a justified in-scope sweep fix).
4. Commit with a message like `skill: require locked-setting proofs in the locked form` (criterion 1). No `Test-Change:` trailer is needed — no file matched by `src/test-files.ts` changes.
5. Fill the report lines in section 8.

Advisory size: 1 file and under 8 turns.

## 7. Commands

```bash
AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c bun test --changed="$AKROGON_BASE"
```

Run from the worktree root after the edit. A prose-only diff may resolve to zero changed tests; record whatever it prints.

## 8. Done-when, evidence and report

Done when the sentence sits verbatim in the Take operation-proof paragraph, the sweep is judged and recorded, the commit exists, and the report below is filled with pasted command output.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
