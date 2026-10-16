# Review A: release-rollback

Base `6121559`, reviewed head `f0cb567` (2 commits: `d692a3d` tests, `f0cb567` product + docs). Serial-solo implement, `debate: no` so no position artifacts expected.

## Verified claims

- `src/rollback.ts` refuses before any mutation (`readGlobal` → `readDeployRecord` → previous-existence → non-release current), then `flip` → `writeReleaseHold` → `install()` under the akrogon repo's `akrogon-install.lock` — the same lock `deployStage` takes (`src/self-update.ts`). Hold naming matches plan D3: `old !== previous ? old : (readReleaseHold() ?? record.commit ?? previous)`, which keeps a retry from re-holding the good release. Traced all reachable states: normal (old=B→prev=A, hold=B), retry (current=A, hold preserved/refreshed from record.commit=B), no-previous and non-release refusals. Correct.
- `install()` reuse gives identical end state to the README's manual path (which runs the previous release's `install`); criterion 6's conflict refusal fires before `applySkillLinks`, leaving `current` on previous — covered by the green test.
- `readGlobal` wrap mirrors `readRepo` message-prefixing; error carries file path + zod key. All callers benefit uniformly; no tests asserted the old unwrapped message (44-test regression file green).
- README/manual-steps claims match live behavior: `flip()` is a temp-link rename (README `ln -s` + `mv -T` is the operator equivalent); hold format `commit: <sha>` matches `releaseHoldSchema`; the previous release's `install` is the same function rollback calls.
- AREA.md paths: all 12 paths named by the changed lines exist on disk (live listing run).
- command-reference contract `rollback: ''` satisfied by the zero-positional case and README row.

## Criterion proof status

All six criteria have green tests on `f0cb567` per `check rollback-criteria: 0` and `check deploy-and-contract: 0` (44 tests incl. command-reference and config), plus `akrogon verify` green on the identical tree (986 tests, typecheck, prettier). The `Test-Change` trailers are consistent: test file changes happened in the implement-window commits with citations; `tests/AREA.md` cited as required.

## Findings

No Fixes. Considered and dropped:

- Flip→hold write order leaves a crash window where `current` sits on previous while the bad commit is unheld — this is the brief's stated order (flip, hold, install) and the failure mode is self-repairing (the next deploy of the bad commit is a no-op resume of the bad state, and rollback is retryable); not a defect.
- `akrogon status` shows nothing about the post-rollback record/current divergence — the brief names no status surface for rollback; a feature request, not a defect.
- Criterion 3's README assertion (`toContain('release-hold.yaml')`) is a weak doc coupling — the manual steps themselves are executed against the fixture, which is the meaningful check; wording-coupling assertions are explicitly discouraged as blockers.

Verdict: **ready**.
