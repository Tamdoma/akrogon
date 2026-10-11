# Report: frozen-test-guard

Base: `354c80e14aca6483c430312c61ae5c1397bb548e` · Head: `7d317b9` (lane `frozen-test-guard`)

## Changed files and reasons

Worker U1 commit `ab4bd9c` (cherry-picked as `f0414bf`), trailer `Test-Change: tests/phase.test.ts`:

- `src/state.ts` — `frozen: z.record(z.string(), z.string().nullable()).optional()` on `stateSchema`; path → blob id or `null` for planning deletions; absent field keeps today's guard (criterion 1).
- `src/phase.ts` — `requireFrozenCitations` called in `transition` right after `requireTestChangeCitations` only when `state.frozen` is set; `frozen` written into the `commitMove` state only on a real `plan.synthesis`→`implement` move (`{}` without a worktree; `--check` and the incomplete-slot save never write it). New private helpers `citedPaths`, `changedPaths`, `treeBlobs`, `frozenRecord`; `requireTestChangeCitations` refactored onto them with identical semantics and error text; merge call sites (`:421`,`:427`,`:904`) unchanged (criteria 1-4, 6).
- `tests/phase.test.ts` — four cases: record write/`{}`/replan rewrite; drift/reappear/delete/rename refusals with last-touch-or-later citation (planning trailer does not cite; own or later trailer-only commit does); unrecorded added test file and edited recorded non-test path; real `git fetch`+`git rebase` with conflict resolution plus the recorded-path-no-leaf-commit-touches case (criteria 1-5).

Worker U2 commit `e77f9b7` (cherry-picked as `7d317b9`) — docs only: `skills/implement-issue/SKILL.md:64`, `skills/merge-issue/SKILL.md:51`, `skills/implement-issue/brief-template.md:45`, `skills/chart-issues/assets/shapes.md:276` (adds `frozen` to command-owned fields), `docs/guide/merge.md:11`, `README.md:134`, `src/AREA.md` one bullet (criterion 7).

## Commands run

- `bun run typecheck` — clean.
- `bun run format` — clean; prettier rewrote unrelated drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`, both reverted (known lesson).
- `bun test --changed=354c80e... --timeout=30000` — 565 pass / 0 fail, 66.9 s.
- `bun test --timeout=30000` — 695 pass / 0 fail across 34 files, 85.5 s.
- `bun test tests/docs-links.test.ts` — 4 pass (U2).
- Deliberate break (lane): `requireFrozenCitations` stubbed to return early → all 4 frozen tests red; reverted, 4 pass again.
- U1 red-before evidence: new cases failed pre-implementation (no `frozen`, no refusal); break evidence pasted in worktree report.

## Criterion sweep (criterion 7)

`grep -rn "Test-Change\|test-files\|trailer" docs/ skills/ README.md` — all hits are the owned lines above or confirmed non-contradicting: `check-issue` :47 (B's review duty over all trailers in range), :83 (existing-file rule, still true), `merge-issue` :43/:65, `phases.md:92`, `merge.md:17`, `implement-issue` :84 (owned by test-proof-rules). No out-of-scope contradictions found.

## Done-criteria → proof

1. Record write/rewrite/empty/absent → "plan.synthesis move writes a frozen record…" test.
2. Drift, reappear, delete, rename; last-touch-or-later citation → "frozen record refuses drifted…" test.
3. Added `testFile()`-matched path outside record → "frozen record refuses unrecorded added test files…" test.
4. Recorded `scripts/proof.sh` guarded identically → same test.
5. Real fetch+rebase, criteria 2-4 unchanged; target-changed recorded path with no touching leaf commit refuses until trailer-only commit → "frozen guard holds after fetch and rebase…" test.
6. All pre-existing trailer tests green in the 695-test suite; merge call sites unchanged.
7. Doc edits + sweep above.

## check.fix repair (F1)

Reviewed head before repair: `7d317b9`; after: `9b60a94`.

B's F1: in the `lastTouch === ''` case, the whole-`<from>..<to>` trailer scan accepted a planning-era trailer replayed by a rebase, authorizing drift criterion 5 forbids. Fix (`282276d` → `9b60a94`): untouched violating paths are cited only by `Test-Change` trailers on commits in range that change no files (`git diff-tree --name-only -r` empty), via new `emptyCommitCitedPaths` (one `git log` formatted with `\x1e`/`\x1f` separators, lazy-evaluated once). The touch case `lastTouch^..to` is unchanged. New `frozen-rbpt` test replays B's probe: planning-cited deletion + target-modify + rebase `--ours` resolution → refused; a non-empty trailer commit still refuses; an empty trailer-only commit accepts. Red before fix (probe exited 0), green after. Doc lines (implement-issue :64, merge-issue :51, brief-template :45, merge.md :11, src/AREA.md) gained the "no branch commit touches the path → later trailer-only commit" qualifier; README :134 unchanged (names no window).

Post-repair evidence: `bun test --timeout=30000` 696 pass / 0 fail (77 s); `bun test --changed=354c80e…` 566 pass / 0 fail; `bun run typecheck` clean; `bun run format` clean after reverting unrelated `src/status.ts`/`peer-wait.ts` prettier drift again.

## check.fix repair, round 2 (F1 variant)

Head after: `595287d`.

B's re-check probe showed a planning-era `--allow-empty` trailer commit survives `git rebase` (git keeps deliberately-empty commits), so the round-1 empty-commit filter still authorized drift. Fix (`edcdf98` → `595287d`): the implement move now also records `frozen_cited` — the deduped set of `Test-Change` trailer values in `target..HEAD` at freeze — beside `frozen`. An untouched violation cites only via a trailer-only commit carrying a value not in that set; trailer content survives rebase, so a replayed planning cite no longer authorizes. New `frozen-rbec` test replays B's exact probe: refused after rebase, identical-text re-cite still refused, fresh trailer text accepted; `frozen_cited` contents asserted. `frozen-rbpt`/`frozen-rbnt` unchanged and green. Doc lines plus `shapes.md` command-owned field list updated for `frozen_cited`.

Post-repair evidence: `bun test --timeout=30000` 697 pass / 0 fail (80.8 s); `tests/phase.test.ts` 65/65; `bun run typecheck` clean; `bun run format` clean after reverting the same unrelated prettier drift.

## check.fix repair, round 3 (F2)

Head after: `93603e9`.

B's F2: the round-2 value-set rule rejected a genuinely new trailer-only commit reusing identical trailer text, contrary to criteria 2/5 (a later commit must cite regardless of wording). Repair (self, final round): `frozen_cited` now stores the multiset of `Test-Change` trailer values on empty commits in `target..HEAD` at freeze; an untouched violation cites when a value's occurrence count on empty commits in `<from>..<to>` exceeds its freeze count. Replays preserve the count (F1 stays refused); a new trailer-only commit adds one (accepted, same text or not). `frozen-rbec` updated: identical-text new commit now asserts acceptance; `frozen_cited` asserted as `['old.test.ts planning deletes obsolete test']` (empty-commit trailers only); title renamed. Five doc lines + README parenthetical corrected to "a commit new since the record, a replayed planning-era trailer does not count".

Evidence: `bun test --timeout=30000` 697 pass / 0 fail (75 s); `tests/phase.test.ts` + `docs-links` 69 pass; typecheck clean; format clean after the same unrelated prettier-drift revert. Commit `93603e9`.

## Known limitations

- Per held disagreement B F3, carried batch members skip the frozen check at merge (their last seat move already passed it); the holder's `--check` still runs it against the stack top.
- Per B F2, no declared frozen list for unchanged runner/fixture/config paths; `test-proof-rules` criterion 6 covers review of such edits.
- This leaf's own branch has no `frozen` record: the installed `akrogon` predates the feature, so it moved under criterion 1's no-record rule.
- A recorded path touched by another member's stacked commits can refuse the holder's merge `--check`; a trailer-only commit is the escape (documented in plan.md).

## Unverified criteria

None.
