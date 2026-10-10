# Brief U3: operator docs + real LESSONS.md header

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/guard-retires-lesson-u3
Plan unit U3, wave 1. Decisions D6, D9 and the doc surfaces of `plan.md`.

## 1. Goal

Operator-facing docs and the repo's own `learnings/LESSONS.md` header describe retirement by the guard leaf so a meaning-sweep finds `/learn-issues` is not the only exit, and every edited page keeps working links.

## 2. Acceptance criteria

A1. `docs/guide/learn.md` gains retirement-by-guard-leaf wording: the lesson rule's retirement clause is named (guard covering the mechanism on every reachable path removes the line and appends `Applied` to history, in the leaf's own diff); `/learn-issues` remains described as the backlog triage, not the sole exit. The existing "leaves when applied or when /learn-issues removes it" reading of the LESSONS.md header is reflected: update the page so the guard leaf is the normal path.
A2. `docs/guide/merge.md`: one line in the merge-flow text naming that the built stack (and `merged --check`) re-removes a retired lesson line a union merge resurrected; place near the batch-stack description (~line 7) or the `--check` description (~line 17). Short.
A3. `src/AREA.md`: add one Non-obvious pattern line — `buildStack` removes resurrected retired lesson lines as a fixup commit on the stack top, and `merged --check` refuses a pushed range still holding one. Keep the file ≤ 40 lines, exact section headings (Commands, Key files, Non-obvious patterns, See also).
A4. `skills/AREA.md`: adjust the `learn-issues` Key-files line or a pattern line so it doesn't imply `/learn-issues` is the only exit (e.g. "triage … plus the shared retirement rule"). ≤ 40 lines.
A5. `learnings/LESSONS.md` header sentence "A line leaves when applied or when /learn-issues removes it." → update to name the guard-leaf retirement as the normal path (e.g. "A line leaves when the leaf that guards it retires it, or when /learn-issues removes a guarded line."). Do NOT touch any lesson lines or history files.
A6. Every relative link added or edited resolves (guide pages and src/skills AREA.md are covered by `tests/docs-links.test.ts`; `learnings/LESSONS.md` and `shapes.md` are not — check them by hand if you add links; prefer not adding links there).

## 3. Read-first

- `docs/guide/learn.md` — lesson paragraph around line 18; `/learn-issues` sentence.
- `docs/guide/merge.md` — lines 7 (stack build) and 17 (`--check` description).
- `src/AREA.md` — Non-obvious patterns list (~20 lines, cap 40 total).
- `skills/AREA.md` — Key files `learn-issues` line and Non-obvious patterns.
- `learnings/LESSONS.md` — header sentence only.
- `plan.md` D6, D9.

## 4. Change list

Five files, one clause to one line each: `docs/guide/learn.md`, `docs/guide/merge.md`, `src/AREA.md`, `skills/AREA.md`, `learnings/LESSONS.md` (header sentence only).

## 5. Do-not, reasons and exceptions

- Do not touch `src/*.ts`, `tests/` or skill SKILL.md bodies — U1/U2 own them.
- Do not add lesson lines or edit history files — only the LESSONS.md header sentence changes.
- Do not exceed the 40-line AREA.md cap or rename sections — implement-issue's doc rule applies.
- Do not add new links to `learnings/LESSONS.md` (not link-checked).
- A mismatch (e.g. a doc already covering this) returns to A with evidence; exception is a revised brief from A.

## 6. Ordered steps

1. `docs/guide/learn.md` — retirement wording.
2. `docs/guide/merge.md` — re-removal line.
3. `src/AREA.md` — pattern line.
4. `skills/AREA.md` — learn-issues line fix.
5. `learnings/LESSONS.md` — header sentence.
6. `bun test tests/docs-links.test.ts` to confirm links; `git diff` review.

Advisory size: 5 files, under 20 turns.

## 7. Commands

```
AKROGON_BASE=2d9becac4365ec4a1079853364d561d90e356b5e
bun test --changed="$AKROGON_BASE" --timeout=30000
bun test tests/docs-links.test.ts
```
From the worktree.

## 8. Done-when, evidence and report

All five edits landed, docs-links test green, `git diff` pasted. `learnings/LESSONS.md` is not under `issues/` so it is a normal tracked file — commits are fine and need no `Test-Change:` trailer (it is not a test file).

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
