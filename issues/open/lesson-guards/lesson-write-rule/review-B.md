# Review B: lesson-write-rule

Date: 2026-10-10
Phase: check.review (initial, blind)
Base: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`
Reviewed head: `135add67d57516ad69a19713a057768b44d00d81`
Verdict: **fix**

## Findings

1. **F1 — Acceptance decisions were given the answers.** Source: the actual sa-3 and sa-4 case-run inputs, recorded in the implementation report's linked session transcripts. Both prompts instruct the agent to read the cases fully and compare against their Expected lines. Each read result includes Expected and Reason, and case-2 additionally includes the exact predicted broken-variant verdict (`append-case`). The shipped-run transcript explicitly says it will follow the expected case-4 format. Consequently the reported 5/5 and deliberate-break result cannot establish that the rule alone determines the decisions. This violates criterion 5 (rule, references and recorded evidence only), plan D8's non-vacuous proof, and the Interfaces requirement to hide the declared classification from the decider. Repair: keep expectations, classification reasons and variant predictions outside decider inputs, run independent fresh decisions on the shipped and broken rules, compare afterward, and replace the contaminated proof in the report. Preserve the original evidence and expected outcomes, not the answer-bearing input format.

2. **F2 — Fixed-pattern definition is duplicated.** Source: `skills/lesson-rule.md:6`, consumed by every changed writing skill, repeats “a command could detect as a fixed pattern” as the eligibility predicate, while `skills/learn-issues/SKILL.md` already defines that predicate. The adjacent reference does not remove the copied definition. Two definition sites remain today, violating criterion 1's explicit single-definition outcome and plan D2's “referenced ... never copied” requirement. Repair: refer specifically to the first clause of Checkable for eligibility, retaining the explicit choice to leave running-guard coverage to charting. Do not copy the predicate or import the full Checkable definition's coverage condition.

3. **F3 — Root-missing outcome has no acceptance proof.** Source: criterion 4's explicitly named missing-akrogon-root scenario. Case-4 assumes the root resolves, and the report's Known limitations confirms that `local+notice` is not exercised, while Unverified criteria says None. The case runs and docs-link checks therefore cannot detect a failure to preserve the local lesson or produce the notice when root discovery fails. This is a missing scenario proof under criterion 4, not a request for an extra prose assertion. Repair: exercise that environment variant through an evidence-only fresh decision, verify the local write plus visible notice outcome without posting, and record the result accurately. Keep expected decisions hidden as in F1.

## Verification

Read brief, plan, design, implementation report, reference index, affected skill/guide surfaces, referenced learn-issues and seed-issue contracts, installer and install guide, docs-link tests, and `src/test-files.ts`. Debate is off, so missing positions-B/rebuttal-B artifacts are expected. No peer review was read.

Inspected the entire base-to-head diff and both commits. Worktree was clean before and after verification. The changes stay within the planned files. Home routing and matched/new lesson mechanics otherwise match the design. Both check.review recordings share the paragraph's lesson-rule reference through “the same way”, and check.repair has its own reference.

Fresh verification: `bun test tests/docs-links.test.ts` completed with 4 pass, 0 fail, 9 assertions. The shared rule's two outbound links were checked against disk and both exist. Reused A's recorded full-suite result (647 pass, 0 fail), typecheck result, changed-test result and format result rather than rerunning without a related concern. No production code changed. Format's reverted pre-existing `src/status.ts` drift is outside this diff.

The changed behavior's operator page is `docs/guide/learn.md`; it links the rule and names matching, seed filing, home routing and backlog triage. `docs/guide/cheat.md` scopes learn-issues to backlog triage. Relative links in edited guides and skills resolve under the checked resolver.

AREA live listing, one command from repository root: all named `skills/`, `src/`, `tests/` and `docs/` file pointers exist, including the new `skills/lesson-rule.md`. The listing reports repository-relative `scripts/observe.ts` and `scripts/log-tail.ts` absent. Both are unchanged shorthand references and the actual files exist at `skills/watch-issues/scripts/observe.ts` and `skills/watch-issues/scripts/log-tail.ts`, confirmed by the skill inventory. No dead-pointer defect introduced by this leaf was established.

Installed skills are directory symlinks back to the checkout. Reviewed the installer and installation documentation for the new sibling resource. No installer change is required by the current symlink layout.

Acceptance transcript evidence: session directory `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-lesson-write-rule--/`, files `2026-10-10T08-57-40-286Z_01a12508-40be-762e-933e-eaee769608e0.jsonl` (sa-3) and `2026-10-10T08-58-16-505Z_01a12508-ce39-762e-933e-eaf08fcf5182.jsonl` (sa-4). Both contain five case read results with Expected lines, including case-2's Variant behavior hint. This is recorded-run evidence, not a hypothetical adversarial case.

## Test-Change trailers

Range: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5..135add67d57516ad69a19713a057768b44d00d81`.

Commit `e8ceb2ae1667f3d50d334bc2db0096ebf831f4db`:

`Test-Change: tests/docs-links.test.ts added write-site link assertion; no existing expectation changed`

The file matches `src/test-files.ts`. The diff adds one structural test and changes no existing assertions, fixtures or recorded outputs. New tests need no cited source, so this trailer is acceptable. Commit `135add67d57516ad69a19713a057768b44d00d81` has no Test-Change trailer and changes only guide prose.

## Disposition

Request check.repair. F1 and F3 require new acceptance runs and therefore belong to A under the repair skill's required-live-run handoff rule. F2 is a bounded documentation repair. No operator-only action, live filing or reusable Nit was identified. No code or commit was changed during this review.

## check.repair — 2026-10-10

Starting head: `135add67d57516ad69a19713a057768b44d00d81`.
Repaired head: `2d9becac4365ec4a1079853364d561d90e356b5e`.

**F2 repaired** in commit `2d9beca` (`docs: reference the shared checkable definition for lesson seeds`). Before: Seed restated “a lesson whose mechanism a command could detect as a fixed pattern” and then referenced Checkable. After: Seed refers to “a lesson meeting the first clause of the Checkable definition” through the existing learn-issues link. The rule explicitly covers new and matched lessons. Report-link dedupe, judgment exclusion and charting's responsibility for running-guard coverage are preserved. `learn-issues/SKILL.md` is untouched. This documentation Fix has its own commit, with no test edits or Test-Change trailer required.

Criterion 1: fresh `rg -n 'same failure cause|shared keywords|Checkable|a command could detect' skills docs` shows the copied fixed-pattern predicate is gone from the lesson rule. It remains defined in learn-issues. The seed-issue shared-keyword hit remains its pre-existing report-dedupe contract. Structural link tests pass.

Criteria 2 and 3: manual rule inspection confirms matching appends without a new line, uncertain/keyword-only matches create a line, and new/matched eligible lessons invoke seed only without an existing report link. Independent case proof is pending F1, so the earlier contaminated runs are not reused as acceptance evidence.

Criterion 4: resolved-root Home behavior and visible local fallback remain in the rule; decision proof of the missing-root variant is pending F3.

Criterion 5: pending F1. No acceptance agent was run by B and no gh posting was performed.

Criterion 6: unchanged guide paragraphs still link the rule and describe the three outcomes and backlog triage. Both shared-rule outbound link files exist. `bun test tests/docs-links.test.ts`: 4 pass, 0 fail. `bun test --changed=1d7d536100aebc183bd22f63b7c3ba31d5d07ea5 --timeout=30000`: 4 pass, 0 fail. `bun run typecheck`: no diagnostics. `bun run format`: exit 0, with only unrelated pre-existing src/status.ts formatting drift, inspected and restored to the starting content. No unrelated diff remains.

### Handed to A

- **F1:** required fresh acceptance runs with answer-free inputs, including the broken variant. check.repair excludes required live runs from B's repairs. A owns the planned case proof and report updates.
- **F3:** required missing-root acceptance run and report correction. Same required-live-run handoff rule. Keep expected outcomes outside the decider's input.

No operator actions or reusable Nits remain. Plan/design and case artifacts were not edited. Request check.fix after the full-suite check completes.

Full configured check: `bun test --timeout=30000` completed with exit 0, 647 pass, 0 fail, 7041 assertions across 33 files in 52.58s. No merge_checks were run. Final repair diff contains only skills/lesson-rule.md and the worktree is clean. F1 and F3 remain handed to A.

## check.review re-check — 2026-10-10

Prior reviewed head: `135add67d57516ad69a19713a057768b44d00d81`.
Repaired/reviewed head: `2d9becac4365ec4a1079853364d561d90e356b5e`.
Verdict: **ready**.

Scope: only the repair diff plus A's replacement acceptance artifacts. The branch repair is B's one-line Seed-clause change in `2d9beca`; A changed leaf artifacts only. Worktree is clean. No repair-introduced defect was found.

- **F1 closed:** checked the actual sa-5 and sa-6 prompts, tool calls, read results and final answers. Both fresh agents read only the rule, its two references and the six named answer-free cases, apart from sa-6's read-only temporary-path discovery after its first variant lookup failed. Neither read `expected-verdicts.md`, the plan, design or earlier reviews. No gh calls, seed invocation or writes occurred. Expected/Reason/Variant answer lines are absent from the case reads. The captured shipped rule exactly matches repaired HEAD; the captured variant changes only Match to count shared keywords. The shipped run decides the original five cases correctly and the variant changes case 2 to `append-case`, demonstrating the intended failure independently of the private expectations. Final answers contain per-case reasons and the report identifies the agents and results.
- **F2 closed:** repaired Seed eligibility references the first clause of Checkable without restating its definition. New/matched applicability is explicit, and guard-coverage assessment remains with charting. No definition or excluded skill was changed.
- **F3 closed:** answer-free case 6 declares `command -v akrogon` empty, no discoverable root, no matching line and no linked report. The shipped decider returns `new-line | local+notice | seed-stops`, explicitly describing local framework LESSONS.md/history preservation, visible notice and the seed-owner lookup stopping before posting. This covers criterion 4's missing-root outcome. The report removes the former unexercised limitation and records the result. The broken variant also preserves local+notice and seed-stops. Its omitted new-line token does not change the local write decision, and is not a defect in the shipped rule.

Acceptance evidence: `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-lesson-write-rule--/2026-10-10T09-04-59-825Z_01a1250e-f5b1-762e-933e-eaf3d433a1db.jsonl` (sa-5, shipped) and `2026-10-10T09-04-59-831Z_01a1250e-f5b7-762e-933e-eaf4edf9181a.jsonl` in the same directory (sa-6, variant). Agent model/effort: devin/swe-2-max, high, as recorded in the report. Compared actual decisions to the private expectations after inspecting the decider inputs. Six shipped outcomes match, and the required variant failure is present.

Checks reused from B's repair at this identical HEAD: full `bun test --timeout=30000` exit 0, 647 pass/0 fail; changed tests 4 pass/0 fail; explicit docs-link tests 4 pass/0 fail; typecheck clean; format exit 0 with unrelated baseline formatting restored. A also records fresh link/changed/typecheck/format checks and no branch change. No new code change, missing check evidence or specific test concern warrants another rerun. No merge_checks ran.

Repair-range Test-Change trailers: none. The only commit changes `skills/lesson-rule.md`, which does not match the `src/test-files.ts` test path rule, so none is required. The original test trailer remains accepted by the initial review.

No remaining Fix, held reusable Nit or operator action. Request merge.

## merge — 2026-10-10

Attempt: `8213c05d-03ef-4d13-8743-e1fda92464ae`, applied top `2d9becac4365ec4a1079853364d561d90e356b5e`. Refreshed AKROGON_BASE from config: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`; origin/main. Batch state lists no carried members and HEAD equals its recorded top. No fetch, rebase or commit performed.

Merge check set: all four configured checks; merge_covers, merge_checks and advisory empty. Format exit 0 (log `implementation/merge-format.log`), with the same unrelated pre-existing src/status.ts formatting change inspected and restored. Typecheck exit 0. Configured changed-test command with AKROGON_BASE: exit 0, 4 pass/0 fail. Worktree is clean after restoring formatter-only drift. Full-suite result pending below.

Completion-owner inventory: this batch contains only lesson-write-rule. Its enclosing lesson-guards epic also contains guard-retires-lesson at plan.synthesis, blocked on this leaf, so no issue/epic completion owner is expected to close. Read that sibling's brief/state and confirmed the command's completeOwner contract. Broadcast only if the completion command actually prints a completion line.

Full suite `bun test --timeout=30000`: exit 0, 647 pass, 0 fail, 7041 assertions, 33 files, 52.85s. Log: `implementation/merge-test.log`. All configured merge-pass checks green at recorded top.

`akrogon phase lesson-write-rule merged --slot B --check --attempt 8213c05d-03ef-4d13-8743-e1fda92464ae`: `ok`. Publication call with the same attempt completed exit 0: `moved merged`. No issue complete or epic complete line was printed, so no broadcast was required.
