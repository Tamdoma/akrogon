# Merged notes: unknown-keys

Sources: slots/notes-A.md, notes-B.md, notes-C.md. Code at akrogon HEAD abfee125, live trees read 2026-10-19.

## Options
- Keep strict, one shared inventory in `src/state.ts` returning readable leaves plus retained failures (path, error); every walker reads it (A,B,C). Promote `next` `discover`'s existing per-leaf isolation into it and delete the other walks (`allLeaves` throwing, `status` `scanRepo` own walk, `reconcile` `collectSlugs`) (A,C). Depth, duplicate-slug and repo-key checks live once inside it, each violation landing in the failure list (A,C; B keeps duplicate and repo checks in it). Reason: covers unreadable and extended files, removes duplicated walks, keeps typo and version-skew detection. Cost: every caller changes and decides what a failure inside its own scope means; biggest diff (A,B,C).
- Strip unknown top-level keys, delete the skip list (rejected A,B,C). Covers only extra top-level keys: bad YAML, bad known values, missing fields and unknown keys in strict nested `batch`/`failure`/`delivery_error` still stop everything (B,C). Next `saveState` deletes seat notes and accepts typos like `worktre` (A,B,C; B measured).
- Passthrough, keep unknown keys (rejected A,C). Same coverage gap; `State` stops being the file contract.
- Keep adding allowed keys (rejected B). Repeats the incident per new key.
- Per-command try/catch (rejected B,C). Repeats the divergence.
- A valid-only list that discards failures (rejected B). Consumers mistake missing records for absent work.
- Stop seats writing `state.yaml` as the only fix (rejected A,C). Hand edits, corrupt YAML and other writers still stop the repo.
- Auto-quarantine an unreadable leaf (rejected C). Hides the failure, moves it without an operator decision.

## Evidence
- `src/state.ts` `readState` strict parse after a 4-key skip list and an empty `batch.members` shim; `allLeaves` throws on the first bad leaf; `findLeaf` parses every open and closed leaf (A,B,C).
- `src/next.ts` `discover` already isolates per leaf (`unreadable`, `unknown`, `foreign`) and reserves capacity for unreadable leaves (A,B,C). `src/status.ts` `scanRepo` fails the whole repo (A,B,C). `config` `effectiveConfig` and `run-check` `leafTarget` use `allLeaves` to find one leaf by worktree (B,C). Merge refreshes in `next` re-read `allLeaves` (B).
- `reconcile` `collectSlugs` ignores unreadable records ("protects nothing"); `completeOwner` checks `every(merged)` over `leavesUnder` (B,C).
- Live: skip-list keys appear only in 2 closed akrogon leaves (`akrogon-loop/bootstrap/{command,core-skills}`, `priority: n`); 0 elsewhere across the 11 registered repos; no unknown keys anywhere today (A,C). All live states parse at HEAD (B).
- `stateSchema.strip()` accepts `reported`/`notes` but drops them, accepts `worktre`, still rejects bad `phase`, missing `repo`, null; bad YAML throws before the schema (B, measured in memory). Unknown keys inside nested `batch`/`failure`/`delivery_error` stay rejected under strip (C).
- `tests/state.test.ts` pins strict rejection (B,C); `tests/batch.test.ts` pins nested and top-level rejection (C); `tests/status.test.ts` pins repo-level isolation and `tests/next.test.ts` pins unreadable capacity reservation (B).
- No live state in the 11 repos carries `batch.members` at all, so the empty-`members` shim serves 0 live files (A, checked after B's rebuttal).

## Pitfalls
- Cleanup removes an unreadable leaf's worktree or tab: the inventory keeps failing paths and reconcile treats them as owned (A,B,C).
- Owner looks fully merged because a sibling is unreadable: completion and other whole-set decisions (owner completion, merge queue, `blocked-by`) block only when a failure sits inside their own scope; unrelated owners continue (B,C).
- Naming the bad leaf reports "Missing leaf": target lookup finds the folder without parsing others and returns that leaf's own parse error (A,B,C). Worktree matching in `config`/`run-check` names unreadable paths as possible matches (C).
- Dispatch passes, then a merge refresh or worktree lookup aborts: migrate every strict consumer; test a healthy target beside extra-key, bad-YAML and bad-value siblings in open and closed, in the same repo (B).
- "Others continue" read as bypassing capacity: keep the unreadable-leaf reservation (B).
- Bad leaf invisible or noisy: one deduped stderr line per invocation as `next` does, and an invalid entry in `status` instead of a failed repo scan (C).
- Bad closed leaf forces history edits: a closed unreadable leaf blocks only commands that need it (C).
- Deleting the skip list first makes the 2 closed leaves unreadable: edit them on main first (A).

## Open questions
- Q1 Delete the skip list and `batch.members` shim after a one-time edit of the 2 closed files (A), or keep it (B; C asks)?
- Q2 Stop seats writing `state.yaml`, or accept that a bad write strands only that leaf (A,C)? Why the seat wrote the keys is not inspected (C).
- Q3 Keep the capacity reservation for unreadable leaves (B)?
- Q4 Version skew: an older binary meeting a newer key, strict-isolate vs strip (C).
- Q5 One strictness rule for the whole file, including nested records that strip today (C).

## Where slots differ
- Skip list: A delete after the main edit; B keep (shim retirement needs its own evidence); C keeps in pick, asks in Q1.
- Live state count in akrogon: A 223 files found, B 201 parsed, C total 821 across repos (A 1044 total). Not material to the pick.

## Rebuttals

- B: tag split on test and nested-key claims (applied); `batch.members` shim needs its own live evidence (checked: 0 live files carry `members`).
- C: tag corrections on tests, valid-only list and skip-list stance (applied).
