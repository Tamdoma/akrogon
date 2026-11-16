# Implementation report: refuse-failed-runs

Serial-solo run (plan's wave structure holds one unit). Base `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`, head `7caad67dfc700857b246a812000f7cc16fafd418`.

## Refresh

- Fetch `origin` and rebase onto `origin/main`: base moved `8532a1f7` → `7cee541d`, test commits replayed as `f26c3e22`, `929f274c`. No conflicts.
- Second refresh after implementation: already current, no move.

## Changed files

- `src/run-check.ts` — `failedRefusal(caller, repo, name, run)` added beside `PublishRefusedError`: skips `phase === undefined` callers, re-reads `readState(dirname(target))`, appends one `check_refused` row and throws `PublishRefusedError` with the brief's text (`(failure record unavailable)` and a recovery clause naming no phase when `state.failure` is absent). Called after the early `ownerRefusal` (before `runRoot`/admission) and inside `withAdmission` after the fenced late `ownerRefusal` (the acceptance point, before capture files). `run` and the `check` row object hoisted to `checkedRun`'s top.
- `src/timing.ts` — `check_refused` member added to `timingEventSchema` (`slugged` + `checkCore`).
- `docs/reference/commands.md` — run-check row names the failed-leaf refusal, its two reads, the timing row and the holder exemption.
- `docs/reference/checks.md` — new paragraph under "Keep output with akrogon run-check": both reads, the acceptance point, refusal text, incomplete verify receipt, reuse/join carve-out and the holder exemption.
- `docs/reference/files.md` — `check_refused` added to the `timings.jsonl` kind list.
- `src/AREA.md` — line 5 names the refusal, the re-reads, the `check_refused` row and the holder exemption.
- `tests/state-inventory.test.ts` — A's one wrong-expectation correction (see below).

## Expectation correction

`tests/state-inventory.test.ts` ('one bad leaf stops only itself') asserted `run-check` exit 0 on a leaf it had just moved to `failed` — a direct contradiction of brief criterion 1. The run-check probe now runs before the phase move so it still proves what the test exists for: a bad sibling does not stop serving the healthy leaf. Own commit `7caad67d` with `Test-Change:` trailer citing the brief line.

## Criterion proofs (all on head `7caad67d` unless noted)

- C1/T1, T1b, T2, T7: `bun test --timeout=30000 tests/run-check.test.ts` (31 pass) and `bun test --timeout=30000 tests/verify.test.ts` (71 pass). Kept logs `check impl-run-check-tests2`, `check impl-verify-tests2`. Refusals exit 1 with the brief's text, no child spawned (marker assertions), `run <uuid>` absent on early refusal, `(failure record unavailable)` and no recovery phase without a failure record.
- C2/T3: same run-check file run — the full-line waiter prints `waiting for`, is refused after promotion, exits 1, marker absent.
- C3/T4: same run — exactly one `check_refused` row (`slug`, `run`, `name`, `scope`, `phase: 'failed'`, `attempt`), parsed through `readTimings`; no `check_start`/`check_end` for the run.
- C4/T5, T6a, T6b, T8a, T8b: same runs — mid-run failure finishes and publishes, `--holder` run-check and `verify --holder` green on a failed sibling, green-receipt reuse and live-pass join return without a child or refusal row.
- Deliberate-break evidence is recorded in `plan.md` (each break shown red at planning and reverted).
- `check impl-typecheck: 0`, `check impl-format2: 0` (prettier clean; `ed6c1ec4` applied formatting to the new tests, proofs rerun after it).

## Checks and verify

- `akrogon verify` on `ed6c1ec4`: red — `state-inventory.test.ts` old expectation (fixed above, leaf-caused).
- `akrogon verify` on `7caad67d`: red — `door-exchange.test.ts` 'a re-armed wait ignores the report it already woke on' (`wait.code` empty after `appears`). `git diff` shows no door/hc file touched; one rerun `bun test tests/door-exchange.test.ts -t 're-armed wait ignores'` through `akrogon run-check` (`check impl-door-retry: 0`) is green → recorded **inconsistent** per the red-check rule. Log: `check impl-door-retry` vs `check-test-1794845395447`.
- `akrogon verify` on `7caad67d` again: **green** (1199 pass / 83 files). Receipt `check-test-1794845511438`.

## Count lines

No grants, paid or live launches this pass. Every launch was a free local command through `akrogon run-check` or `akrogon verify`; kept logs under `implementation/`: `setup`, `impl-typecheck`, `impl-run-check-tests`, `impl-verify-tests`, `impl-format`, `impl-format2`, `impl-run-check-tests2`, `impl-verify-tests2`, `impl-state-inv`, `impl-door-retry`, `check-test-*` verify receipts.

## Known limitations and unverified criteria

- Timing seam (carried from design): `readTimings` parses every line strictly in one try; an older akrogon release reading a timings file with a `check_refused` row drops all timings for that repo.
- Plan note N1 stands for review: the design's literal missing-record tail drops `<slug>`; the implementation keeps `akrogon phase <slug>` per the criterion's template.
- `verify --attempt` on a failed leaf is unreachable by construction (its caller lookup requires phase `merge`); no separate proof.
- A verify refusal leaves one incomplete receipt row (`setup` absent, `end` absent) — asserted in T7.
- No unverified criteria.
