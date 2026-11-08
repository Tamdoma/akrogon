# Review B: deploy-listener-ready

Date: 2026-11-07. Phase: check.review. Verdict: **ready**.

Base: `67f0b262f7a0c7dde48dc17fe0234befadad02cb`.
Reviewed head: `99a256a8e57de5a05a8fa5c28cc109d710ba3101`.
Worktree was clean. This is the initial blind review. No peer review was read, no code was changed and no commit was made.

## Findings

No Fixes or Nits. The implementation follows D1-D9 and satisfies C1-C5 within the design's stated proof boundary.

- C1: Plugin releases retain daemon-reload, integration installation for install only, and plugin linking in the existing order. No restart or unlink runs for that shape.
- C2: Deploy plans the unit link from the incoming release, flips current, reloads and enables, writes success, queues restart, and unlinks last. Shape probes read current after flip. The no-herdr path skips unlink. Failures in the added steps flow through the existing deploy-failure record and resume mechanism.
- C3: Install uses the same service functions after applying links. Existing conflict handling applies to the new unit destination. Stale pruning scans skills and mods, so it cannot delete either systemd link. Rollback's install caller was checked against the explicit cross-cutover rollback exclusion.
- C4: The optional prefixes record is parsed at readGlobal, retained by init's existing config spread, and otherwise unused. Invalid values name the prefixes key and repo key in the schema error.
- C5: The report records 70.15 seconds for test against the 75-second baseline. No increase requires explanation.

## Verification evidence

The completed verify receipt `bdb11347-c995-4410-a7f0-0668c3a812bd` in the registered checkout's `issues/verify-runs.jsonl` names the exact reviewed head and tree `3cd8825c78feab3363f30288bedf40923618d6a1`. Setup, format, typecheck and test all exited 0. The test command is the configured `bun test --timeout=30000 --parallel=4 --no-isolate`, with 1,316 passing tests and no failures. No runner configuration, planned case or configured check was skipped or disabled by the diff.

Read the original logs with `akrogon log`, including the criterion runs, configured checks, base failures and V1-V9 deliberate breaks. The criterion commands match plan.md exactly. The proof runs and full verify follow the last changes to their tests and fakes (commit `6d6af827`), and no proof-command correction was needed. The full test log includes the new deploy, install and config cases. Existing green evidence is current, so no tests were rerun during review.

Original proof and check results, paths relative to this leaf:

```text
check c1: 0 implementation/check-c1-1794061955812-3159180.log
check c2: 0 implementation/check-c2-1794061956235-3159844.log
check c3: 0 implementation/check-c3-1794061956561-3160516.log
check c4: 0 implementation/check-c4-1794061956955-3161063.log
check format: 0 implementation/check-format-1794061962474-3161866.log
check typecheck: 0 implementation/check-typecheck-1794061964843-3161866.log
check test: 0 implementation/check-test-1794062035057-3161866.log
```

The base failures show absent unit links, unwanted herdr execution without the binary, and rejection of prefixes. V1 proves the brief's deliberate unconditional-plugin-link break. V2-V9 additionally detect record/restart order, restart/unlink order, the missing-herdr guard, integration gating, plugin-shape unlink gating, prefix validation and release-shape probe mistakes.

Review captures:

```text
check b-review-context: 0 implementation/check-b-review-context-1794062102939-3519456.log
check b-grounding: 0 implementation/check-b-grounding-1794062108174-3520079.log
check b-diff: 0 implementation/check-b-diff-1794062117908-3521310.log
check b-code-trace: 0 implementation/check-b-code-trace-1794062130046-3522082.log
check b-fixtures: 0 implementation/check-b-fixtures-1794062130044-3522081.log
check b-area-src: 0 implementation/check-b-area-src-1794062158116-3525109.log
check b-area-tests: 0 implementation/check-b-area-tests-1794062158256-3525188.log
check b-receipt: 0 implementation/check-b-receipt-1794062158390-3525402.log
check b-proof-logs: 0 implementation/check-b-proof-logs-1794062172582-3526873.log
check b-final-contracts: 0 implementation/check-b-final-contracts-1794062192771-3528700.log
```

## Documentation and live contracts

Opened docs/reference-index.md and the install, releases-and-updates, config and rollback pages before reviewing the diff. The changed pages describe the implemented conditional calls and new failure steps. Each changed AREA.md received its own repository-root path listing; every literal source/test path listed exists. Index pointers remain valid.

Checked the chart's P12/P13 evidence: plugin id akrogon and the unlink interface are supported, including exit 0 with removed:false on repeated unlink. No live systemctl or herdr operation was launched. Actual systemd enable/restart behavior and self-update from inside the listener remain explicitly assigned to engine-on-hc, as are the rollback guard and listener implementation. The report preserves those limitations and does not claim live proof here.

No lessons were removed or claimed retired. There are no reusable Nits to record.

## Test-Change trailers

Checked `67f0b262..HEAD` against src/test-files.ts. Every changed existing test-file-matched path has a trailer:

| Commit | Trailer path and stated source | Judgment |
| --- | --- | --- |
| `6d6af827` | `tests/install.test.ts`: three release-shape cases, brief C1/C3, no changed existing expectation | Accepted. Cases exercise install through the CLI and process boundary. |
| `6d6af827` | `tests/config.test.ts`: prefixes parse/refusal case, brief C4, no changed existing expectation | Accepted. Exercises config and init through the CLI. |
| `6d6af827` | `tests/fake-herdr.ts`: strict plugin unlink handler, brief C2/C3 and P13 | Accepted. Adds the new allowed command without weakening existing argument validation. |
| `6d6af827` | `tests/fake-systemctl.sh`: optional record observation, brief C2 | Accepted. Existing output stays unchanged when the observation variable is absent. |
| `99a256a8` | `tests/AREA.md`: deploy-shapes pointer and line joining, docs only | Accepted. Plan names the new pointer, existing descriptions remain, and no test assertion changes. |

tests/deploy-shapes.test.ts is new and needs no existing-file trailer. No existing test expectation, fixture assertion or regression case was deleted or weakened.

## Grants and operator actions

No grants or paid/live launches belong to this leaf. The artifacts contain local fixture tests and checks, with no unexplained covered activity. No operator action is required.
