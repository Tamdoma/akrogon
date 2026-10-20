# Merged notes: owner-reuse, close-witness

Sources: slots/notes-A.md, notes-B.md, notes-C.md. Code at akrogon HEAD e522c186, live framework tree, all read 2026-10-19.

## owner-reuse

Options:
- Fresh owner name per handoff group, twins refused in code (A,B,C). An owner name in `issues/closed` never takes new leaves under `issues/open`. `akrogon next` refuses work under an open owner whose name also exists under closed (A,B,C) and parked (A; C leans yes). One rule in one place; `status` may show it but never with a second copy of the rule (B,C). Explicit dispatch of a closed leaf by its `issues/closed/...` path keeps working (C). The `completeOwner` throw (`src/phase.ts:201`) stays as the last guard (A,B,C). Reason: the owner name is already the single identity for completion and evidence. Cost: one guard, one flipped test (`tests/next.test.ts:5700`), later waves need a new name, the live twin needs a one-time repair (A,B,C), and the topic's history splits across two closed folders (C).
- Append into the closed owner at completion (rejected A,B,C). Matches #108's request. Needs new code for two `EPIC.md` files, child collisions, a crash-safe move and `.closing` recovery; `packFolder` unions only one folder's own archive (A,B,C). Keeps a window where `readLog` hides first-wave logs (A,C).
- Move the closed owner back to open before adding leaves (rejected C). Rewrites closed history, re-announces the epic, and needs an operator step that already failed as prose.
- Overwrite the destination or rename silently at completion (rejected B). Loses evidence or changes recorded paths after delivery.
- Keep prose-only refusal or the late throw (rejected A,B,C). `shapes.md` Preflight refuses the twin and it was written anyway.

Evidence:
- `src/phase.ts:191-226` completeOwner packs and renames the whole folder once; throw at `:201` (A,B,C).
- `src/evidence.ts:46-79` locate maps a log path to open|closed|parked/<owner>; readLog falls back to the first existing dir's archive only, so an open twin hides the closed archive (A,B,C).
- `src/pack.ts:12` one folder, refuses differing bytes at `:28` (A,B,C).
- `tests/next.test.ts:5700` pins twin-friendly dispatch (A,B,C).
- Live: `open/satellite-plan-fit` (EPIC.md + 6 merged leaves) and `closed/satellite-plan-fit` (EPIC.md, 2 leaves, evidence.tar.zst) (A,B,C); the two EPIC.md files differ (A,C).
- Wave-2 logs: 708 `*.log` files under `open/satellite-plan-fit`; `issues/verify-runs.jsonl` and `timings.jsonl` record log paths that include the owner name (A, checked for this merge).

Pitfalls:
- Late detection after all work merged: removed by the dispatch refusal (A,B,C).
- Empty or stray `closed/<name>` folder: the check is folder occupancy, not leaf states, and the error names the path; no auto-cleanup (B,C).
- Renaming an owner after it has run logs breaks recorded log paths (A). C says renaming is largely safe because `blocked-by` uses slugs and links are relative; A finds 708 wave-2 logs whose recorded paths carry the owner name. Matters for stuck-repair, not for future twins, since the guard fires before any log exists.
- Repairing #108 exposes #103: 4 sourced satellite leaves have no worktree (A,B,C).

Open questions:
- Q1 (B): the destination says completion "always" succeeds even with a same-name closed owner. Under this pick, future twins are refused and the existing twin gets a one-time repair. The destination wording must change; that is an operator scope choice.
- Q2 (C): who names wave 2? Guard only refuses, or its error suggests a free name?
- Q3 (A): the guard blocks only the twin owner's leaves, not the whole `next --all`.

## close-witness

Options:
- Cite the leaf slug, `delivered by <slug>`, the text `closeCommand` already posts (A,B,C). Delete the worktree guard and `git rev-parse HEAD` from `closeSources` (`src/pull.ts:186-190`). Reason: removes the only reason completion needs a worktree, fixes all stuck leaves with no backfill. Cost: the GitHub comment loses a direct commit link and departs from #103's "close with the merge commit" (A,B,C); a slug names a lifecycle record, not proof a commit landed (B).
- Save the landed commit in state at merge (rejected A,B,C). New field, writes on every landing path (solo, batch holder and members, recovery), a rule for shared sources, and no value for the leaves already stuck.
- Read a commit at close time from main, branch or `log.jsonl` (rejected A,B,C). Main moves on, branches are removed, the log is written after the state save and can fail.
- Keep the worktree until sources close (rejected A,C). Reconcile keeps it only when the owner completes this pass (`src/reconcile.ts:691`), and longer retention keeps worktrees and tabs alive while completion fails.
- SHA with slug fallback (rejected B). Two comment forms; pick one contract.
- Close with no comment (raised C as a question, not picked).

Evidence:
- `src/pull.ts:184-206` guard and HEAD read; `closeCommand` `:208-212` uses `delivered by` through the same `closeSource` (A,B,C).
- `closeSource` returns on CLOSED and compares the comment text only to itself on its retry (A,C).
- State has `merge_stamp` but no landed-SHA field (B,C).
- Today's hash is the triggering leaf's HEAD, also for an epic's shared sources (A,B,C), and may be a pre-rebase tip (C).
- `tests/phase.test.ts:566` pins "sourced completion without worktree context fails"; it flips (B).
- `tests/close.test.ts` already expects `delivered by` for `closeCommand` (C).

Pitfalls:
- Slug sold as commit proof: the contract states what the comment names (B).
- Shared epic source: the slug is the triggering leaf, which varies by which leaf retries first (A,B,C). Same variance as today. B and C: state "triggering leaf" in the contract. A: consider the epic name instead.
- Sources close before pack and rename; a later failure retries only pack and rename because closeSource returns on CLOSED. Keep the order (B,C).
- Deleting the guard also drops the only check that a merged leaf ever had a worktree; `phase: merged` is trusted everywhere else (C).
- With no worktree needed, the `ownerCompletes` mirror in reconcile may become removable; not claimed, it also keeps the tab, possibly for the merge slot's broadcast (A).

Open questions:
- Q4 (A,B,C): shared source comment names the triggering leaf, the owner, or every contributing leaf?
- Q5 (C): is a comment needed at all for GitHub readers?

## Where slots differ

- Renaming the live twin: A says it breaks recorded log paths; C says largely safe.
- Shared source witness: A leans owner name; B, C lean triggering-leaf slug stated in the contract.
- Parked twins: A includes them; C leans include; B silent.

## Rebuttals

- B: keep triggering-leaf slug for shared sources (one rule, existing input). "Guard fires before any log exists" is too strong: a rename repair must check recorded paths. Tag corrections applied above.
- C: withdraws "rename is largely safe": 708 recorded log paths in timings.jsonl and 49 in verify-runs.jsonl carry the owner name, so a rename repair breaks them unless paths are rewritten; keeping the name (moving wave-2 children into the closed folder once) avoids it. Holds triggering-leaf slug over owner name: deriving the owner in pull.ts adds code. Tag correction applied above.
