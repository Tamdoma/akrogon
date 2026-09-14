# Report 2: src changes

## Changed files and reasons

- `src/routing.ts` — D2: failed.next now 6 exits, no check.fix/merged/failed.
- `src/config.ts` — D4: dropped max_active from repoSchema, effectiveConfig spreads repoConfig.
- `src/state.ts` — D6: deleted withRepoLock.
- `src/phase.ts` — D2/D3/D6: commitMove fix_rounds reset on any failed exit, requireCodeOnly empty-branch check, deleted recoverMerge, phaseCommand single global lock, trimmed imports.
- `src/pull.ts` — D6: pullRepo runs directly, dropped withRepoLock import.
- `src/sync.ts` — D6: single global lock, lockPaths global-only with length>0 guards around ls-files and ls-tree/log.
- `src/next.ts` — D1/D3/D4/D5/D6/D7: busy includes unknown, deleted seatFor/peerOf/peer branch/merge-seat block/recoverMerge call/withRepoLock wrap, activeCount returns number, allocate global cap only, debate gate, hooked=event!==undefined.

No tests/ or docs/ edits.

## Tests run

`bun run typecheck` — pass, no output.

`grep -rn "seatFor\\|peerOf\\|recoverMerge\\|withRepoLock\\|issues/.lock\\|repo_max_active\\|perRepo" src/` — empty, pass.

`AKROGON_BASE=26a7bc2613af4a2c9d579351bc66e87cd1af1427 bun test --changed="26a7bc2613af4a2c9d579351bc66e87cd1af1427"` — 187 pass, 8 fail, 195 total. New brief-1 cases pass: failed exits, empty branch, merge re-prompt, debate gate, typed sweep.

Failures (all brief-1 test bugs, src matches spec):

- F1 concurrent pulls serialize — expects repo-lock serialization. D6 deletes the lock, design accepts interleave. tests/pull.test.ts:238 unchanged by brief-1.
- F2 stale prompt three misses — expects peer prompt to A on working B (attempts 2->3). D1 deletes peer fallback. Test not rewritten.
- F3 logical B fallback final A busy — expects busy_since.A set when A has agent null. observeBusy clears null agents (unchanged per do-not). Brief-1 rewrite kept old expectation after removing the peer prompt that gave A an agent.
- F4 unreadable reserves capacity — with 2 leaves+1 unreadable total=3, max=3 blocks (3>=3) so 0 tabs, expects 2. Needs max=4. Brief-1 used 3.
- F5 recovers only merge by ancestry — expects auto-merge. D3 deletes recoverMerge. Test not deleted.
- F6 uncommitted merge never recovered — expects Uncommitted work error from recover path. D3 deletes it, idle merge now prompts. Test not deleted.
- F7 live merge peer retry — expects peer-seat busy notice. D1 deletes peer seats. Test not rewritten.
- F8 blocked merge seat B — expects B-seat fetch skip with attempts A:2. D1/D3 delete seat logic and fetch path. Test not rewritten.

Tail output:

```
8 tests failed:
(fail) concurrent pulls serialize listing and reconciliation
(fail) a stale prompt never re-prompts a busy or done seat, and three stale misses fail the leaf
(fail) logical B fallback warns for physical A and unknown agents retain busy observations
(fail) unreadable state reserves its capacity and reports its path
(fail) next recovers only merge-phase work by ancestry against a non-default remote target
(fail) uncommitted work in a merge worktree is never recovered as merged
(fail) a live merge retains its completion call after pushing, including a peer retry
(fail) blocked merge seat B prevents fetch and clean checks in a dirty worktree
 187 pass
 8 fail
Ran 195 tests across 8 files. [109.80s]
```

## Known limitations

Same as plan open limitation: overlapping pull runs no longer serialize. Merge re-prompt after push relies on idempotent merge skill.

## Unverified criteria

Criterion 2 (changed tests pass) fails on F1-F8 above. Each is a test expecting deleted machinery, not a src defect. Evidence: F1/F2/F5/F6/F7/F8 pass on stashed src and fail only after spec-required deletions; F3/F4 fail on stashed src too with impossible expectations (null-agent busy, 3>=3 block). No src change within plan scope can make them pass without reintroducing deleted behavior.
