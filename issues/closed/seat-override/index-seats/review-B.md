# Review B: index-seats

Date: 2026-10-07
Phase: check.review
Base: 2645d97ed1682185eea4788844f882a541885d24
Reviewed head: 372a06e391455920fe6fa8d91ba5ab1702a92a10
Verdict: fix

## Fixes

### F1: Both issue seats suppress malformed epic validation

- Location: `src/config.ts:117`, the early break in `indexSlots`.
- Source and contract: brief done-criterion 2 explicitly requires malformed index front matter to make next, status and managed-worktree config exit non-zero. The operator can set both seats in a child ISSUE.md and edit the ancestor EPIC.md. Plan D2 and the design require reading the issue and epic indexes, with precedence per seat.
- Consequence today: a valid child ISSUE.md containing both seats stops the index scan before EPIC.md is parsed. Malformed epic front matter is silently accepted. Validation changes depending on whether the child overrides one or two seats, although the epic remains an ancestor index.
- Trace: `statusCommand` calls `seats(global, repo, leaf.path)` → `indexSlots` constructs ISSUE.md then EPIC.md → both issue seats populate `found` → line 117 breaks before `indexSeats(EPIC.md)`. The same resolver is called by next before allocation and by effectiveConfig for a managed worktree.
- Verification: ran an isolated CLI fixture through `tests/helpers.ts`, with a depth-3 leaf `epic/issue/shadowed`. EPIC.md contained `---\nslots: [\n---\n# Epic\n`. ISSUE.md contained valid full `slots.a` and `slots.b` using the fixture's fake harness. `status shadowed` returned code 0 and empty stderr. Keeping the same epic and removing only `slots.b` from the child made the command return code 1, naming EPIC.md and `YAML Parse error: Unexpected token`. Fixture cleanup completed in `finally`.
- Required repair: parse every applicable existing ancestor index while preserving the nearest seat selection. Remove the early termination and add a regression at the CLI boundary for malformed EPIC.md beneath a child overriding both seats. Existing malformed-index tests exercise only an ISSUE.md, so they do not catch this criterion-2 failure.

## Verification and scope

- Read brief, plan, design, implementation report, skill and ponytail guidance before inspecting the full eight-file diff. Debate is disabled, so positions-B.md and rebuttal-B.md are absent as expected. No peer review was read.
- Followed changed behavior through config, next allocation/launch, status scanning/detail and state inventory. Read the reference index, src area and guide setup, cheat and files pages. No AREA.md changed. Guide examples and precedence are present in both required pages and agree with effective seat selection.
- The report records blocking checks at this exact head: format and typecheck clean, full tests 529 pass / 0 fail, changed tests 422 pass / 0 fail. It also records deliberate-break evidence for config validation, launch argv and status output. Reused that evidence rather than repeating completed checks. The focused F1 probe addresses the specific uncovered criterion scenario.
- Live `bun src/akrogon.ts status` returned code 0 and listed the current repository's open leaves without an index marker. Live `bun src/akrogon.ts status index-seats` returned code 0 and printed both next-start seats and their machine config source paths. Closed leaves are read by the overview inventory. No Missing lines appeared.
- Effective config tests cover managed worktree root/subdirectory, registered root, unrelated linked worktree and outside a repository. Resolver and dispatch tests cover independent fallback, issue/epic precedence, standalone and closed indexes, schema failures and pre-allocation refusal.
- Status detail places seat YAML after history and prints a/b directly rather than the plan's proposed outer seats key. The brief's observable requirement is satisfied: both seats and sources appear after state with a next-start label. No concrete defect follows from this formatting difference.
- Worktree was clean before and after review. No code changed and no commits were made.

## Test-Change trailers

The path rule in `src/test-files.ts` matches all three modified test files. Inspected every trailer in `2645d97ed1682185eea4788844f882a541885d24..HEAD` against its diff:

| Commit | Trailer | Judgment |
| --- | --- | --- |
| aa5fa6e | `tests/config.test.ts new cases added for index seats, malformed indexes and managed-worktree config; no existing expectation changed` | Additions exercise brief criteria 2, 3 and 5. Existing assertions remain intact. |
| a38ba80 | `tests/config.test.ts two failure cases added for missing slots key; no existing expectation changed` | Additions enforce the design's required slots key. |
| 7abd4bc | `tests/next.test.ts adds seat-index dispatch and malformed-index refusal cases; no existing expectations changed.` | Additions exercise criteria 1 and 2. |
| 4be9e4e | `tests/status.test.ts new cases only; no existing expectation changed` | Additions exercise criteria 2, 4 and 5. |
| 372a06e | `tests/next.test.ts prettier quote normalization only; no expectation changed` | Quote normalization preserves string values and assertions. |

## Nits

None.

## Operator actions

None.

## 2026-10-08 check.repair

Read both initial reviews for head 372a06e391455920fe6fa8d91ba5ab1702a92a10. F1 was the only Fix. A recorded no Fixes. Repaired F1 without changing plan, design or unrelated code.

- Test commit: `71b51014fa73ab85755a748f78c36ae89f7c78c2`. Added a status CLI regression using the recorded depth-3 scenario, valid issue overrides for both seats and malformed epic front matter. Assertions cover non-zero detail exit with the epic path and overview exit 1 with that path. Includes the required Test-Change trailer. No existing assertion changed.
- Fail-before command: `bun test tests/status.test.ts --test-name-pattern='status rejects malformed epic' --timeout=30000`. Exit 1, 0 pass / 1 fail. At tests/status.test.ts:876, `expect(detail.code).not.toBe(0)` failed because the actual code was 0.
- Fix commit: `7312487ac82dab4c30fd2cb61bb997f8aee52ff4`. Removed the one early-break line in indexSlots. Every applicable existing index is now parsed, while the existing nearest-seat assignment keeps issue precedence intact.
- Pass-after: the exact same focused command exited 0, 1 pass / 0 fail, 4 assertions. Both detail and overview reject the malformed epic and identify its path.

### Criterion proofs and blocking checks

| Criterion | Completed evidence |
| --- | --- |
| 1 | Full suite passed the next CLI argv tests for epic, issue precedence, standalone issue and per-seat fallback. |
| 2 | Full suite passed resolver and next/status/config malformed-input tests and the new F1 CLI regression. Next tests retain pre-allocation assertions. |
| 3 | Full suite passed managed-worktree config root/subdirectory, registered root, unrelated linked worktree and outside-repo cases. |
| 4 | Full suite passed detail effective seats/source and overview index marker tests. Live detail printed both next-start seats with their sources. |
| 5 | Full suite passed no-front-matter cases. Live `bun src/akrogon.ts status` and `bun src/akrogon.ts status index-seats` both exited 0 with no Missing lines. The overview reads open and closed inventory. |
| 6 | Both guide pages retain their reviewed front matter examples and resolution order, unchanged by repair. docs-links passed in the full suite. All blocking checks below passed. |

| Check | Result |
| --- | --- |
| `bun run format` | Exit 0, every file unchanged. |
| `bun run typecheck` | Exit 0. |
| `bun test --timeout=30000` | Exit 0, 530 pass / 0 fail, 24 files, 26.59s. |
| `bun test --changed=2645d97ed1682185eea4788844f882a541885d24 --timeout=30000` | Exit 0, 423 pass / 0 fail, 12 files, 21.94s. AKROGON_BASE set to the recorded base. |

Repair head: 7312487ac82dab4c30fd2cb61bb997f8aee52ff4. Saved diff is limited to the regression test and one deleted resolver line. Worktree clean. Fixture cleanup ran on the failing and passing tests. No merge checks run, no operator actions open, no Fixes handed to A, and no reusable Nits held by B.

## 2026-10-08 merge

Attempt: 3acfbde0-8612-4c7e-ae0a-77f76c6b3c5d.
Applied top and tested HEAD: 1c3a1ca08e1039f0061be4b7cae6826c5226a81e.
Refreshed AKROGON_BASE / built-on origin/main: ef813b49a425ab8851bdb3cafc40faf621dd10e1.
Prior reviewed repair head: 7312487ac82dab4c30fd2cb61bb997f8aee52ff4.

The command applied the holder's eight commits onto the refreshed base. Batch members are empty. HEAD matches the supplied top. No commits, fetch or rebase performed by the merge seat. Worktree remains clean.

| Check on applied top | Result |
| --- | --- |
| `bun run format` | Exit 0, all files unchanged. |
| `bun test --timeout=30000` | Exit 0, 533 pass / 0 fail, 25 files, 25.88s. |
| `bun run typecheck` | Exit 0. |
| `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` | Exit 0, 426 pass / 0 fail, 13 files, 21.59s, using the refreshed base above. |

Configured merge_checks and advisory lists are empty. Live `bun src/akrogon.ts status index-seats` exited 0 with no Missing lines and printed both next-start seats with their sources. No open operator actions.

Completion-owner assessment: the standalone seat-override issue still has door-seat-capture at plan.synthesis. This memberless batch cannot complete an issue or epic, so no completion-owner broadcast is expected.

`akrogon phase index-seats merged --slot B --check --attempt 3acfbde0-8612-4c7e-ae0a-77f76c6b3c5d` exited 0 with `ok`, accepting the recorded top and test-change trailers. The subsequent publishing call under the same attempt exited 0 with `moved merged`. It printed no issue/epic completion lines, so no broadcast was invoked.

Read-back: `git ls-remote origin refs/heads/main` returned 1c3a1ca08e1039f0061be4b7cae6826c5226a81e. Authoritative state records `phase: merged`; worktree is clean.
