# Brief 2: worktree-keep-rule — chart-issues direct route locks its worktree (U2)

## 1. Goal

Implement plan.md decision D7: `skills/chart-issues/SKILL.md` Direct route creates its worktree locked, and unlocks immediately before every removal path and before the lifecycle handoff.

## 2. Numbered acceptance criteria

1. Protocol step 1 reads that the worktree is created with `git worktree add --lock --reason "<chart-folder> direct" <worktree_store>/<slug>` on branch `<slug>` from the destination's default branch (keep the existing `Direct attempt` writing requirement).
2. Landing step 8 runs `git worktree unlock <path>` immediately before `git worktree remove <path>` (the rest of step 8 stays: verify by `git worktree list`, then `git branch -D <slug>` verified by empty `git branch --list <slug>`).
3. The `abandon` growth-stop continuation unlocks then removes branch and worktree (still ends `Held <date>`).
4. The `lifecycle handoff` continuation gains an explicit unlock before the handoff, because the command's `ensureWorktree` adopts the worktree as-is and leaf rules must be able to remove it later (state this reason in one clause).
5. No other step, reason wording or prose is changed; only these four edits.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — `## Direct route` section, protocol steps 1–9 (~lines 101–114) and the growth-stop continuations (~lines 119–121). Match the existing sentence style.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- Plan context if needed: `/home/ivan/Work/infra/akrogon/issues/open/live-worktree-guard/worktree-keep-rule/plan.md` (D7).

## 4. Change list and needed interfaces

Owns: `skills/chart-issues/SKILL.md` only. Sibling worker owns `src/reconcile.ts` — do not touch it or any other file.

Chunks that must land first: none — wave 1 unit. Shared test resources: none (prose change, no tests by design).

## 5. Do-not, reasons and exceptions

- Do not edit anything outside `skills/chart-issues/SKILL.md`.
- Do not reword the `Direct attempt`, `Route:`, `Closed`, `Held` or `Handed off` markers — other skills match them.
- Do not add or drop steps, change numbering, or restructure — four minimal edits only.
- Do not write tests or code — prose only.

Exceptions: a revised brief from A authorizing a change; otherwise return a mismatch with evidence instead of widening scope.

## 6. Ordered steps

1. Step 1 edit (criterion 1).
2. Landing step 8 edit (criterion 2).
3. `abandon` continuation edit (criterion 3).
4. `lifecycle handoff` continuation edit with the adoption reason (criterion 4).
5. Re-read the diff: only these edits, wording fits the section's voice.

Advisory size: 1 file, under 8 turns.

## 7. Commands

No test command — prose change. Optionally `akrogon run-check --name 'format' -- bunx prettier --check skills/chart-issues` if you want to confirm formatting (must pass).

## 8. Done-when, evidence and report

All four edits present, diff limited to `skills/chart-issues/SKILL.md`, one commit (`docs:` message) on the worker head.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
