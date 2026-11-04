# Review B: signposts-step

Date: 2026-11-04. Phase: check.review. Verdict: **fix**.

Base / target (`origin/main`): `19998b35d786dd01181a730e47cb1ca56d17b06e`.
Reviewed head: `d6bb6429495080f6574d7c7ce665f95e9d54a62c`.

Initial blind review of the whole diff against the brief, design, plan and implementation report. No peer review read or peer contacted. No code edits or commits.

## Fixes

### F1: The planning guide still places the map before the signposts questions

Location: `docs/use/plan-work.md:38`, under `Read the territory map`.

The new `Set the signposts` section says the door's first questions are the signposts, and line 44 says that round runs before any map. Between them, the retained map paragraph says: “Before asking anything, the door shows a map of the ground”.

Realistic source: an operator following the linked Plan work guide when opening `/chart-issues`, the exact workflow this page teaches. The page now gives incompatible instructions about what comes first. Following its map paragraph puts the map before the direction-setting answers that should steer it. This breaks brief criterion 8's requirement that the pages describe one procedure, and contradicts criterion 1's ordering.

Scope the map paragraph to the subsequent fork questions, preserving signposts → map → fork rounds → handoff. This is a documentation correction within the locked design, not a request for a prose-string test.

Trace, read back with `akrogon log`:

`check review-b-doc-order-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-review-b-doc-order-evidence-1793751710359-368025.log`

## Verification

- `akrogon verify` reused current green receipt `e7a8efb1-93e5-44c3-b658-a1c3ac1ee0f0`, tree `1ae1feac801f31c28e60b6d34ddf84073dfa89bf`, for the reviewed head. Setup, format, typecheck and test all exited 0. Receipt inspection: `check review-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-review-b-receipt-1793751679029-366388.log`, read back with `akrogon log`.
- Read the receipt's format, typecheck and test logs with `akrogon log`. The configured test command is `bun test --timeout=30000 --parallel=4 --no-isolate`: 1309 pass, 0 fail across 75 files. Log: `implementation/check-test-1793751536836-47171.log`. Also read the report's separate planned configured test run, `implementation/check-test-1793751463279-3928520.log`, with the same passing totals. No test, helper, fixture or runner configuration changed in the diff, and no planned test was skipped, filtered or disabled.
- Read the current recorded status probe with `akrogon log`: `check signposts-probe: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-signposts-probe-1793751544823-357821.log`. The real command showed `1/2` with a reply under `## Taken` and `0/2` without. Traced this to `src/status.ts`'s unchanged `chartRow`. The throwaway chart is absent, checked by `review-b-doc-order-evidence`.
- Read the reported green structural and owned-file logs. The structural check ran after the final recorded checker corrections and product commit. Its prose anchors are not accepted as behavioral proof: design signposts-rules 14 and check-issue reject prose-string tests. Criteria 1–8 were judged by reading the actual procedure and record shape, with F1 preventing criterion 8 from passing. The permitted `## Taken` shape check and real status probe support criterion 6. No such prose test is delivered on the branch.
- The reported checker adjustments strengthen the signposts-block match and account for fenced headings. They change the temporary check's implementation, not the planned invocation or observed product boundary. No configured runner command was replaced, no case was removed, and no proof-command correction under plan.synthesis is recorded or needed for the passing configured checks.

## Scope, docs and Test-Change trailers

The diff contains exactly the eight planned skill/doc files. `src/`, `tests/`, `issues/`, runner configuration and lessons are unchanged. No `AREA.md` changed, so no changed-area path listing is required. Read the affected user pages, skill references, reference index and linked skills area, including the two pictures the plan deliberately leaves unchanged. The pictures describe the per-chart exchange and routes. The documentation ordering defect is F1.

`origin/main..HEAD` contains one commit, `d6bb6429495080f6574d7c7ce665f95e9d54a62c`. **Test-Change trailers: none.** None of its changed paths matches `src/test-files.ts`, so no trailer is required and no existing expectation changed. Evidence, read back with `akrogon log`:

`check review-b-trailers: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-review-b-trailers-1793751727955-368704.log`

No additional Nits or operator actions. No external operation, grant use, dependency-using ad-hoc proof, or secret access was needed.

## 2026-11-04 check.repair

Read both initial reviews and the current brief, design, plan and implementation report. A has no Fixes. B's F1 is the only Fix, and it is repaired in `9ee76bf68893076a541de83626390e65d07bc2bf` (`docs: show territory map before fork rounds`). This commit changes one sentence in `docs/use/plan-work.md` and no other file.

Before: “Before asking anything, the door shows a map of the ground”. After: “Before the fork rounds, the door shows a map of the ground”. The guide now says signposts first, then the map, then fork rounds and handoff. Re-read the complete guide as plan D8's judgment proof of criterion 8. No test was added for prose wording, and no locked decision or test expectation changed.

Commit and before/after evidence, read back with `akrogon log`:

`check repair-b-f1-commit: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-repair-b-f1-commit-1793751847574-375110.log`

Reran A's unchanged planned structural checker on the committed repair, extracted verbatim from the plan appendix into a `mktemp` directory and removed by an EXIT trap. Only the temporary script location changed. The configured locked dependency setup ran first. Result: all assertions pass. As in the initial review, its prose anchors are supplemental and do not establish semantic correctness. The correction is accepted by the plan's reading proof and the configured checks at the merge move, not by those anchors.

`check repair-b-planned-structure: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-repair-b-planned-structure-1793751862686-376644.log`

Reran the underlying planned diff-scope observation (`git diff --name-only <base>...HEAD`): the branch still changes exactly the eight owned files, with `src/`, `tests/` and `issues/` untouched. Working tree clean. No Test-Change trailer is required for the documentation-only repair. The unchanged criterion-6 status probe remains valid because neither its record shape nor its command inputs changed.

`check repair-b-scope-and-doc: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-repair-b-scope-and-doc-1793751887265-377769.log`

No Fixes handed to A, no operator actions, and no B Nits held. A's N1–N3 remain deferred under its recorded reasons and are not expanded into this repair. Matched the reusable F1 mechanism to the existing stale-rule-in-docs lesson and appended this case to the registered checkout's `learnings/history/2026-09-11-stale-rule-in-docs.md`, leaving it for the operator to commit. No duplicate active lesson line or new issue.

All doable Fixes are repaired. The first merge transition refused the missing current-head receipt, without changing phase: `check repair-b-merge: 1 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-repair-b-merge-1793751929973-379272.log`, read back with `akrogon log`. Ran `akrogon verify` on the repair commit before retrying the transition. It completed `verify leaf 9ee76bf68893076a541de83626390e65d07bc2bf: green`:

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-format-1793751939546-379699.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-typecheck-1793751942167-379699.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/signposts/signposts-step/implementation/check-test-1793752013459-379699.log` — 1309 pass, 0 fail, 75 files.

These are the planned configured commands, with no skipped or filtered tests and no merge_checks. The current reading proof and verification pass accept F1's repair. Ready for the merge transition.
