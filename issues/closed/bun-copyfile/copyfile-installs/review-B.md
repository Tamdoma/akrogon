# Review B: copyfile-installs

Date: 2026-10-27. Phase: check.review. Verdict: ready.

Base: `2cd0ec17e7179055ef1fcc3a255cb0734fb41f9d`.
Reviewed head: `174394dd971a43416872bbc1c8e803180bbbdffd`.

## Findings

No Fixes, Nits or operator actions. Reviewed the entire initial diff against the brief, design, plan and implementation report without reading the peer review. The worktree is clean. No code or test changes were made during review.

## Criteria and contracts

- F1, criterion 1: `buildRelease` retains its frozen install and adds the literal copyfile backend. The new test invokes the real CLI deploy, obtains a fresh release from the seed commit and compares installed and vendored package inodes. Its failure before the product change and success afterward prove the required outcome. Existing-release reuse remains excluded as designed. `deployStage` still classifies this command's failure as `install`.
- F2, criteria 2 and 3: both init-akrogon setup proposals and all five other documented install sites have the flag. npm, pnpm and yarn mappings and every existing frozen-lockfile choice are preserved. Read the changed behavior's release documentation, installation guide, settings/checks references, affected skills and reference index. Their command descriptions agree with the implementation. No AREA.md or index changed, and no new path pointer was introduced.
- F3, criterion 4: all three fixture seed installs add only the backend flag. Akrogon's own CLI `install` calls are unchanged. The fixture suites pass after the final fixture change. Consumer configuration and opaque config-wrap test strings remain outside the diff as required.

Install-site trace, read back through `akrogon log`:
`check review-b-install-sites: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-review-b-install-sites-1793129583464-264523.log`.

## Verification evidence

Read each cited implementation log through `akrogon log`.

- Criterion 1 red-first proof: `bun test tests/release-deploy.test.ts --timeout=30000 -t "private copies"` failed at the inode inequality, with `Expected: not 2571407864`, before the product change.
  `check criterion-1-private-copy-red: 1 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-criterion-1-private-copy-red-1793129098342-4086037.log`.
- The same proof passed on the final head, after the final fixture edit.
  `check criterion-1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-criterion-1-green-1793129409832-4150278.log`.
- Planned prose and fixture inspections agree with the diff.
  `check criteria-2-3-grep: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-criteria-2-3-grep-1793129420655-4152464.log`.
  `check criterion-4-grep: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-criterion-4-grep-1793129420654-4152466.log`.
- The resolved changed-tests command in the plan's implementation notes ran after U3: `bun test tests/release-deploy.test.ts tests/install.test.ts tests/self-update.test.ts --timeout=30000`, 57 pass, 0 fail.
  `check changed-tests-u3: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-changed-tests-u3-1793129386197-4120567.log`.

Confirmed receipt `1dc2b511-3685-450f-9184-766362cfd208` directly in the registered repo's verify records: exact reviewed head, leaf scope, setup exit 0, completed 2026-10-27T19:31:34.291Z. Its configured commands and logs are:

- `bunx prettier --check src tests skills/chart-issues/scripts`: exit 0, `implementation/check-format-1793129427255-4152839.log`.
- `bun test --timeout=30000 --parallel=4 --no-isolate`: exit 0, 1228 pass, 0 fail across 70 files, `implementation/check-test-1793129491729-4152839.log`. This full-suite log includes the new private-copy test passing.
- `bun run typecheck`: exit 0, `implementation/check-typecheck-1793129494290-4152839.log`.

Receipt inspection, read back through `akrogon log`:
`check review-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-review-b-receipt-1793129620347-266294.log`.

No test, helper, fixture, runner configuration or lockfile changed after these final proofs. No planned test was skipped, disabled or newly filtered. The targeted `-t` is the planned criterion proof and is also covered by the unfiltered required suite. No proof-command correction was needed. Reused current evidence without rerunning checks, as required by the review skill. No known-red disposition is needed.

## Test-Change trailers

Enumerated all trailers in `2cd0ec17e7179055ef1fcc3a255cb0734fb41f9d..HEAD` and checked the changed-file rule in `src/test-files.ts`.

`7fb2f43999a59222d30c5ad1609d0c553a5538e1`:

```text
Test-Change: tests/release-deploy.test.ts added one criterion-1 case comparing the installed and vendored tiny package.json inodes; no existing expectation changed
```

Accepted: brief criterion 1 explicitly requires this fail-first case. Existing expectations are unchanged.

`174394dd971a43416872bbc1c8e803180bbbdffd`:

```text
Test-Change: tests/deploy-fixture.ts brief criterion 4: the seed install passes --backend=copyfile; no assertion changed
Test-Change: tests/install.test.ts brief criterion 4: the selfUpdateFixture seed install passes --backend=copyfile; no assertion changed
Test-Change: tests/self-update.test.ts brief criterion 4: the seed install passes --backend=copyfile; no assertion changed
```

Accepted: brief criterion 4 names exactly these install changes. No old assertion, fixture expectation or recorded output is changed or deleted. All four changed existing test paths have citations.

Trailer inventory, read back through `akrogon log`:
`check review-b-git: 0 /home/ivan/Work/infra/akrogon/issues/open/bun-copyfile/copyfile-installs/implementation/check-review-b-git-1793129559404-263597.log`.

No reusable Nit or lesson was identified. Request merge with verdict ready.
