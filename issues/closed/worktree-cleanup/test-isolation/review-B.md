# Review B: test-isolation

Date: 2026-10-15. Phase: check.review. Verdict: **fix**.

Base: `0a80ab91e9388e60ce148f500fa92eb9859e1aeb`.
Reviewed head: `ef821bbfc8589ad046c6d8c47b8dedafcb53a9c9`.
Reviewed tree: `a1d30f457e5cbb7693f3e2f78f51f59b47612f04`.
Initial blind review. Debate is disabled, so there are no positions-B or rebuttal-B artifacts. No product changes or commits made.

## Fixes

F1. The required behavioral red proof is missing for the isolation mechanism. The only recorded red command, `bun test --timeout=30000 tests/isolation.test.ts`, exits with `Cannot find module './isolation'`, before either test executes. It does not demonstrate that the existing tests detect real-root writes or escaped descendants when the corresponding mechanism is broken. This is a verification gap against C1/C2, the design's failing-before/passing-after requirement, and check.review's requirement for a behavioral red proof. It is not a claim that the current implementation leaks.

Use the existing isolation tests and runner to record a deliberate behavioral break of environment isolation and descendant adoption/cleanup, show the relevant assertions red rather than an import failure, restore the implementation, and record the current green run. Preserve the frozen expectations. Add the commands, reviewed tree and kept red/green logs to the implementation report. This needs only missing proof recordings with existing machinery, so it belongs to A under the check.repair handoff rule.

Evidence: `check review-B-red-proof: 0 implementation/check-review-B-red-proof-1792100105015-4110944.log` reads the original red log, `implementation/check-isolation-1792097932394-965246.log`: 0 pass, 1 fail, 1 error, missing module.

## Verification reviewed

- `check review-B-records: 0 implementation/check-review-B-records-1792100052973-3805560.log`: latest test log is 852 pass, 0 fail, 8812 assertions. Latest format and typecheck logs are green.
- `check review-B-receipt: 0 implementation/check-review-B-receipt-1792100083917-3962069.log`: receipt `73b64b0c-241c-4068-98a1-9cdc2eac5a8e` on `3944b17e1db0acee30b14626a8e33a7efb103cf7` matches the reviewed tree. Setup, format, test and typecheck all exit 0. The final commit only adds a trailer and changes no tree content. The report names an older receipt ID, but the current receipt is present.
- `check review-B-proof: 0 implementation/check-review-B-proof-1792100062852-3841159.log`: retained namespace suite output runs all 852 tests, with 5 namespace failures; the plain suite rerun has 852 pass, 0 fail. The namespace failures do not replace the green required checks.
- The receipt probe also confirms the namespace roots listing is empty and the process snapshot delta contains no suite scratch signatures. The report's whole-suite positive evidence supports the present implementation. It does not supply F1's behavioral red evidence.
- No planned test was skipped, filtered or disabled. The latest full verification includes all changes to tests and helpers. No full-suite rerun was needed for this read-only review.
- Installed `akrogon log <path>` is unavailable: it returns Usage and exit 1. Existing logs were read directly by the kept read-only probes above. `review-B-evidence` was an empty stdin probe and supplies no evidence.

## Documentation and paths

Read `docs/reference-index.md`, `tests/AREA.md` and the affected live code. The added preload description matches the implementation. No other documented behavior changed.

One repository-root listing checked every named AREA path: `tests/`, `bunfig.toml`, `tests/helpers.ts`, `tests/isolation.ts`, `tests/phase.test.ts`, `tests/command-reference.test.ts`, `tests/docs-links.test.ts`, `tests/watch-issues-scripts.test.ts`, `skills/watch-issues`, `tests/guard.test.ts`, `tests/run-permit.test.ts`, `tests/run-units.test.ts`, `tests/verify.test.ts`, `tests/receipt-gates.test.ts`, `tests/seat-containment.test.ts`, `tests/fake-busctl.ts`, `tests/fake-proc.ts`, `tests/reconcile.test.ts`, `tests/leaf-stop.test.ts`, `tests/merge-attempts.test.ts`, `tests/timing.test.ts`, `tests/timing-report.test.ts`, `tests/pause-status.test.ts`, `tests/hold-retired.test.ts`, `src/shell.ts` and `docs/reference-index.md` all exist. `issues/config.yaml` and `issues/merge-attempts.jsonl` are absent in this sparse worktree but both exist in the registered checkout, confirmed by the red-proof probe. No dead-pointer finding.

## Test-Change trailers

Reviewed the complete base-to-head commit range using the path rule in `src/test-files.ts`:

- `ef821bb`: `tests/isolation.ts new preload mechanism, no case` (empty-tree citation commit).
- `3944b17`: `tests/isolation.test.ts format only, no expectation changed`.
- `de531f8`: `tests/isolation.test.ts typecheck string|undefined`.
- `0bcc657`: `tests/AREA.md preload line`.
- `bb73b54`: `tests/install.test.ts explicit AKROGON_LEAF_TEMP_ROOT in self-update fixture, no expectation changed`; `tests/config.test.ts added existsSync guard, no expectation changed`.
- `4bf4cc6`: `tests/run-units.test.ts slice/stale-scope teardown, no expectation changed`.
- `fffa4fd`: `tests/helpers.ts tree-kill teardown, no expectation changed`; `tests/run-permit.test.ts tree-kill teardown, no expectation changed`; `tests/pause-next.test.ts tree-kill teardown, no expectation changed`.
- `2dfdc2d`: `tests/isolation.test.ts real output /proc children path`.
- `5ab6c34`: `tests/isolation.ts added preload mechanism, no case`.
- `8e97ebf`: new isolation tests, no trailer.

The changes match those descriptions and the brief's isolation outcome. The per-thread children path correction matches the kernel interface. No existing expectation was removed or weakened. The new tests' initial loader failure remains F1.

## Nits and operator actions

None.

## 2026-10-15 check.repair

Read both initial reviews against unchanged head `ef821bbfc8589ad046c6d8c47b8dedafcb53a9c9`. A has no Fixes. B's F1 is the only blocking finding. There are no product repairs or operator actions. The working tree is clean. No files affecting proofs changed, so the existing green verification evidence remains applicable. No code changes, commits or repeated checks in this handoff-only pass.

### Handed to A

- F1, C1/C2: exception for a missing proof capture or recording using existing machinery. Use `tests/isolation.test.ts` through `akrogon run-check` and the existing Bun runner to record assertions failing under deliberate breaks of environment isolation and descendant adoption/cleanup, then passing after restoration. The missing evidence is behavioral red/green output, not another import failure. Preserve frozen expectations and record commands, tree and kept logs in `implementation/report.md`.

## 2026-10-15 check.review after check.fix

Verdict: **ready**. F1 resolved. No remaining Fixes, Nits or operator actions.

Prior reviewed base/head: `0a80ab91e9388e60ce148f500fa92eb9859e1aeb` / `ef821bbfc8589ad046c6d8c47b8dedafcb53a9c9`.
Handed-off and reviewed base/head: `fa0f4c261532b1b2ba32e9984f3f38d5897c6e07` / `dd0de7b9aa9673a2595c1102026b87606d55e77c`.
Current tree: `d8fa496a69cc683e8a258eec5dd07d7a5dea029b`. Working tree clean.

Computed `git range-diff` between those recorded ranges myself: every one of the 10 commits is equal, with no added or changed patch, including no frozen-test changes or conflict resolutions. Main's commits were not reviewed as repairs. No new Test-Change trailers or documented behavior changes in this repair.

Evidence: `check review-B-recheck-range: 0 implementation/check-review-B-recheck-range-1792100465900-1470315.log`.

Read A's kept logs directly, using the previously documented workaround for the unavailable `akrogon log` command:

- `check red-env: 1 implementation/check-red-env-1792100273361-512047.log`: T1 executes and fails its leaf-temp scratch assertion with a sibling scratch path, while T2 passes.
- `check red-subreaper: 1 implementation/check-red-subreaper-1792100279958-526410.log`: T2 executes and fails the adopted-orphan assertion, while T1 passes.
- `check red-sweep: 1 implementation/check-red-sweep-1792100290393-619317.log`: T2 executes and fails the surviving-grandchild assertion, while T1 passes.
- `check isolation-green: 0 implementation/check-isolation-green-1792100296120-678705.log`: restored implementation, both tests pass. These behavioral failures and restored green resolve F1 without changing expectations.

`check review-B-recheck-evidence: 0 implementation/check-review-B-recheck-evidence-1792100472935-1485502.log` confirms `/proc/526888` and `/proc/620623` are absent, so the deliberate proof leaks were cleaned up. The report's named verify ID is absent, but a matching current-head receipt exists, independently checked below. This citation discrepancy does not leave a verification gap.

`check review-B-recheck-receipt: 0 implementation/check-review-B-recheck-receipt-1792100477684-1495782.log` reads receipt `2b7773a3-ecde-4a63-b634-2b026fe16c0f` for current head/tree: setup, format, test and typecheck exit 0. Read back the receipt's logs: 859 pass, 0 fail, 8878 assertions across 51 files; formatting and typecheck pass. This run follows restoration and rebase. Existing whole-suite root/process proofs remain applicable to the unchanged leaf patches. No redundant check rerun needed.

## 2026-10-15 merge

Attempt `b8529d5e-8a0a-4e75-b466-402688da8daa`, memberless applied top `38d7a95722540ea3da8a9de1913d8d88431b4091`, built on `8b8515ff597dfc42039244b35da694a818e03c3c`. No manual fetch, rebase, code change or commit.

`akrogon verify --attempt b8529d5e-8a0a-4e75-b466-402688da8daa` exited 0: merge receipt `5d4a8c14-9fa2-4d48-8168-4305256b5b0f`, tested top as above. Setup, format, test and typecheck all exited 0. Full suite: 871 pass, 0 fail, 8933 assertions across 52 files. Logs under `implementation/`: `check-setup-1792100510844-1569638.log`, `check-format-1792100512513-1569638.log`, `check-test-1792100630961-1569638.log`, `check-typecheck-1792100632775-1569638.log`. No advisory checks configured.

`akrogon phase test-isolation merged --slot B --check --attempt b8529d5e-8a0a-4e75-b466-402688da8daa` returned `ok`. Read the worktree-cleanup owner index and all six leaf briefs before completion.

Final `akrogon phase test-isolation merged --slot B --attempt b8529d5e-8a0a-4e75-b466-402688da8daa` exited 0 and printed `moved merged`. No issue/epic completion line was printed, so no broadcast was triggered. The command reported the registered checkout update pending: `Entry 'README.md' not uptodate. Cannot merge.; 33 behind origin/main; commit or finish the overlapping edit`. The leaf merge completed; the unrelated checkout edit was left intact.
