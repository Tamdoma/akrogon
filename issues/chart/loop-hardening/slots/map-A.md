# Map A (HEAD 13f92e0)

## Seed verification

- #5 confirmed. `src/phase.ts:71-76` renames the owner into closed, then calls `closeSources`. `transition` :87 rejects merged, `completeOwner` :65 returns once the leaf is under closed. Nothing retries. Fix shape: close sources before the rename, so a failed closure leaves the owner in open/merged and the next sweep retries (`closeSource` already treats CLOSED as done, so the retry is idempotent).
- #6 mostly confirmed. `nextCommand` :367-404 has no per-repo or per-leaf catch; `readRepo` on a missing path, `allLeaves` on a bad state.yaml, `dependenciesReady` -> `findLeaf` on a bad blocked-by, and `cleanupMerged` :370 before the sweep all abort the run. Refuted: hook event parsing does not affect `--all`, `rawEvent` is only read when input is undefined (:363).
- #7 confirmed. `src/sync.ts:175` `git add -A` at root, :180 pushes `HEAD:` from any branch, no lock. `src/init.ts:38` hardcodes `issues/worktrees/` ignore regardless of `worktree_root`.
- #8 confirmed. `src/state.ts:58` and `src/status.ts:48` compare `state.repo` to the registered key; `src/init.ts:28` derives the key from the basename. The field is redundant: a leaf's repo is the checkout it lives in.
- #9 confirmed on every point. :221 returns on busy with no timeout or attempt; :303 merge check only `working`; :230 `undefined === undefined` skips prompting when both `agent_session` and `prompted[slot]` are absent; :249 and :276 use 5000 ms for both start and prompt; :171 throws on a third pane; :220 crashes on a missing pane id (only reachable by hand-edited state, since `allocate` sets both).
- #10 partly confirmed. `pull` uses `origin` by design, `tests/pull.test.ts:167` locks that; docs gap only. `install` links two folders (:329) but the open leaf `install-prune-links` already resolves this to four folders (its design.md line 10): excluded here. README :35-41 omits sync/park/unpark, and parked being committed is undocumented. `shapes.md` template phase is by design ("replace sample values"): not a defect. `ensureWorktree` :103 mismatch is real but only after a config change mid-leaf.
- #11 confirmed. `next.ts:314` notifies on every `dispatchLeaf` of a failed leaf. Fix shape: notify once inside `commitMove` when `to === 'failed'`; the sweep then stays silent. No dedup state needed.
- #12 confirmed textually. `skills/check-issue/SKILL.md:21` allows a peer question with an untimed wait during `check.review`, a two-slot phase. Fix: forbid peer questions in `check.review` (both reviewers blind), keep it for `check.fix`.
- #13 confirmed. `phase.ts:64` prints `issue complete` before the owner check at :68, so an epic emits one line per issue and before `closeSources`. `merge-issue` :43 broadcasts on that line. Fix: print only after the owner completes, same leaf as #5 since both reorder `completeOwner`. `discord-send.ts:106-116`: a chunk's second failure throws and skips later chunks. Exit is nonzero, so it is visible; remaining chunks being skipped is arguably right (a partial message with a hole is worse). Low.
- #14 confirmed items: `state.slot` written :235 never read; `priority` never read; `herdr()` `shell.ts:254` unguarded parse; deep trees mislock (`state.ts:99`); `completeOwner` :72 throws on closed-name reuse; `logMove` after commit is intentional (comment :52) but exits nonzero after `moved`; `recoverMerge` :139 fetch inside lock without timeout; parked leaf reports `Missing leaf`. `next <file>`: `existsSync` true so it takes the folder branch; crash is plausible. Most are messages or edge cases.

## Consolidation proposal (by destination)

1. `completion-order` (#5, #13): one leaf `close-sources-before-move` reorders `completeOwner` (closeSources, then rename, then `issue complete`), plus one leaf `discord-chunk-failure` only if the operator wants a behaviour change. Fast.
2. `next-isolation` (#6): one leaf. Per-repo and per-leaf try boundaries in `sweepAll`/`sweep`/hook path, structured `console.error` with repo/slug, continue; `cleanupMerged` failures skipped the same way. Needs one decision: notify the operator through herdr on skipped records or stderr only.
3. `dispatch-stalls` (#9, #11): leaves `notify-on-failure` (tiny), `prompt-and-merge-guards` (session-null prompt, blocked merger, start/prompt timeouts, third pane message), and `stall-timeout` which needs a decision on the stall signal.
4. `sync-scoped` (#7): one leaf, `git add -A -- issues`, refuse when the checked-out branch is not `default_branch`, hold the repo lock, ignore `worktree_root` in init.
5. `repo-identity` (#8): one leaf after deciding whether `state.repo` is dropped from enforcement or migrated.
6. `docs-gaps` (#10 remainder): README verbs and parked note, remote-is-merge-only note. Doc-only leaf. Skill-only fix for #12 could live in a sibling issue `review-blind`.
7. `hygiene` (#14): one issue, two leaves: `command-messages` (parked hint, ENOTDIR, `herdr()` guard, dead fields) and `tree-guards` (depth validation at handoff in shapes.md plus `withLeafLocks` refusal, closed-name reuse check at handoff). Fetch timeout and logMove order: propose out of scope.

Only dependency: none. All issues are independent; leaves within `dispatch-stalls` touch `next.ts` together but are independently checkable.

## Sharp questions

- Q-stall: what signal marks a seat as wedged? A) record `working_since` per seat in state when the sweep first sees `working`, fail the slot after `stall_minutes` (repo config, default 45) with an attempt consumed and a notification. B) no timeout, only notify after N minutes. Recommend A; without an attempt consumed the leaf never moves.
- Q-repo-field: drop the `state.repo` check (keep the field informational) or add a `rename` migration? Recommend drop: the file's location already proves its repo, the check guards nothing.
- Q-isolation-report: on a skipped record, herdr notification per run or stderr JSON only? Recommend one notification per run listing skipped slugs, since hooks swallow stderr.
- Q-sync-branch: refuse to sync off the default branch, or push `<branch>:<default>` anyway? Recommend refuse.
- Q-discord: keep stop-on-failure (current) as intended, or continue remaining chunks? Recommend keep and record out of scope.
- Q-#1: GitHub #1 is still open. Its chart `status-empty-open` was handed off, the leaf was parked, then deleted in 13f92e0. Re-intake here or leave? Recommend re-intake as its own small issue using the existing decision.

## Pitfalls

- Reordering `completeOwner`: `closeSources` reads leaves under the destination; pass the owner path instead. Chart folder move must stay after the rename.
- Isolation must not swallow lock errors or the global lock; boundaries go around per-leaf work, not around `withLock`.
- Stall timeout must not fire on legitimately long plan/implement turns; the default matters and B's blind positions can run 30+ min.
- Sync scoping: `git add -A -- issues` still stages `issues/worktrees` unless ignored; the ignore must use the configured root.
- Dropping the repo check: `status` prints per-repo tables from registration, so no output changes.

## Not yet specifiable

- Herdr-side stall signal (a per-agent last-activity timestamp) would be cleaner than state bookkeeping but needs a herdr change outside this repo.
