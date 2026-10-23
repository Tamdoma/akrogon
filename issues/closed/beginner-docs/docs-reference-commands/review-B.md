# Review B

Base: `0680fda60062a72354f09c08a6c8f5ebe3fd00bd`.
Reviewed head: `94fe74fb3a7b4f59600e12fc1fb057fc0de48b38`.
Verdict: **fix**.

Initial blind review. Debate is off, so no positions-B.md or rebuttal-B.md was produced. No peer review was read. The worktree was clean and remained unchanged.

## F1. Fix: timing arguments are required, but the new reference marks them optional

Location: `docs/reference/commands.md:41`, with the incorrect expectation in `tests/command-reference.test.ts:29`.

Realistic source: a reader uses the new command lookup page. Its introduction explicitly defines square brackets as optional, and the timing row wraps all three alternatives in square brackets. Following that syntax permits the reader to run `akrogon timing` with no arguments.

Consequence today: that invocation exits 1 with `Usage: akrogon timing <slug> | --cohort --since <iso> | --flow --since <YYYY-MM-DD>`. The local dispatcher requires exactly one slug when neither report mode is selected (`src/akrogon.ts:176-184`). The page therefore documents an invocation the command rejects. This violates brief criterion 6 and the argument accuracy required by plan D4.

Evidence: `akrogon run-check --name b-timing-local -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile" && bun src/akrogon.ts timing'` produced:

`check b-timing-local: 1 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-timing-local-1792767018299-1491196.log`

Read back with `akrogon log`. Setup succeeded and the local dispatcher issued the usage refusal above. This is an expected reproduction of a documentation defect, not an unrelated failing configured check, so the no-cause retry rule does not apply.

Repair: remove the optional wrapper from the timing alternatives and correct the matching timing contract in the command-reference test. The test currently passes while enforcing the false contract, as confirmed by the saved final command-reference run. Cite the live dispatcher and this real reader action as the source for changing that expectation. An existing test expectation correction belongs to A under the check.repair exceptions.

## Page and diff review

- Commands: compared the 27 rows with `src/akrogon.ts` and the relevant handlers, including install, init, preflight, next, close, sync, stop, park, verify, log and stop-run. F1 is the accuracy defect found. The dispatcher remains unchanged.
- Skills: checked all ten skill directories against their SKILL.md files, including operator-only invocations, execution seats versus chart consultants, direct routing, command-owned landing, broadcast ownership, watcher lifetime and lesson triage. The shared lesson rule is correctly named separately.
- Settings: checked machine and repo keys/defaults, home resolution, whole-seat nearest-wins lookup and front matter against `src/config.ts`, with toolkit setup in `src/init.ts` and direct repair rounds in chart-issues. Both embedded picture meaning and alt text agree with the seat lookup.
- Checks: checked scopes, setup, receipts and tree reuse, known-red matching, test citations/frozen drift, guard refusals, environment refusals and log remedies against `src/verify.ts`, `src/config.ts`, `src/phase.ts`, `src/test-files.ts`, `src/guard.ts`, `src/run-check.ts`, `src/evidence.ts` and `src/flaky.ts`. Agent proof rules are linked to their skills. The verification picture and alt text match the described outcomes.
- Owned pages contain no dates or retired surfaces and do not link into docs/guide. Old guide pages and their incoming links stay in place as required by this leaf's architecture. The reference index and page map were checked for ownership and link boundaries.
- Docs tests recursively discover docs Markdown. Markdown images and quoted HTML img sources cover the forms used. The HEAD lookup resolves sparse-excluded issue pointers, and missing targets in both disk and HEAD still fail. Source/skill/AREA scans and runtime retirement tests are unchanged.
- The two removed guide wording checks and their reads match design fact-ownership Q2 and brief criterion 5. Their deletion reason is recorded. No prose wording checks were added.

## Test-Change trailers

Listed from base..HEAD and judged against the cited source:

1. `d7dbe076` — `tests/command-reference.test.ts`: design fact-ownership Q2 authorizes moving the table check and deleting the two guide wording checks. Accepted for that change. F1 identifies the inherited expectation that still needs correction.
2. `d7dbe076` — `tests/docs-links.test.ts`: design fact-ownership Q2 authorizes recursive docs/image coverage. No prior assertion was weakened. Accepted.
3. `d7dbe076` — `tests/run-permit.test.ts`: design fact-ownership Q4 authorizes recursive docs coverage while retaining the src scan. Accepted.
4. `a9bb2913` — `tests/AREA.md`: plan D12 authorizes the descriptions update. It matches the `tests` segment rule in `src/test-files.ts`. Accepted.

Commit inventory evidence, read back with `akrogon log`:

`check b-review-context: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-review-context-1792766924011-1485090.log`

## Verification evidence

All saved logs cited below were read with `akrogon log`. The implementation's configured checks ran on the reviewed head after the last test/helper change. No planned check was skipped or disabled. No full-suite rerun was needed for this unchanged diff.

Receipt inspection:

`check b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-receipt-1792767055037-1492966.log`

It confirms completed leaf receipt `0ecbb0d8-ba83-4605-a5c1-d913f4cc8af4` on the reviewed head, setup 0, and all three current configured commands exit 0:

- Setup: `implementation/check-setup-1792766696807-1011558.log`.
- Format: `implementation/check-format-1792766698861-1011558.log`, all matched files formatted.
- Test: `implementation/check-test-1792766860960-1011558.log`, 1114 pass, 0 fail, 66 files.
- Typecheck: `implementation/check-typecheck-1792766863396-1011558.log`, `tsc --noEmit` green.

Criterion evidence from the plan/report, paths relative to this leaf:

- C1: `check c1-commands-final: 0 implementation/check-c1-commands-final-1792766692255-1010822.log`, 4 tests pass. `check c1-break-sync-row: 1 implementation/check-c1-break-sync-row-1792766520795-798868.log` shows the missing sync row rejected.
- C3: `check c3-links-final: 0 implementation/check-c3-links-final-1792766692349-1010936.log`, 8 tests pass. `check c3-break: 1 implementation/check-c3-break-1792766200443-544310.log` explicitly reports a nested broken link, Markdown image, HTML img and missing issues target. This functional deliberate break proves image coverage independently of the separate t2-img-break log, whose error is a ReferenceError.
- C4: `check c4-retired-final: 0 implementation/check-c4-retired-final-1792766692475-1011034.log`. `check c4-break-run-permit: 1 implementation/check-c4-break-run-permit-1792766200558-544382.log` and `check c4-break-hold: 1 implementation/check-c4-break-hold-1792766200674-544459.log` explicitly identify the nested page and forbidden text.
- C5: `check c5-no-guide-final: 0 implementation/check-c5-no-guide-final-1792766692569-1011122.log`, consistent with inspection of the removed reads.
- C2/C6: manual source comparison above. F1 prevents full acceptance.

For the changed `tests/AREA.md`, one command listed all backtick paths containing a slash from the repository root:

`check b-area-listing: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-area-listing-1792767018160-1491138.log`

All named source/test/docs/skill targets exist. The missing issues config and attempts records are excluded by this worktree's sparse checkout and live under the registered root. `/var/tmp/akr-<uid>` and `direct/` are descriptive runtime paths, not dead source pointers. No AREA pointer Fix.

## Operator actions

None. No external grant or live mutation was needed.

## Nits

None held. No new reusable lesson identified.

## check.repair — 2026-10-23

Read both initial reviews for head `94fe74fb3a7b4f59600e12fc1fb057fc0de48b38`. A has no Fixes. B's F1 is the only Fix. No operator actions are open.

The worktree is clean and HEAD is unchanged. Context evidence was read back with `akrogon log`:

`check b-repair-context: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-repair-context-1792767175830-1500492.log`

No Fix was repaired and no commit was created. F1 requires changing an existing test expectation, an explicit exception to B's repair authority. Changing the documentation alone would leave the command-reference test red, so the coupled correction is handed to A together. No code, test, proof command or proof input changed. Prior green verification evidence remains applicable and was not rerun for this handoff.

### Handed to A

- F1: correct the timing invocation in `docs/reference/commands.md:41` and the matching `contracts.timing` expectation in `tests/command-reference.test.ts:29`. Exception: check-issue check.repair reserves "any correction of a test expectation" for A. The source is the no-argument reader invocation rejected by `src/akrogon.ts:176-184`, with the saved local reproduction in the initial review. Cite that source in the test-change trailer, rerun the affected criterion proofs and `akrogon verify`, and record current results in the implementation report.

## Re-check after check.fix — 2026-10-23

Verdict: **ready**. F1 is resolved. No new Fixes, Nits or operator actions.

Prior reviewed base/head: `0680fda60062a72354f09c08a6c8f5ebe3fd00bd` / `94fe74fb3a7b4f59600e12fc1fb057fc0de48b38`.
Handed-off base/head: `6bb7a45803eaabc52ddcf4649bb4db8a53488082` / `40902d8399dc88612da71a678f43038db90e1286`.

Computed `git range-diff 0680fda60062a72354f09c08a6c8f5ebe3fd00bd..94fe74fb3a7b4f59600e12fc1fb057fc0de48b38 6bb7a45803eaabc52ddcf4649bb4db8a53488082..40902d8399dc88612da71a678f43038db90e1286`. All eight original commits are unchanged by the refresh. Only `fc5eeee17fcfb3e70d870031983c89eff1b6a2a9` and `40902d8399dc88612da71a678f43038db90e1286` were added. Reviewed those two commits, not main's intervening work. The worktree is clean at the handed-off head.

`check b-recheck-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-recheck-diff-1792767445191-1951581.log`

Read back with `akrogon log`. The repair changes exactly the timing argument contract and its documentation row. The page now requires one of the three alternatives, matching `src/akrogon.ts:176-184`. No runtime behavior changed. No AREA file changed in the repair.

### Test-Change judgment

The new trailer on `fc5eeee1` names `tests/command-reference.test.ts`, cites the dispatcher rejecting bare `akrogon timing`, and cites F1 and B's actual reproduction. Accepted: this corrects a demonstrably false expectation, without removing a regression check. Earlier trailers remain accepted as recorded above because their commits are unchanged in range-diff.

### Proof and receipt

Read all following logs with `akrogon log`, relative to this leaf:

- `check f1-red: 1 implementation/check-f1-red-1792767225106-1504718.log`: corrected expectation rejects the old optional timing row, showing `optional: true` versus required `false`.
- `check f1-green: 0 implementation/check-f1-green-1792767225209-1504787.log`: corrected row passes all four command-reference tests.
- `check fix-c1: 0 implementation/check-fix-c1-1792767232389-1505275.log`: current command-reference proof, four tests pass.
- `check fix-c3: 0 implementation/check-fix-c3-1792767232498-1505338.log`: recursive links/image proof, eight tests pass.
- `check fix-c4: 0 implementation/check-fix-c4-1792767232629-1505402.log`: both planned docs retirement scans pass with the planned filter.
- `check fix-c5: 0 implementation/check-fix-c5-1792767232720-1505487.log`: removed guide reads stay absent.
- `check fix-c6-dates: 0 implementation/check-fix-c6-dates-1792767232819-1505559.log`: recorded scan green; the repaired row also contains no date by inspection.

Current proof runs follow the latest test and documentation changes. The red/green pair exercises the specific optional-versus-required defect. The report records the refresh, both bases/heads and the current criterion runs. No runner configuration or helper was changed, skipped or disabled.

`check b-recheck-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-reference-commands/implementation/check-b-recheck-receipt-1792767455499-1953165.log`

Read back with `akrogon log`. Completed receipt `8b19ff72-06e3-435f-95aa-e2411a565554` covers handed-off head `40902d8399dc88612da71a678f43038db90e1286`, leaf scope, setup 0 and all current configured checks 0. Their logs were also read:

- `implementation/check-setup-1792767237157-1505779.log`: install succeeded.
- `implementation/check-format-1792767239317-1505779.log`: formatting green.
- `implementation/check-test-1792767402547-1505779.log`: 1114 pass, 0 fail across 66 files.
- `implementation/check-typecheck-1792767404750-1505779.log`: typecheck green.

No rerun needed: current complete evidence covers the unchanged handed-off head. No reusable Nit is held and no new reusable lesson was identified. All prior blocking findings are closed. Ready for merge.
