# Review B: run-permit

Date: 2026-10-13
Phase: check.review, initial blind review
Base: 99a5ada582267e92d227c005eb1705ce7dc80576
Reviewed head: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139
Verdict: ready

## Findings

No Fixes, Nits or operator actions. Reviewed the entire base-to-head diff against brief.md, design.md, plan.md and implementation/report.md. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.

The shared permit covers run-check's timing and command execution and base-run's spawnLogged call. Neither admission wait holds the global state lock or base-run record lock. The descriptor is close-on-exec, only EWOULDBLOCK is retried, and cleanup removes the sidecar before closing the descriptor. Nested admission requires the token and verified PID/start-time/boot identity. Constructed environments pass the admission token, and repository env/pass_env cannot override it. Status detail returns before holder inspection, while the overview prints the verified holder without acquiring the permit.

The different-AKROGON_HOME limitation and killed-run descendants are explicit design residuals. The report's corrupt-sidecar limitation has no demonstrated source in the atomic writer or a done-criterion and does not establish a blocking defect. No lesson lines were removed, no runner configuration changed, and no planned test was skipped, filtered or disabled.

## Verification evidence

Reused current implementation evidence rather than repeating completed checks. The report binds all final runs to the reviewed head. The latest commit touching the planned tests or their shared helper is 76a4f1bf860ca1f7b31bf9c9344d9916d60bfd88, before those final runs.

- C1/C7: real second run-check stays blocked until release, names its holder once, and records wait_ms >= 1000. The base-run case independently checks its command is blocked and the holder is named.
- C2: real SIGKILL releases admission within 1 s while the setsid child remains alive.
- C3: real nested CLI invocation completes and omits wait_ms on nested admission. The existing nested run-check regression also passes.
- C4: unknown token, dead PID and mismatched kernel start time all keep commands blocked.
- C5: status and next complete while a real waiter remains blocked.
- C6: overview names the holder and elapsed time, then omits it after normal exit or with a dead recorded PID.

Planned proof command: `bun test --timeout=30000 tests/run-permit.test.ts`, 7 pass, 0 fail, recorded in implementation/proof-run-permit.txt. The plan records all seven tests red before product code, including the missing-sidecar failure for nested admission. These tests exercise real CLI processes and kernel flock, not a mocked permit.

All configured checks have current passing evidence through the printed run-check commands, including setup and own-modules guard:

- format: exit 0, unchanged files, implementation/proof-format.txt and implementation/check-format-1791888775575-1786877.log.
- typecheck: exit 0, implementation/proof-typecheck.txt and implementation/check-typecheck-1791888777438-1797048.log.
- test: 865 pass, 0 fail, 47 files, 105.68 s, implementation/check-test-1791888883250-1800451.log.
- test_changed: 704 pass, 0 fail, 26 files, 88.30 s, implementation/check-test_changed-1791888971691-2601653.log, with AKROGON_BASE set to the reviewed base.

Reviewer checks: clean `git status --short`, clean `git diff --check 99a5ada...HEAD`, reviewed HEAD matches the report, and `akrogon status run-permit` has no Missing lines. No red-check comparison was needed. No merge_checks are configured.

## Documentation and AREA paths

Opened README.md, docs/reference-index.md, docs/guide/setup.md and docs/guide/files.md, including the live description of changed command behavior. The changes describe admission, nested reuse and optional wait_ms consistently with the chosen design.

Ran one repository-root listing command for each changed AREA.md, extracting its quoted src/tests/skills/issues paths and checking existence. All named source, test and skill paths exist, including src/permit.ts and tests/run-permit.test.ts. docs/reference-index.md also exists and still links both area files.

Absent paths in the sparse worktree listing: src/AREA.md names issues/timings.jsonl, issues/base-runs.jsonl and issues/red-records.jsonl. tests/AREA.md names issues/merge-attempts.jsonl and issues/config.yaml. These are authoritative checkout records or generated output locations, not missing implementation/navigation targets. Their descriptions are unchanged and establish no dead-pointer consequence today. The merged timing description and removed duplicate init statement retain their original contracts.

## Test-Change trailers

Checked the path rule in src/test-files.ts and every trailer in base..HEAD. Both trailers occur in 76a4f1bf860ca1f7b31bf9c9344d9916d60bfd88:

`Test-Change: tests/run-check.test.ts design.md leaf architecture: AKROGON_RUN joins constructedEnv, so the allowlist admits it; no other expectation changed`

Accepted: design.md explicitly requires the constructed admission token, and only that name is added to the existing allowlist assertion.

`Test-Change: tests/AREA.md plan.md docs checklist: added one line naming tests/run-permit.test.ts; no existing line changed`

Accepted: plan.md explicitly requires this index entry. The tests path segment matches the trailer rule even for this Markdown file. The new test file needs no old-expectation citation. Product commits do not alter existing tests or fixtures.

## Merge verification: 2026-10-13

Attempt: 0d11508a-96f6-43e5-ac17-78c56fce5c05
Base: 99a5ada582267e92d227c005eb1705ce7dc80576
Tested top: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139
Members: none. Applied top matches the prompt. No fetch, rebase or commit performed.

Reran every configured checks command exactly as printed by akrogon config, in this worktree with refreshed AKROGON_BASE. Each implementation/merge-99a5ada-<name>.log begins with its exact command, base, exit status and signal, followed by complete stdout/stderr. All four commands exited 0: format made no changes, test passed 865 tests with 0 failures, typecheck passed, and test_changed passed. No merge_covers, merge_checks or advisory commands are configured. The worktree remains clean and HEAD is unchanged. No comparison records or new findings.

The host-test-load issue still has seat-containment in implement and leaf-stop in plan.synthesis, so this attempt has no completion owner to broadcast. Its issue index and run-permit brief were read before landing.

Result: merged --check returned `ok`. The merged call exited 0 and printed `moved merged` and `deployed 99a5ada58226..6c43d3f3e8b3`. No issue/epic completion line was printed, so no broadcast was required. Final changed-test result: 704 pass, 0 fail.
