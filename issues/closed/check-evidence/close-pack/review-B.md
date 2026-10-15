# Review B: close-pack

Verdict: fix

Base: `38d7a95722540ea3da8a9de1913d8d88431b4091`
Reviewed head: `b1d54645b783fe0fe9940076d67b84580609a3d9`
Reviewed tree: `26008e57c980f25b634fca6877759cedc0d0d366`

Initial blind review. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read. No code or tests were changed.

## Fixes

### F1. Owner-root holders bypass both refusal checks

Location: `src/run-check.ts:162-164`.

Real source: the supported CLI action `akrogon run-check --holder issues/closed/<owner> -- <command>`, or `--holder issues/open/<owner>` while that owner holds `.closing`. `leafTarget` accepts the explicit holder as the publish directory without adding a member segment. `ownerRefusal` passes that directory to the log-member resolver. `locate` returns null for an owner root because it has no member (`src/evidence.ts:46-47`), and the new guard treats null as unrestricted. Both the early and late checks therefore allow it.

Observed consequence: commands execute and new plain logs are published inside a closing owner and inside the closed store. This violates brief criterion 5's pre-command refusal and the closed-owner no-plain-log contract. The late check has the same bypass, so it cannot protect this supported holder target during completion either.

Proof: `check review-B-owner-holder: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-review-B-owner-holder-1792101584565-2883199.log`. This is a diagnostic command, whose zero status means the observations were captured, not that the refusal criterion passed. Read back with the worktree's `bun src/akrogon.ts log <path>`.

The probe uses the existing `fixture`, `leaf`, and `cli` helpers after the configured locked setup. It creates an open owner with `.closing` and a closed owner, then invokes the real CLI with each owner root as `--holder` and `touch <marker>` as its command. Both observations report `exit: 0`, `commandRan: true`, and a new `check-owner-root-*.log` inside the forbidden directory. Fixtures are cleaned in `finally`.

Repair: resolve the directory's containing owner even when the directory is the owner root, retaining the explicit chart-direct allowance. Add a reproduction at this CLI boundary for both closed and closing owner-root holders. The resolver's log-member contract itself need not change.

## Verification

The current tree has a completed green `akrogon verify` receipt, `647b141a-7064-468f-8f2c-53b0a00638d8`, on `5d6e4dc0d6f77df3af692e08268db2550c55610f`. Its tree matches the reviewed head. The report names a different receipt ID, but the authoritative receipt proves the checks and this clerical mismatch does not block separately.

- `check format: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-format-1792101390198-1843648.log`
- `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-test-1792101496642-1843648.log` — 879 pass, 0 fail, including the eight close-pack cases.
- `check typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-typecheck-1792101498465-1843648.log`

All three logs were read through the worktree log command. This run follows the last changes to the tests, helpers, fixtures and implementation in the reviewed range. No planned check was filtered, skipped or disabled. No redundant full-suite run was needed. The existing criterion-5 case uses leaf implementation directories and misses F1's owner-root holder.

The implemented archive union, conflict refusal before writes, symlink refusal before packing, two read-back stages before deletion, marker lifetime around the rename, sync exclusions and init ignores agree with the other criteria. The tests exercise their stated outcomes. The held chart-direct disagreement is not an extra acceptance criterion.

Inspection evidence:

- `check review-B-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-review-B-diff-1792101547371-2646088.log`
- `check review-B-context: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-review-B-context-1792101552118-2661708.log`
- `check review-B-trailer-sources: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-review-B-trailer-sources-1792101596404-2949418.log`
- `check review-B-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-review-B-evidence-1792101596218-2948366.log`

## Documentation and area paths

Read `docs/reference-index.md` and the changed behavior pages `docs/guide/files.md`, `docs/guide/merge.md`, and `docs/guide/setup.md`. Their packing and refusal claims match the intended contract, with the refusal implementation defect recorded as F1.

Both changed AREA.md files were listed in one command from the repository root: `check review-B-area-list: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-review-B-area-list-1792101574066-2843460.log`, read back through the log command. All source, test, skill and index pointers exist. The sparse worktree lacks `issues/` and its runtime records (`timings.jsonl`, `verify-runs.jsonl`, `merge-attempts.jsonl`, `config.yaml`, and `closed/`). The registered-root listing in review-B-evidence confirms all exist there, as the guide specifies. No dead-pointer defect.

## Test-Change trailers in base..HEAD

Judged against `src/test-files.ts` and the actual diffs, in commit order:

1. `bb1fcde`, `tests/init.test.ts`: “criterion 8 of the close-pack brief: akrogon init must append the three log ignore lines, so the .gitignore assertions grow to expect them.” Accepted against criterion 8.
2. `bb1fcde`, `tests/AREA.md`: “plan.md docs list: pending one-line key-files entry for tests/close-pack.test.ts.” No AREA.md diff in this commit. No expectation change to justify.
3. `5b5f1ce`, `tests/close-pack.test.ts`: “worker mismatches u1/u2 on real behavior: notes.txt moved to the owner root the rename preserves, logPaths needs onlyFiles:false to list symlinks (Bun 1.4.3), Buffer.compare replaces toEqual on Uint8Array (TS2769), racer needs its own owner so closed/issue from the earlier merge cannot collide, and the kept report is read from fixture AKROGON_HOME rather than process globalHome.” Accepted after inspecting the actual changes. The notes-path assertion was still wrong in this intermediate commit and is corrected by 035c34f. Symlink listing, byte comparison, distinct owner and fixture-home read preserve the intended outcomes.
4. `0ceea3d`, `tests/AREA.md`: “plan.md docs list: adds one Key-files line for tests/close-pack.test.ts; area doc update required by the plan, no test logic changed.” Accepted against the plan's documentation checklist.
5. `035c34f`, `tests/close-pack.test.ts`: “worker mismatches on real behavior: notes.txt stays under its leaf folder through the rename, closer's owner is removed after the early-refusal case so a herdr-less next pass is green, and the kept assertion reads the report file written under fixture AKROGON_HOME.” Accepted. The actual diff corrects the notes path, removes the unrelated open-owner dispatch vehicle after its refusal assertions, and binds next's result to a variable. The fixture-home read was already changed in 5b5f1ce.
6. `f2bd0e7`, `tests/leaf-slices.test.ts`: “close-pack criterion 5 makes run-check refuse a target under issues/closed; the concurrency vehicle moves to a merge-phase leaf under issues/open, keeping the same admission-during-stop race and quiet sweep.” Accepted against criterion 5. The race synchronization and slice-protection assertions remain.
7. `b1d5464`, `tests/close-pack.test.ts`: “formatting only, no expectation changed; prettier drift flagged by the format check on the same head.” Accepted. Formatting only.

## Nits and operator actions

None. No lesson removal is present in the diff. No reusable Nit is held.

## check.repair — 2026-10-16

Repair starts at reviewed head `b1d54645b783fe0fe9940076d67b84580609a3d9`. Both initial review files were read. Findings below use A-F1 and B-F1 to distinguish the two reviews' F1 labels.

### A-F1 repaired: closed namesakes no longer block open targets

Reproduction commit: `c0a8df6`. Fix commit: `4fa5a54`.

The CLI reproduction creates an open leaf and a closed owner with the same owner name. Its run-check must execute and publish normally. Before the fix it fails with `owner closed`. The fix derives the target's owner path from the resolver's relative member, and refuses a target in the closed store by its actual state rather than the presence of a different closed namesake. The late missing-open check applies to targets originally under open, preserving parked targets. Both admission and publication use the same corrected function.

Command for both runs, after the configured flocked setup: `bun test tests/close-pack.test.ts -t "run-check accepts an open owner with a closed namesake"`.

- `check repair-A-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-A-F1-red-1792101787896-3451469.log`
- `check repair-A-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-A-F1-green-1792101801915-3482114.log`

### B-F1 repaired: owner-root holders reach the refusal guard

Reproduction commit: `3b80847`. Fix commit: `e9b60dd`.

The CLI reproduction covers closed and closing owner-root holders before execution, then a real `akrogon phase root-racer merged` while an owner-root holder's command runs. It checks that publication is refused, the open owner is not recreated, and captured output survives the next reconcile.

The fix resolves a prospective `out.log` under the target directory through `locate`, rather than passing a directory to a log-member API. This supplies a member for owner-root holders and chart-direct roots without changing the resolver contract. Chart-direct targets remain allowed. Owner-path derivation includes the same prospective member, so A-F1's target-state classification also handles roots correctly.

Command for both runs, after the configured flocked setup: `bun test tests/close-pack.test.ts -t "run-check refuses owner-root holders before running and after completion"`.

- `check repair-B-F1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-B-F1-red-1792101817023-3515365.log`
- `check repair-B-F1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-B-F1-green-1792101825601-3536181.log`

Each reproduction was committed before its fix. Both test commits carry `Test-Change: tests/close-pack.test.ts` trailers citing the relevant finding and its CLI source. No existing expectation was corrected or removed. Both red and green logs were read back through the worktree's log command.

### Planned proof and scope

`check repair-close-pack-proof: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-close-pack-proof-1792101842709-3572910.log` — the planned `bun test tests/close-pack.test.ts` command, after configured flocked setup, passes all 10 tests on `e9b60dd`, including all eight original criterion proofs written by A. The log was read back. No proof input changed after this run.

Only `src/run-check.ts` and the two reproduction tests changed. Review-A's Nits remain outside the repair requests. B holds no reusable Nit. There are no operator actions or items handed to A. No live grant or external fixture is required. Test fixtures clean up in `finally`; no iteration helpers were created.

### Final verification

Repaired head: `e9b60dd2f0c7aaaa9d7cbedc27e2a4f65af9526f`. Tree: `bd7c86dc08df3c507cf70ecc86be2738d765a4f7`.

`akrogon verify` is green on this committed head, receipt `c9678030-3f78-4209-bc93-d7926f2b7ca6`, with setup 0 and all configured checks passing. No merge checks ran.

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-format-1792101847214-3581683.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-test-1792101983508-3581683.log` — 881 pass, 0 fail across 53 files.
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-typecheck-1792101986127-3581683.log`

All three logs were read back through the worktree log command. `check repair-B-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-B-receipt-1792101993621-108781.log` records the authoritative receipt, also read back. `check repair-B-saved-state: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-repair-B-saved-state-1792101993747-109071.log` confirms the saved repair artifact, committed head, clean worktree and clean whitespace diff.

Both Fixes are repaired. Ready for merge.

## merge — 2026-10-16

Solo attempt: `3e4d74e2-47f5-406f-b70f-53bd797ee057`.

Prior reviewed base: `38d7a95722540ea3da8a9de1913d8d88431b4091`. Prior repaired head: `e9b60dd2f0c7aaaa9d7cbedc27e2a4f65af9526f`. Fetched and rebased onto `origin/main` at `9800d9ef91b721d53511717c9b94f32423ed44a5`. Resolved head: `870fbe52fac9b59d09730e1f1d5143fbd5ee1506`.

The sole rebase conflict was `src/AREA.md`: kept main's expanded reconcile entry and this leaf's pack entry. Both source paths and the reference index exist. No test expectation changed.

- `check merge-B-rebase: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-merge-B-rebase-1792102032189-291577.log` records the index conflict.
- `check merge-B-rebase-continue: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-merge-B-rebase-continue-1792102043153-342527.log` records successful completion.
- `check merge-B-range-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-merge-B-range-diff-1792102051065-390680.log` records `git range-diff 38d7a95722540ea3da8a9de1913d8d88431b4091..e9b60dd2f0c7aaaa9d7cbedc27e2a4f65af9526f origin/main..HEAD`. All 13 commits match except the retained main reconcile context in the AREA.md resolution.
- `check merge-B-retired-lessons: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-merge-B-retired-lessons-1792102050876-388717.log` runs the installed helper's prescribed re-removal command and reports `none`.

`akrogon verify --attempt 3e4d74e2-47f5-406f-b70f-53bd797ee057` is green on `870fbe52fac9b59d09730e1f1d5143fbd5ee1506`, merge receipt `468bae0f-0180-4d9c-b2c7-744d47027736`:

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-format-1792102066219-495839.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-test-1792102185531-495839.log` — 890 pass, 0 fail across 53 files.
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-typecheck-1792102187415-495839.log`

All cited merge logs were read back through the worktree log command. `merged --check --attempt 3e4d74e2-47f5-406f-b70f-53bd797ee057` returned `ok`, accepting the receipt and trailers. No advisory failures.

Completion-owner context was gathered in `check merge-B-owner-briefs: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/close-pack/implementation/check-merge-B-owner-briefs-1792102073841-585455.log`: all four check-evidence briefs and leaf phases. Folder-pack remains unfinished, so close-pack alone does not complete the owner.

Final `akrogon phase close-pack merged --slot B --attempt 3e4d74e2-47f5-406f-b70f-53bd797ee057` succeeded: `moved merged`, `deployed 9800d9ef91b7..870fbe52fac9`. No `issue complete` or `epic complete` line was printed, so no completion broadcast applies.
