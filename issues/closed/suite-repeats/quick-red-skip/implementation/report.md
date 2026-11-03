# Implementation report: quick-red-skip

Restored by slot B during check.repair, 2026-11-01, for review-A F2. Original implementation evidence is reconstructed from committed changes, reflog and the saved receipt/logs. New repair proofs below were run by B.

Base: `318cfda32d8ee6a569326ba7785df740cfd22039`
Initial reviewed head: `bee1b5429f58e9cec1ab2d2bfe904c529e698ee8`
Current committed head: `516759cf09df9d1c53215fe73796af0eebd15b2e`

## Changed files and reasons

- D1: `src/verify.ts` orders quick checks before full checks, records full entries blocked on setup/quick failure, removes per-command reuse and skips a known-red base pass when a whole-green row exists. Repair F1 keeps the first quick failure as the blocker, matching merge members and plan D2.
- D2: `tests/verify.test.ts` covers the CLI/gate outcomes, retries without reuse and schema compatibility. B added one F1 reproduction for two failing quick checks. `tests/slow-merge.test.ts` replaces obsolete live-reuse expectations with current seeded/blocked cases while retaining episode assertions.
- D3: `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `docs/reference/checks.md`, `docs/reference/commands.md`, `docs/reference/config.md`, `docs/use/merge-and-announce.md`, `src/AREA.md` and `tests/AREA.md` describe blocked checks and remove per-command reuse promises.

## Original implementation and refreshes

The implementation uses planning test commit `a18a1e97`, docs commit `cf729526`, product commit `37d5975e`, formatting commit `8d5c5723` and the empty citation commit `bee1b542`. Worker-owned files and outcomes are integrated in those commits and proved by the saved configured test run.

Reflog records these implementation refreshes that changed the base:

- R1: prior base `f7ddb69378c47af5feb978380fe1956e0fbfa1e1`, prior head `f0cd33ae46b2b8b5f9ca86e2907f469960fc9ba3`; new base `de57a744b69b2a780ef7625cd5d38f3a9784a877`, new head `65c9706fa8c92cb047388700608eadfb1d78696b`.
- R2: prior base `de57a744b69b2a780ef7625cd5d38f3a9784a877`, prior head `d1d9573b0b2072e8d680deeae1a54c500538170d`; new base `318cfda32d8ee6a569326ba7785df740cfd22039`, new head `37d5975e23e984df53eb614f61fff733c51637eb`. The subsequent formatting and citation commits produced the reviewed head.

B did not refresh the branch in check.repair. Its before/after heads are the initial reviewed head and current committed head above. History source: `check repair-b-history: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-history-1793540510627-1136158.log` and `check repair-b-final-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-final-diff-1793540538399-1137711.log`.

## Original configured checks

Saved completed receipt `ee1468ef-1f67-4587-8a8b-61fe38348150` ran `akrogon verify` at `8d5c5723bfaf3c41dde980cba614226cf7945bfd`, tree `916761c776917d7a9a7931788dcadd71ae0aee17`, identical to the initial reviewed head's tree. Setup exited 0.

- E1: `bunx prettier --check src tests skills/chart-issues/scripts`: exit 0, all matched files formatted. `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-format-1793540068818-803909.log`
- E2: `bun test --timeout=30000 --parallel=4 --no-isolate`: 1267 pass, 0 fail across 72 files. `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-test-1793540136718-803909.log`
- E3: `bun run typecheck`: exit 0. `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-typecheck-1793540139061-803909.log`

All planned cases appear in this configured test run. Current repair proofs below supersede its criterion results where inputs changed.

## Repair F1

Reproduction commit: `4b0b2fbc97969b230d0758282dbacd650c67003a`.
Fix commit: `516759cf09df9d1c53215fe73796af0eebd15b2e`.

Real source: a verify pass with two failing quick checks and a full check, plus merge members at merge scope. Before repair the full entry used the last quick failure's exit/log/name while members used the first. `blockedBy ??=` now retains the first failure in the shared sequential runner. No test expectation was corrected.

Command: `akrogon run-check --name repair-b-f1-red -- bun test tests/verify.test.ts --test-name-pattern 'share the first failing quick check'` on the reviewed product plus the new reproduction. Result: 1 fail, full exit 7 instead of first-blocker exit 4. `check repair-b-f1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-f1-red-1793540485440-1130324.log`

The same test after the fix, captured as `repair-b-f1-green`, passes with 8 assertions. Its working tree is exactly the product/test content committed in `516759cf09df9d1c53215fe73796af0eebd15b2e`. `check repair-b-f1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-f1-green-1793540493212-1130986.log`

## Current planned proofs

Dependency setup ran first through the configured install lock: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile --backend=copyfile"`. Exit 0, no package changes. These are the existing planned proofs, authored before B's repair. No proof command or expectation was corrected.

- C1/C2: `akrogon run-check --name repair-b-c1-c2 -- bun test tests/verify.test.ts --test-name-pattern 'red check outside full|failed setup blocks'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 2 pass, 0 fail. `check repair-b-c1-c2: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c1-c2-1793540510259-1131842.log`
- C3: `akrogon run-check --name repair-b-c3 -- bun test tests/verify.test.ts --test-name-pattern 'red full check never'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 1 pass, 0 fail. `check repair-b-c3: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c3-1793540510068-1131846.log`
- C4: `akrogon run-check --name repair-b-c4 -- bun test tests/verify.test.ts --test-name-pattern 'same-tree retry|command text|incomplete or failed-setup|receipt schema'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 5 pass, 0 fail. `check repair-b-c4: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c4-1793540510241-1131843.log`
- C4 flaky: `akrogon run-check --name repair-b-flaky -- bun test tests/flaky.test.ts --test-name-pattern 'reused green entry'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 1 pass, 0 fail. `check repair-b-flaky: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-flaky-1793540509840-1131845.log`
- C4 slow: `akrogon run-check --name repair-b-slow -- bun test tests/slow-merge.test.ts --test-name-pattern 'open episode pins|eligible rows'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 2 pass, 0 fail. `check repair-b-slow: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-slow-1793540510523-1131847.log`
- C5: `akrogon run-check --name repair-b-c5 -- bun test tests/verify.test.ts --test-name-pattern 'no base pass|fresh base run'` on `516759cf09df9d1c53215fe73796af0eebd15b2e`: 3 pass, 0 fail. `check repair-b-c5: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-c5-1793540510077-1131844.log`

C6 is unchanged by repair. Both initial reviews read the required skill/doc sections and accepted their blocked-check and reuse wording. B changed only one source line and added one regression case.

## Repair F2 and remaining limits

The missing report is restored here in the authoritative leaf folder, as required by the issue-artifact contract. No issue artifact is added to the code branch. Before evidence: `check repair-b-inputs: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-repair-b-inputs-1793540442307-1128785.log` records `implementation/report.md absent`.

Known limitations remain those accepted by design: blocked entries are not known-red cover; old reused rows retain their schema/consumer guards; command ordering can invalidate old receipts where full checks were configured; retries repay previously green siblings. A's cosmetic N1 is deferred unchanged. No operator action, handed-off Fix or unverified done-criterion remains.

## Current configured-check verification

The first `akrogon phase quick-red-skip merge --slot B` attempt was refused with `No green leaf verify receipt for 516759cf09df9d1c53215fe73796af0eebd15b2e under the current config; run akrogon verify on this commit`. The installed phase command at release `318cfda32d8ee6a569326ba7785df740cfd22039` enforces the receipt but does not launch verify. B therefore ran `akrogon verify` explicitly on the same committed head to satisfy that refusal. Run: `779469b4-df4f-4fbd-be81-46ea820e4cbc`.

Result: `verify leaf 516759cf09df9d1c53215fe73796af0eebd15b2e: green`, exit 0, setup 0. Each log was read back with `akrogon log`.

- E4: configured format command exit 0. `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-format-1793540634051-1141378.log`
- E5: configured test command 1268 pass, 0 fail across 72 files. `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-test-1793540703124-1141378.log`
- E6: configured typecheck command exit 0. `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/suite-repeats/quick-red-skip/implementation/check-typecheck-1793540705688-1141378.log`

