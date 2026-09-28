# Sub-brief 2: worker-protocol path rule

## 1. Goal

Plan D5. Outcome: the protocol names one absolute worker path read from `akrogon config` and drops the ambiguous nested rule with its obsolete reasons.

## 2. Numbered acceptance criteria

1. `skills/implement-issue/worker-protocol.md:11` says a delegated leaf worker runs in a detached worktree at `<worktree_store>/<slug>-u<N>` read from `akrogon config`, created with `git worktree add --detach` at the leaf's committed HEAD, and B uses that one absolute path unchanged as the sub-brief worktree path, spawn cwd, inspection path, and `git worktree remove` target.
2. The paragraph uses no `<lane>` path segment and states neither the "inside pi's parent root" reason nor the "inside the repo so it is gitignored" reason. Verify: `grep -n "<lane>/\|parent root\|gitignored" skills/implement-issue/worker-protocol.md` returns nothing. The grep matches before the edit and is empty after.
3. Retained workers resume at their recorded path including one at the old nested path; an occupied `<slug>-u<N>` path is reported to the operator, never deleted, forced, or reused; standalone workers stay sequential in the current checkout.

No test runner covers prose, so the section 8 greps plus quoted edited lines are the verification for all three criteria.

## 3. Read-first list

- `skills/implement-issue/ponytail.md` (read first and follow it)
- `skills/implement-issue/worker-protocol.md` (full file, 27 lines; paragraph :11 is the target, :17 and :25 are the retained-worker lines to keep)

Pattern to copy: the current :11 paragraph's compact imperative style. Open the grounding index only for a gap in this list.

Binding facts, copied here: a new worker path is `<worktree_store>/<slug>-u<N>`; the store comes from the `worktree_store` key of `akrogon config`; the start commit is the leaf's committed HEAD (B commits pending lane edits first, else reuses HEAD, never an empty commit); one absolute path serves create, spawn, inspect, and remove; a worker retained at the old nested path finishes where it is; an occupied path is never deleted or reused; standalone behavior is unchanged.

## 4. Change list and needed interfaces

File owned, and no other: `skills/implement-issue/worker-protocol.md`.

Chunks that must land first: none. Shared test resource: none. Consumed output: none.

## 5. Do-not, reasons and exceptions

1. Do not change retained-worker recovery or standalone semantics beyond the path wording. Reason: the design keeps them; only the path rule changes. Exception: none.
2. Do not touch code or tests. Reason: another worker owns them and parallel edits would conflict at cherry-pick. Exception: none.
3. Do not add a script, verb, or env var. Reason: the design forecloses them. Exception: none.
4. Return a mismatch with evidence to B instead of changing scope or an interface. Exception: a revised brief from B authorizing that change.

Reasons restated: exclusions 1 and 3 protect the locked design, 2 keeps waves independent. The only exception to any exclusion is a revised brief from B.

## 6. Ordered steps

1. Read the protocol file (all criteria).
2. Rewrite the :11 worker-path sentences for criteria 1-2, keeping the wave, commit, cherry-pick, and removal sentences intact.
3. Adjust the retained and occupied-path wording minimally for criterion 3.
4. Read the file back and run the section 8 greps (criteria 1-3).
5. Run `bun install`, then section 7's command, and paste its output whatever it reports for a prose-only change.
6. Commit only the owned file with message `worker-path: protocol names worktree_store path`. Return the commit ID.

Advisory size: 1 file, under 6 turns. Work clearly beyond this returns a mismatch with evidence, not silent scope growth.

## 7. Commands

From the worktree root, after `bun install`:

```sh
AKROGON_BASE=f984c8ae83156b31aaa5502abab4b02a0c96f360 bun test --changed="f984c8ae83156b31aaa5502abab4b02a0c96f360"
```

B runs the full suite separately. A prose change may match no tests; paste the output either way.

## 8. Done-when, evidence and report

Done when criteria 1-3 hold with the edited lines quoted, `grep -n "worktree_store" skills/implement-issue/worker-protocol.md` shows the new rule, and `grep -n "<lane>/\|parent root\|gitignored" skills/implement-issue/worker-protocol.md` is empty. End your return with these four lines, equivalent wording accepted by content:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
