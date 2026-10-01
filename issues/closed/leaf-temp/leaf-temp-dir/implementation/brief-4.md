# Brief 4 (repair): leaf-temp-dir guide hook wording (D7, F1)

## 1. Goal

Fix review finding F1: the three guide paragraphs wrongly scope temp-folder deletion to sweeps only. State closed-tab hook deletion with sweep catch-up. Plan decision D7, criterion C7. No plan change needed: the plan's confirmed-gone term already covers both paths; only the wording missed the hook.

## 2. Numbered acceptance criteria

1. `docs/guide/merge.md` merged-cleanup paragraph states the closed-tab hook deletes the merged leaf's temp folder when its tab closes, with sweep/startup catch-up when the tab already has no live panes; the exclusive-sweep restriction applies only to completed worktree/branch removal after records move.
2. Same correction in the `docs/guide/problems.md` lingering-worktree paragraph.
3. Same correction in the `docs/guide/limits.md` cleanup-boundary line.
4. No guide line contradicts the corrected behavior (re-sweep cleanup mentions).

## 3. Read-first list

- `docs/guide/merge.md` (~:33), `docs/guide/problems.md` (~:53), `docs/guide/limits.md` (~:10)
- `src/next.ts` `:782-784` (hook deletes merged scratch before dispatch) and `:611-612` (sweep catch-up when no live panes) as the behavior source of truth
- This skill folder's `ponytail.md`
- Open the plan's index only for a gap in this list.

## 4. Change list and needed interfaces

Must land first: wave-1 and wave-2 commits (already on the lane; this worktree starts at lane HEAD). Owns: the three guide files. No shared test resource. Consumed output: none.

Failing text (all three attach deletion to the exclusive sweep claim, omitting the hook):

- merge.md:33 `Only those sweeps remove completed worktrees and branches, after the issue folder has moved, and delete the leaf's temp folder once the merged leaf's tab is confirmed gone:`
- problems.md:53 `Only sweeps and startup delete a lingering worktree and branch, and the leaf's temp folder once the merged leaf's tab is confirmed gone.`
- limits.md:10 `only manual repository sweeps and startup cleanup delete completed worktrees and branches, and the leaf's temp folder once the merged leaf's tab is confirmed gone.`

Fix shape (keep each edit to its paragraph, match surrounding tone): hook pass deletes the temp folder when the merged tab closes; a sweep or startup cleanup catches up when the tab already has no live panes; only sweeps/startup remove completed worktrees and branches after records move. Example for limits.md: `...; the closed-tab hook deletes the merged leaf's temp folder when its tab closes, with sweep catch-up when the tab already has no live panes; only manual repository sweeps and startup cleanup delete completed worktrees and branches.`

## 5. Do-not, reasons and exceptions

- Do not touch `src/`, `tests/`, or `skills/`; behavior and skill text already pass review.
- Do not add wording-assert tests; C7 stays review-only.
- Do not rewrite surrounding paragraphs; minimal diffs keep review on the fix.
- Do not document the `AKROGON_LEAF_TEMP_ROOT` seam; it stays internal.
- Return a mismatch with evidence to the plan author instead of changing scope or an interface; the exception is a revised brief from A authorizing that change.

Reasons restated: other owners already pass; wording asserts are brittle; adjacent rewrites hide the fix; the seam stays internal. Exception restated: only a revised brief from A authorizes a scope or interface change.

## 6. Ordered steps

1. The three guides for criteria 1-3: rewrite the temp-deletion clause in each named paragraph.
2. Re-sweep `docs/guide/*.md` cleanup mentions for criterion 4; report hits.
3. Run section 7, paste results plus the three new paragraphs, commit only this chunk.

Advisory size: about 3 files and under 6 turns.

## 7. Commands

Run in the brief's worktree after `bun install`:

```sh
AKROGON_BASE=88f252f02eb36aacee6dadf6668c303374b692d5 bun test --changed="88f252f02eb36aacee6dadf6668c303374b692d5"
```

This resolved changed-test command only; criterion proof and every `checks` command belong to A.

## 8. Done-when, evidence and report

Done when criteria 1-4 hold with the three new paragraph texts and the sweep grep pasted. Name limitations and unverified criteria explicitly.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
