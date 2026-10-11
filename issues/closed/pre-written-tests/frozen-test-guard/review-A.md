# Review A: frozen-test-guard

Base: `354c80e14aca6483c430312c61ae5c1397bb548e` · Reviewed head: `7d317b9`
Commits: `f0414bf` (code+tests, Test-Change trailer for tests/phase.test.ts), `7d317b9` (docs).

## Behavior traced, not read-only

Ran the full suite in the lane worktree: `bun test --timeout=30000` → 695 pass / 0 fail, 85 s. `bun test --changed=354c80e…` → 565 pass / 0 fail. `bun run typecheck` clean. `bun run format` clean after reverting unrelated prettier drift in `src/status.ts` and `peer-wait.ts` (known lesson; reverts are not in the diff).

Deliberate break verified first-hand: stubbing `requireFrozenCitations` to return early turned all 4 new frozen tests red; revert restored green. The tests prove the guard, not a no-op.

## Criterion-by-criterion

1. Record write — `transition` writes `frozen` into the `commitMove` argument only on `state.phase === 'plan.synthesis' && requested === 'implement'`, after the `checkOnly` return and the incomplete-slot save. Verified in code and by the test asserting `frozen` equals real `git rev-parse HEAD:<path>` ids plus `null` for deletions, `{}` for a clean branch, and a rewritten record after `failed`→`plan.synthesis`→`implement`. Missing field: schema is optional; existing no-`frozen` cases stay green.
2. Refusal/citation — `requireFrozenCitations` compares HEAD tree blobs (record `null` vs present, id vs absent, id mismatch) and requires the trailer in `lastTouch^..HEAD`, whole range when no leaf commit in `from..to` touches the path. Tested: drift, reappear, delete, rename (old name refused, new name separately required), planning-trailer does not cite, own-commit and later empty-commit trailers do. `frozen` still present in state after the refused move.
3. Added `testFile()`-matched path outside the record (`extra.test.ts`) refused, accepted with trailer. `frozen[path] === undefined` correctly distinguishes from recorded `null`.
4. `scripts/proof.sh` (not test-matched) guarded identically.
5. Real `git fetch`+`git rebase origin/main` in the fixture with actual conflict resolution; plus the no-leaf-touch case (target re-added `old.txt`, rebase replay produced no touching commit → full-range scan → trailer-only commit cites). 
6. Old M/D/T guard unchanged: identical semantics after the `citedPaths`/`changedPaths` extraction, same error text, merge call sites :421/:427/:904 untouched (confirmed in diff). All pre-existing trailer tests green.
7. Seven owned lines updated accurately; `shapes.md` gains `frozen` as command-owned; sweep hits at check-issue :47/:83, merge-issue :43/:65, phases.md:92, merge.md:17, implement-issue :84 confirmed non-contradicting.

## Findings

None blocking. One Nit, deferred: `violating` paths with `lastTouch` absent scan trailers over the whole range, which matches the criterion-5 rule but also means an unrelated earlier trailer names the path; this is the design's stated semantics and the trailer-only-commit escape, so it stays a note.

Also noted (accepted in plan/design, not findings): held disagreements B F2/F3 stand — no declared frozen list, no frozen check for carried batch members.

## AREA.md check

`src/AREA.md` updated; all paths it names verified present (`src/*.ts`, `tests/*`, `docs/reference-index.md`, `issues/config.yaml`). New bullet accurately states write point, drift/add refusal, and the citation window.

## Verdict

ready
