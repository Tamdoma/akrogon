# Implementation report: merge-seat-cap

Base: `4f5e3fd2ae13439c7fd8d8507c18ec524c0f9444` (AKROGON_BASE; `origin/main` unchanged at both refresh checks — no rebase needed, branch stayed ahead).
Committed head: `daeec29a4816f7b2ffb6d6e57cbc608e5f590407`.

Delegation: `implement: subagents`, wave 1 held two units, so two workers ran wave 1 together. No paid or live launches: count lines — none written.

## Refresh log

- Refresh 1 (pass start): fetched `origin`; `origin/main` = `4f5e3fd2` = AKROGON_BASE; no rebase.
- Refresh 2 (post-unit): fetched `origin`; `origin/main` unchanged; no rebase.

## Changed files and reasons

| Commit | Files | Why |
| ------ | ----- | --- |
| `d49b7bb8` | `tests/next.test.ts`, `tests/timing.test.ts`, `tests/timing-report.test.ts` | planned criterion tests, committed at plan.synthesis (Test-Change trailers on it) |
| `ad2cb3fd` | `tests/next.test.ts` | A's one expectation correction under the planned-test exception: the in-loop `liveTabs` expected a merged leaf's seats to survive a pass; reconcile's `mergedWorktree` closes a merged leaf's live tab unconditionally (`src/reconcile.ts` ~781), observed as `['waiter']` in the U1 run and in run-check `plan-break-exclude2` |
| `633db0ad` | `src/next.ts`, `src/timing.ts`, `src/timing-report.ts` | worker U1 (`a331a675` cherry-picked): `unfinished` excludes `merge`; `dispatchLeaf` refusal ends `capacity`; `seatCommand` error notes merge waiters uncounted; `waitReasonSchema` + `capacity`; `waitOrder` + `capacity` |
| `daeec29a` | `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md`, `docs/reference/files.md` | worker U2 (`93ed14e1` cherry-picked): merge waiters uncounted in `max_active` prose; `capacity` added to the wait-reason list |

Worker worktrees `merge-seat-cap-u1`, `merge-seat-cap-u2` removed after cherry-picks.

## Done-criterion proof

| Criterion | Command | Commit | Result |
| --------- | ------- | ------ | ------ |
| 1 | `bun test tests/next.test.ts --timeout=30000 -t "waiting in merge does not count"` | `daeec29a` | green — `check cap-count: 0` (2 pass; log `check-cap-count-1795294480190-3147386.log`) |
| 2a | `bun test tests/timing.test.ts --timeout=30000 -t "capacity waits"` | `daeec29a` | green — `check cap-wait: 0` (1 pass; log `check-cap-wait-1795294479438-3147390.log`) |
| 2b | `bun test tests/timing-report.test.ts --timeout=30000 -t "a capacity wait lists under its own kind"` | `daeec29a` | green — `check cap-report: 0` (1 pass; log `check-cap-report-1795294477553-3147392.log`) |
| 3 | reviewing seat reads `docs/reference/config.md`, `docs/reference/limits.md`, `docs/use/run-work.md`, `docs/reference/files.md`, and the `seatCommand` error in `src/next.ts` | `daeec29a` | text updated per D5; worker U2 ran `bun test tests/docs-links.test.ts --timeout=30000` — `check docs-links: 0` |

## Checks

`akrogon verify` on `daeec29a`: green — `format`, `test` (1267 pass / 0 fail, 85 files) and `typecheck` all ran; receipt `verify leaf daeec29a4816f7b2ffb6d6e57cbc608e5f590407: green` (log `check-test-1795294754341-3167052.log`). Wall time ~2.5 min.

## Mismatch handled

U1 returned a mismatch: the planned in-loop `liveTabs` expectation could not hold because `mergedWorktree` closes a merged leaf's live tab on the first reconcile pass. Verified in `src/reconcile.ts` (`tabLive` → unconditional `closeTabOf`), consistent with existing tests `a merged leaf with its tab still open does not count toward max_active` (tab stays live only until the merged pass, then closes on the next `next`). A applied the one-expectation correction (commit `ad2cb3fd`, `Test-Change` trailer citing the observed output); the rest of the case and all refusal assertions unchanged.

## Known limitations

- Plan note D6 stands: `skills/init-akrogon/` holds no `max_active` text, so nothing was updated there; recorded for review.
- A ledger holding `capacity` wait rows fails to parse under an older akrogon (design-recorded consequence, unchanged here).
- A merged leaf's live tab and seats still close on the first reconcile pass regardless of owner completion — pre-existing `mergedWorktree` semantics the corrected test now records.

## check.fix repair · 2026-11-21

B's review (head `daeec29a`) recorded F1 repaired by B on `3598b89a` (plus its reproduction test `456bccbc`) and handed F2 to A: criterion 1 lacked an `implement`-waiter case in the refused-session proof.

- `ef2b5c6e` adds the `implement` arm to `a leaf waiting in merge does not count toward max_active when its repo session is refused` under the check.fix missing-case exception (`Test-Change:` trailer cites criterion 1). Shown red against a deliberate break excluding `implement` from `unfinished`: `check fix-impl-arm-red: 1` — `queued-implement` allocated (log `check-fix-impl-arm-red-1795295138343-378264.log`); break reverted before the commit.
- Prior reviewed base/head: `4f5e3fd2`/`daeec29a`. Handed-off base/head: `4f5e3fd2`/`ef2b5c6e` (`origin/main` unchanged; no rebase).
- Proof rerun under the implement-end rule: only `cap-count`'s test changed, so it was rerun on `ef2b5c6e` — `check cap-count: 0` (log `check-cap-count-1795295144360-381589.log`); `cap-wait` and `cap-report` keep their green runs (B reran them on `3598b89a`: `check cap-wait: 0`, `check cap-report: 0`).
- `akrogon verify` on `ef2b5c6e`: green — receipt `verify leaf ef2b5c6ede284d7f9e3517e10508f25e4478b3f4: green` (1268 pass; log `check-test-1795295368199-384438.log`). Wall time ~3 min.

## Unverified criteria

None.
