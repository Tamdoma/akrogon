# Brief 2: rewrite the base-run paragraph in skills/check-issue/SKILL.md

## 1. Goal

Replace the base-run paragraph at `skills/check-issue/SKILL.md` line 59 (starts "During check.review, a red test or check with no cause in the leaf's diff") with the supplied text so "red on base" requires completed, comparable runs and an incomplete base run gets its own stop. Plan decisions D1-D6.

## 2. Numbered acceptance criteria

1. The replaced paragraph states each of these once, in its own words or the supplied text:
   - a. "Red on base" requires both the leaf run and the base run completed, meaning the checked command's own exit status and terminal result kept before any reporting pipeline such as `echo`, `grep` or `head`.
   - b. Both runs use the same command, args, whole-folder or single-file scope, dependency install and material conditions.
   - c. The seat records why the base failure explains the leaf failure; failing test names need not match.
   - d. Only then does `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>` apply, for the reviewing slot.
   - e. A completed base result that does not establish that comparison takes the existing repair path.
   - f. A base run killed, interrupted or crashed before its terminal result is incomplete: the seat keeps its logs and termination cause and ends with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot <A|B>`, with no automatic rerun and no base-defect claim.
   - g. The base run uses the active harness's longest run mode, and a base run still killed before its terminal result is incomplete under (f).
2. Everything else in the paragraph is preserved in effect: trigger and judgment gate, "is the existing specific concern rerun case, not a new trigger", single base run, `base_worktree=$(mktemp -d)` + `git worktree add --detach`, dependency install with the leaf's installation method, log redirection, `git worktree remove --force` before the outcome, `review-<slot>.md` records base SHA / both log paths / failing names and tails, "a stop, never a handoff, creating no repair or merge path".
3. Rules are stated once each; no new heading is added.
4. No other line of the file changes; no other file changes.

## 3. Read-first list

- `skills/check-issue/SKILL.md` line 59 and its surrounding paragraphs (style to match: one dense paragraph, no new headings).
- `skills/check-issue/ponytail.md` (this folder's house rules).

## 4. Change list and needed interfaces

Owns: `skills/check-issue/SKILL.md` only. No shared test resource. No prerequisite units; lands in wave 1 alongside a sibling unit editing `skills/implement-issue/SKILL.md` (disjoint path).

Required replacement text (insert verbatim; report any rule you believe is missing rather than dropping it):

```text
During check.review, a red test or check with no cause in the leaf's diff (failing output plus `git diff "$AKROGON_BASE"...HEAD` shows no touched file or plausible cause; a judgment gate, never automatic) is the existing specific concern rerun case, not a new trigger, and runs that same command once, same command, args, and whole-folder or single-file scope, in the corresponding working directory inside the detached base checkout at `AKROGON_BASE`, allocated with `base_worktree=$(mktemp -d)` then `git worktree add --detach "$base_worktree" "$AKROGON_BASE"` (`mktemp` uses exported leaf `TMPDIR`, otherwise system temp; no fixed path), installing dependencies there with the leaf's installation method and the same material conditions as the leaf run, redirecting logs to files outside the worktree, keeping each run's own exit status and terminal result before any reporting pipeline such as `echo`, `grep` or `head`, capturing both log paths and failing names and tails from both runs, then `git worktree remove --force "$base_worktree"` before any outcome. Red on base requires both runs completed with that exit status and terminal result kept, and the seat records why the base failure explains the leaf failure; failing test names need not match. Red on base ends with `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>` for the reviewing slot and `review-<slot>.md` records base SHA, both log paths, and failing names and tails from both runs, a stop, never a handoff, creating no repair or merge path, while a completed base result that does not establish that comparison takes the existing repair path. The base run uses the active harness's longest run mode, and a base run still killed, interrupted or crashed before its terminal result is incomplete: the seat keeps its logs and termination cause and ends with `akrogon phase <slug> failed --reason "<command> incomplete base run <sha>: <cause>" --slot <A|B>` with no automatic rerun and no base-defect claim.
```

Interfaces: none; prose-only edit.

## 5. Do-not, reasons and exceptions

- Do not edit any other file or any other paragraph: criterion 4 of the leaf brief restricts the diff to this file and one sibling file. Exception: none; out-of-scope findings return as a mismatch.
- Do not add headings, lists, or split the paragraph: the skill's style is dense single paragraphs and the design says "no new heading". Exception: a revised brief from A.
- Do not reword the supplied text except to fix a genuine grammar error: the wording carries locked rules, and review checks each rule is stated once. Exception: a revised brief from A.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

## 6. Ordered steps

1. Read `skills/check-issue/SKILL.md` around line 59. (criteria 2, 4)
2. Replace the paragraph with the supplied text. (criteria 1-3)
3. Re-read the paragraph and check each of criteria 1a-1g appears exactly once and criterion 2's preserved elements are present. (criteria 1-3)
4. `git diff` confirms only this file changed, only this paragraph. (criterion 4)
5. Commit on the detached HEAD with a short message, e.g. `docs: gate red-on-base on completed comparable runs`. (all)

Advisory size: 1 file, under 8 turns.

## 7. Commands

Run after the edit, from the worktree root:

```bash
bun install --frozen-lockfile
: "4b74a0870fa3243f6b79e658204ff0f7ff3b4716" && AKROGON_BASE=4b74a0870fa3243f6b79e658204ff0f7ff3b4716 bun test --changed=4b74a0870fa3243f6b79e658204ff0f7ff3b4716 --timeout=30000
```

The changed-test command may match zero tests for a prose-only diff; record its actual output.

## 8. Done-when, evidence and report

The paragraph is replaced, all criteria hold, `git diff` shows only this file, the commit exists, and the changed-test output is pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
