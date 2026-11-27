# Brief 4 — U4: docs (src/AREA.md, docs/reference/files.md)

## 1. Goal

Implement plan unit U4: document the landed kill mechanism in `src/AREA.md` and the two new timing row kinds in `docs/reference/files.md`. Read the landed diff first — the docs must describe what actually landed.

## 2. Numbered acceptance criteria

1. `src/AREA.md` documents: `src/tool-cgroup.ts` (the kill module — relocation, sweep, helper, entry refresh), the `tool-kill-helper` verb, the changed `startSeat` behavior (Delegate, entry wiring, bootstrap) and the changed `commitMove` behavior (the sweep in the finally). The file keeps its existing format — exactly Commands, Key files, Non-obvious patterns and See also as second-level sections, at most 40 lines total. This may require compressing existing lines, not just appending.
2. `docs/reference/files.md` gains `tool_kill` and `tool_kill_deferred` in its `timings.jsonl` kinds enumeration with their fields.
3. `bunx prettier --check src tests skills/chart-issues/scripts` passes (docs are not prettier-checked, but run it as a sanity guard on nothing changing elsewhere).

## 3. Read-first list

- `src/AREA.md` — the existing format, read fully.
- `docs/reference/files.md` — the timings kinds section.
- The landed leaf diff: `git log`/`git diff` of the leaf branch for `src/tool-cgroup.ts`, `src/phase.ts`, `src/seat.ts`, `src/akrogon.ts`, `src/next.ts`, `src/hc.ts`, `src/timing.ts`.
- this skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/AREA.md`, `docs/reference/files.md`. Nothing else. Worker worktree created at commit `345ff083ca5254338b5c56fc945d756ec0aad882` (filled at wave start).

Binding facts: document current state, never modification history; one line per mechanism, matching the existing style density; `tests/AREA.md` optionally gains the three new test files only if the file enumerates test files — check its format first and follow it.

## 5. Do-not, reasons and exceptions

- Do not edit any code or test file. Reason: this unit is docs-only; exception: none.
- Do not exceed 40 lines in `src/AREA.md` — compress existing entries instead. Reason: implement-issue's AREA.md rule; exception: none.
- Never run any `git stash` subcommand — worktrees share one stash. To set work aside: commit as WIP and before returning `git reset --soft 345ff083ca5254338b5c56fc945d756ec0aad882`, then make the unit's single returned commit.
- Restated: return a mismatch with evidence instead of changing scope; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the landed diff and both docs.
2. Update `src/AREA.md` and `docs/reference/files.md`.
3. Commit once.

Advisory size: 2 files, under 15 turns.

## 7. Commands

No test commands — docs only. Verify with `bunx prettier --check src tests skills/chart-issues/scripts` as a no-op sanity check.

## 8. Done-when, evidence and report

Both docs updated, one commit on top of the creation commit.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
