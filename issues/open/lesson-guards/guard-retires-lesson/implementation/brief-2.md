# Brief U2: skill text (retirement rule, handoff audit, review bar, merge step)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/guard-retires-lesson-u2
Plan unit U2, wave 1. Decisions D1, D5, D6, D7 of `plan.md`.

## 1. Goal

Six skill pages gain the lesson-retirement contract so a fresh agent reading only the shipped text behaves correctly: the shared rule file gains the retirement rule; implement-issue's applying half names the same-diff requirement; the chart-issues handoff audit refuses a lesson-sourced guard leaf without a retirement criterion; check-issue's review bar rejects removals backed by uncalled or partial guards; merge-issue's solo path gains the re-removal step backed by the new `--check` guard.

## 2. Acceptance criteria

A1. `skills/lesson-rule.md` gains a retirement rule (new bullet or short section): the leaf that delivers a running mechanical guard covering a lesson's mechanism on every reachable path removes the lesson's line from `learnings/LESSONS.md` and appends `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>` to its history file in the same diff; a leaf that touches a lesson without fully guarding it keeps the line; report closure, duplicate or rejection never removes a line. Format matches `skills/learn-issues/SKILL.md` line 28 verbatim for the Applied line.
A2. `skills/implement-issue/SKILL.md` line ~31 (the "applying a lesson removes its active line" clause) names the same-diff requirement: the guard that covers the lesson's mechanism on every reachable path, the line removal, and the `Applied` history append land in the leaf's own diff. Keep it a clause, not a paragraph.
A3. `skills/chart-issues/assets/shapes.md` (preflight/validation audit section): add the refusal — a leaf owning the complete guard for a lesson its sources trace to (a `sources` seed whose body names a `learnings/history` path) without a retirement done-criterion naming that history path is refused; a leaf that only touches the lesson is not required to retire it.
A4. `skills/chart-issues/SKILL.md` handoff text: one line mirroring A3 pointing at the shapes audit (do not duplicate the rule text).
A5. `skills/check-issue/SKILL.md`: a removal acceptance rule — a `LESSONS.md` line removal is accepted only when the diff carries a running mechanical guard covering the lesson's mechanism on every reachable path; a removal beside an uncalled or partial guard is a Fix; any removal tied to report closure, duplicate or rejection is a Fix. Place it with the review-bar rules.
A6. `skills/merge-issue/SKILL.md` `### attempt solo` paragraph: after a manual rebase resolves (same for `rerun rebase`, which already references the solo form), B runs the re-removal one-liner and commits the removal as its own scoped commit when non-empty; note that `merged --check` refuses a pushed range still holding a retired line. Use this verbatim command text (the interface U1 ships):

```
bun -e "import {removeRetiredLessons} from './src/lessons.ts'; const r=await removeRetiredLessons(process.cwd(),(await Bun.spawn(['git','merge-base','origin/main','HEAD'],{stdout:'pipe'})).stdout.text().then(s=>s.trim()),'HEAD'); console.log(r.length?r.join('\n'):'none')"
```

then `git add learnings/LESSONS.md && git commit -m "lessons: retire applied lines"` when the output is non-empty. (The merge-base form `origin/main..HEAD` — two dots from the fetched remote tip — is the pushed range B just rebased onto; `origin/main` means the configured remote's default branch in the instruction text.)

## 3. Read-first

- `skills/lesson-rule.md` — existing three-bullet rule file; add the retirement rule in the same voice (bold lead word, dash-separated clauses).
- `skills/learn-issues/SKILL.md` line 28 — the Applied format to mirror verbatim.
- `skills/implement-issue/SKILL.md` lines 30-34 — the clause being extended.
- `skills/chart-issues/assets/shapes.md` — `## Preflight and validation` section for audit-refusal placement and style.
- `skills/chart-issues/SKILL.md` — `## Handoff` second paragraph (audit) for the pointer line.
- `skills/check-issue/SKILL.md` — `## check.review` Fix/Nit bar paragraphs; find where the removal bar fits (near "Compare tests with acceptance criteria" / realistic-source rules).
- `skills/merge-issue/SKILL.md` — `### attempt solo` conflict paragraph; `rerun rebase` wording references it.
- `plan.md` D1, D5, D6, D7 for the locked semantics.

## 4. Change list

Six files, text-only edits, each one a tight clause not a new section (except lesson-rule.md which may add one bullet):
- `skills/lesson-rule.md`
- `skills/implement-issue/SKILL.md`
- `skills/chart-issues/SKILL.md`
- `skills/chart-issues/assets/shapes.md`
- `skills/check-issue/SKILL.md`
- `skills/merge-issue/SKILL.md`

No code, no tests. Keep every edit under ~3 lines of new prose; prefer extending an existing sentence over a new paragraph where the flow allows.

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/` or `docs/` — U1/U3 own them.
- Do not paraphrase the Applied format — copy `Applied <YYYY-MM-DD> by <guard file:line>: <what it enforces>` verbatim (learn-issues:28).
- Do not restate the whole audit rule in `chart-issues/SKILL.md` — one pointer line; the shapes file is the rule home (single source).
- Do not add a check-issue criterion beyond the two Fix cases named in A5 — the bar is behavioural, not a checklist.
- Do not describe the `removeRetiredLessons` interface beyond the verbatim one-liner — U1 owns its semantics.
- A mismatch (e.g. the check-issue bar already saying this, a conflicting existing rule) returns to A with evidence; exception is a revised brief from A.

## 6. Ordered steps

1. `skills/lesson-rule.md` — add the retirement bullet.
2. `skills/implement-issue/SKILL.md` — extend the applying clause.
3. `skills/chart-issues/assets/shapes.md` — add the audit refusal.
4. `skills/chart-issues/SKILL.md` — add the pointer line.
5. `skills/check-issue/SKILL.md` — add the removal bar.
6. `skills/merge-issue/SKILL.md` — add the solo re-removal step and `--check` note.
7. `git diff` each file; confirm minimal edits and that every relative link still resolves by eyeball (docs-links test covers `*/SKILL.md`).

Advisory size: 6 files, under 25 turns.

## 7. Commands

```
AKROGON_BASE=2d9becac4365ec4a1079853364d561d90e356b5e
bun test --changed="$AKROGON_BASE" --timeout=30000
```
From the worktree; expect this to select `tests/docs-links.test.ts` (skills are not test-matched, so it may select nothing — a clean run is fine).

## 8. Done-when, evidence and report

All six files edited per A1-A6, `git diff` output in the report, test command result pasted. No test files touched ⇒ no `Test-Change:` trailer needed.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
