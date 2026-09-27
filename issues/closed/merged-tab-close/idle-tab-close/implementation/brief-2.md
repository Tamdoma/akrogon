# Brief 2: idle-tab-close skill + guide text

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/idle-tab-close`. Edit only there. Do not commit. Depends on brief 1 only by sequence, not content; make no code change.

## 1. Goal

Apply plan D7 and C7–C8 for leaf `idle-tab-close`: the merge-issue skill drops its self-close step and the skill + guide state the command rule (hook passes close merged tabs once the merge seat goes idle/exits; sweeps close any remainder; only sweeps delete worktrees/branches after the owner folder moves).

## 2. Numbered acceptance criteria

- B2.1 (C7): `skills/merge-issue/SKILL.md` contains no `herdr tab close "$HERDR_TAB_ID"` self-close step; its touched lines state the command closes the tab once the seat goes idle after `merged`, and startup/manual sweeps remove the worktree and branch after the issue folder moves.
- B2.2 (C8): `docs/guide/merge.md`, `docs/guide/limits.md`, `docs/guide/problems.md` state hook passes close merged tabs and only cleanup passes delete worktrees/branches.
- B2.3 (C8): `grep -rn 'tab close\|closes its tab' skills/ docs/` (from worktree root) finds no text saying the merge seat closes its own tab; any other stale tab-close mention found by that grep is reconciled or reported under limitations.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `skills/merge-issue/SKILL.md` (current line ~47: broadcast sentence ending "because the tab closes as soon as this pane goes idle after `merged`"; line ~51: "Finish by printing the footer, then close this tab with `herdr tab close "$HERDR_TAB_ID"` as the very last act; the startup sweep removes the worktree and branch, and closes any tab a merge left open.")
- `docs/guide/merge.md` (line 27: "The merge seat closes its tab as its last action. A manual repository sweep or startup cleanup removes completed worktrees and branches:")
- `docs/guide/limits.md` (line 10: "**Cleanup is separate from idle events.** Manual repository sweeps and startup cleanup remove completed worktrees. A normal hook pass does not delete them.")
- `docs/guide/problems.md` ("**A completed worktree is still present.**" answer: "Cleanup belongs to manual sweeps and startup. A tab left behind by an interrupted merge can also be handled there.")

## 4. Change list and needed interfaces

Four files, minimal sentence rewrites, no new sections:

- `skills/merge-issue/SKILL.md`: delete the self-close last act; keep "finish by printing the footer"; attribute the idle close to the command and worktree/branch removal to sweeps after the folder move. Keep the broadcast-must-run-in-merge-seat reason intact (the tab still goes away on idle; only the actor changes).
- `docs/guide/merge.md`: replace the line-27 sentence with the command rule.
- `docs/guide/limits.md`: rewrite the line-10 bullet: hook passes close merged tabs; only manual sweeps/startup cleanup delete worktrees and branches.
- `docs/guide/problems.md`: rewrite the completed-worktree answer: tabs close via hook/sweep; a lingering worktree/branch needs a sweep.
- No `AREA.md` change (no new commands or files). None.

## 5. Do-not, reasons and exceptions

- Do not change any `src/` or `tests/` file: unit 1 owns code; docs must not drift from its behavior (exception: revised brief from B).
- Do not restructure the skill or guides, add sections, or reword untouched lines: minimal diff keeps review on the rule change (exception: revised brief from B).
- Do not commit, touch `issues/` inside the worktree, or leave scratch files there: B owns the branch commit and `akrogon phase` refuses `issues/` files on it (no exception).
- Do not change scope on mismatch: return a mismatch naming the conflicting requirement, actual text, and smallest brief correction (exception: revised brief from B authorizing it).
- Reasons restated: code and docs stay in their units so each review checks one contract; the branch stays clean so handoff is not refused; mismatches return to B because only B revises the brief.

## 6. Ordered steps

1. `skills/merge-issue/SKILL.md`: apply the B2.1 rewrite.
2. `docs/guide/merge.md`, `docs/guide/limits.md`, `docs/guide/problems.md`: apply the B2.2 rewrites.
3. Run the section-8 grep from the worktree root; reconcile or report every hit (B2.3).
4. Run section-7 command; confirm `git status --porcelain` shows only the four doc files plus unit-1's `src/next.ts` and `tests/next.test.ts`.

Advisory size: 4 files, under 16 turns.

## 7. Commands

```sh
export AKROGON_BASE=17fa33ab58b727534ec542790fd6a6d11bb65de7
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"
```
Run from the worktree. This is the only test command; B runs the full suite.

## 8. Done-when, evidence and report

Done when B2.1–B2.3 hold with the grep output pasted and the section-7 result pasted. Name limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
