# Review A: known-red-pass

Base: `483c693` (origin/main). Reviewed head: `b9bc11e`. Diff: 12 files, +438/−60.

## Verification evidence

- `akrogon verify` green on `b9bc11e` (receipt in `issues/verify-runs.jsonl`; 1001 tests, typecheck, format all 0).
- `akrogon run-check` proofs on the head: `proof-verify` 20 pass, `proof-gates` 5 pass, `proof-skills` 7 pass, `proof-flaky` 3 pass, `proof-keep` 3 pass — logs under `implementation/`.
- AREA listing: all 25 paths named in `src/AREA.md` exist from the repo root.
- Trailer audit: `Test-Change:` trailers on `5fb7672`, `24dca88`, `b9bc11e` each cite their real source (planned additions, worker-found wrong expectation, prettier wrap); `16ecd33`/`1f2a765` touch no test-file-matched path. `check.review` accepted the move, so the trailer gate passed mechanically.

## Judgment against the design

D1–D9 implemented as planned. `runOnce` extraction is faithful: allocation, `checkLocation`, record append under `recordLock`, `createSparseWorktree` + `emitEnvFile`, setup fan-out into command entries, record rewrite, worktree removal — all preserved. Head-half reuse picks the newest completed index-matched red run (D4); the base always goes through `runOnce`, never `greenRun` (criterion 4). `baseCoversHead` enforces completed+setup-0 base, index-matched commands, non-empty non-placeholder head names, subset on the same index — criterion 3's matrix is exercised in `tests/verify.test.ts` and merge scope in `tests/receipt-gates.test.ts`. `requireGreenReceipt` error text unchanged; `flips`/`reconcile` consumers confirmed unaffected (D7/D8). The mid-pass rebase onto `483c693` is recorded in `implementation/report.md`.

## Findings

### Fix F1 — operator-facing docs still describe the pre-known-red flow and receipt contract

Realistic source: an operator or seat reading the command reference and guides during a real merge or review. The diff changed `requireGreenReceipt`'s accepted evidence and the seat flow after a red rerun, and added a CLI flag; these pages document exactly that behavior and are now stale:

- `README.md:171` — usage `akrogon verify [--sha <rev>] [--attempt <id>] [--holder <dir>]` omits `--known-red`; the "Exits 0 only when every command passed" description does not describe the known-red pass path.
- `README.md:153` — the `phase` row still says check.review/merge moves need "a green leaf `akrogon verify` receipt", now also satisfiable by a qualifying linked pair.
- `docs/guide/merge.md:28` — "a red rerun ends with `check.fix --attempt <id>`" skips the new `akrogon verify --attempt <id> --known-red` step the merge skill now requires between a red rerun and the `check.fix` ending.
- `docs/guide/phases.md:94` — A's red retry is described as "a red retry keeps the repair path"; the known-red step (verify --known-red, both-logs judgment, agreed pass clears) is absent.
- `docs/guide/setup.md:53` — "require a green one for the exact commit and command set" omits the qualifying pair.

Consequence today: the canonical CLI reference and lifecycle guides claim a flow the product no longer has — an operator judging a red merge reads "red rerun ends with check.fix" while the skill routes through known-red first, and nothing outside the skills documents that `verify` accepts `--known-red`. Hits implement-issue's rule "updates every doc the plan names plus any doc the diff makes stale" and the 2026-09-11 stale-rule lesson's sweep class (plan's own grep covered the retired sentence only, not the verify semantics these pages state). No new test machinery needed; doc-only repair.

### Nit N1 — unused `extra` parameter in `tests/verify.test.ts` `failureScript`

The helper accepts `extra: Record<string, string>`; no caller passes it. Deferred: dead parameter in a test helper, no behavior consequence; remove it or use it, either repair is trivial.

### Nit N2 — `--known-red` still runs the full base when the head half is unusable

`verify()` falls through to merge-base + a complete base `runOnce` when the head run is red but `completed(head)` is false (killed or setup-failed run) or its commands yield no names — cases criterion 3 already forbids. Consequence: a wasted full base run before the inevitable `fail`, minutes of work for a predetermined answer. Deferred because the verdict stays correct and no criterion names fast-fail; promote if the wasted run shows up in real usage.

### Nit N3 — `src/AREA.md` at 44 lines over the 40-line guide

Pre-existing before this leaf (44 → 44). Deferred: not introduced here; the line-length target belongs to a docs pass.

## Verdict

`fix` — one doc Fix (F1), three Nits.
