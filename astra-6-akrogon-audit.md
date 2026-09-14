# Akrogon process audit

**Author:** Astra 6  
**Date:** 14 September 2026  
**Deliverable:** `astra-6-akrogon-audit.md`  
**Scope:** charting, handoff, lifecycle, skills, command ownership and Herdr coupling. Report only; no repository files were changed.

## 1. Summary

1. Remove cross-slot stand-in: it reduces machinery and prevents a recorded “B” review from being carried out in A’s existing session. **F1**.
2. Use the execution plan as the whole-leaf implementation contract; retain scoped worker briefs and one completed evidence record. **F2**.
3. Remove the framework’s separately named parity/contracts checks already contained in its `test` command. Keep their executions through the existing test paths. **F3**.
4. The biggest demonstrated hole is loss of review independence during fallback, not a shortage of review phases. **F1**.
5. Keep the second initial reviewer: the two logical verdicts disagree about whether repair is required on 20 of 132 first review cycles. **§4**.
6. Keep B’s chart challenge and contract review: the saved exchange contains concrete scope, ordering and verification corrections. **§3**.
7. Do not infer billing, worker sessions or pure model runtime from phase-transition logs. **§4.1**.
8. Several questions in the supplied prompt describe rules already removed; do not reintroduce them to make their removal auditable. **§7**.

## Evidence boundary and reading key

This audit uses the pushed GitHub snapshots below, not the uncommitted state of `/home/ivan`, live Herdr panes, or the local shell history.

| Key | Repository | Audited commit |
|---|---|---|
| A | `Tamdoma/akrogon` | `0147d10483aa22dd3ae1d4ca5d71c00b0a12730a` |
| W | `Tamdoma/tamdoma-framework` | `e52b2876bf3c6f714b440253c10861fed2b7ae15` |
| P | `Tamdoma/pi-extensions` | `25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd` |

Evidence links are pinned to those commits. Numeric line ranges identify source lines. Links explicitly naming a whole document or section start at line 1; their labels identify the relevant section rather than inventing a narrower range.

The measured cohort comprises **all 683 records in the three fetched `issues/log.jsonl` snapshots**, covering 132 distinct repository/slug pairs. It is not a census of every archived leaf or legacy issue report. The logs were read in line-bounded ranges; the reported fields were transcribed into a compact local projection and calculated with Python. This is not a byte-for-byte downloaded archive. The original logs remain the evidence of record: [A:issues/log.jsonl:1–181][alog]; [W:issues/log.jsonl:1–484][wlog]; [P:issues/log.jsonl:1–18][plog].

The close reading covers all 17 operator-guide pages, the README, routing, the lifecycle skills and their referenced protocols, dispatch/transition/state/log machinery, the Herdr plugin, all three current repository configurations, a complete small chart and leaf, all saved files in the larger `batch-skills` leaf, the larger chart’s six saved slot-exchange files, Akrogon’s active lessons and ten linked histories, and selected earlier skill versions. The large chart’s 144 KB intake was not read end to end; the complete small chart supplies the requested full chart walkthrough. No live worktree contents were read.

**Evidence gaps:** local shell invocation counts, agent transcripts, token and monetary usage, and exact human wait times are not present in the reviewed material. A full state-file census was not performed for A or W: declared `debate`, `sources`, dependencies and `hand_built` frequencies below are explicitly sampled, while the four P states matching its log cohort were all read. The report does not label a missing archive record as proof that an action never occurred.

The audit ranks changes by the supplied order: simplicity, clarity, elegance, function, cost, speed. “Retain” means the demonstrated function survives; it does not claim that a cheaper alternative was experimentally disproved.

## 2. Findings, ordered by value

### F1. Drop automatic substitution of the peer pane for a failed logical slot

**Claim.** The third-attempt stand-in rule conflicts with the requirement for independent initial reviews. It can send a logical B prompt into A’s already-running session without removing A’s prior review context.

**Evidence.** `seatFor` changes physical seats after two attempts. `dispatchSlot` starts a new harness only when the selected pane has no agent, then prompts that pane with the original logical slot. The operation changes a role label, not the session’s knowledge. [A:src/next.ts:208–214][next-seat]; [A:src/next.ts:382–468][next-dispatch].

The framework’s `batch-skills` log records B’s review completion with attempts `A=1, B=3`, using the session previously associated with A. Its B repair completion also records that session with `B=3`; A then re-checks. The initial bodies of `review-A.md` and `review-B.md` are identical apart from their titles, and `implementation/brief-fix1.md` explicitly describes the two reviews as identical. These are observations of an actual fallback path, not a hypothetical third attempt. [W:issues/log.jsonl:70–73][batch-fallback]; [W:batch-skills — initial review and appended repair review][batchrevA]; [W:batch-skills — initial review][batchrevB]; [W:batch-skills — repair brief; identifies the reviews as identical][batchfix]. The logger records the invoking Herdr pane’s session when available, not an independently authenticated logical reviewer identity. [A:src/log.ts:8–33][log].

**Proposal.** Remove the peer-seat substitution. Retry a logical slot only in its own seat; after the existing attempt limit, fail visibly and let the operator repair or restart that seat. Do not add a second fallback, a fresh-session mode, or a “review independence” prose check.

**Removes.** `seatFor`’s cross-seat rule, the unknown-status shortcut that jumps to the peer, and the operator’s need to distinguish logical B from physical A during recovery.

**Keeps.** Two slots, independent initial work, the existing attempt limit, startup/prompt error classification, re-prompt grace, and an explicit failed outcome.

**What breaks.** A broken B harness can no longer be rescued unattended by A’s healthy pane. That is a real loss of availability. It is preferable to silently substituting self-review for the required independent review.

**Changed-process walkthrough.** `batch-skills` would not accept the third B review in A’s session at log line 70. It would stop for B-seat recovery; the independent B review would still be outstanding. B’s repair would likewise not move into A’s existing review session, preserving the purpose of the subsequent A re-check.

**Criteria served.** Simplicity and clarity first; independence is preserved. No speed gain is claimed, and the recovery path can be slower.

**Rule verdict.** **DROP** stand-in pane after repeated attempts. **KEEP** two-slot review, attempt exhaustion, re-prompt grace and operator recovery.

### F2. Merge the execution plan and the second whole-leaf implementation contract

**Claim.** Akrogon requires B to rewrite an execution contract that B has just synthesized. This duplicates acceptance criteria, read-first paths and ordered work without creating an independent check.

**Evidence.** The plan skill produces the settled execution plan; implementation then requires `implementation/brief.md` from an eight-section template even in inline execution. [A:plan-issue/SKILL.md — phase instructions][plan-skill]; [A:implement-issue/SKILL.md — implementation and repair][impl-skill]; [A:implement-issue/brief-template.md — eight-section template][template]. In `status-empty-open-fix`, the 5,298-byte plan and 5,311-byte implementation brief repeat the same decisions, expanded criteria and small two-file change. The implementation brief’s useful new material is the completion evidence. [A:status-empty-open-fix — execution plan, D1–D3 and C1–C7][smallplan]; [A:status-empty-open-fix — repeated execution contract and completed report][smallimpl].

The plan itself is not redundant: it checks the live code and corrects the inherited claim that the missing-directory case still throws. Its decisions separate the existing guard from the actual empty-board presentation fix. [A:status-empty-open-fix — execution plan, D1–D3 and C1–C7][smallplan].

**Proposal.** Keep `plan.md` as the whole-leaf execution contract. Put any implementation-only constraint missing from that contract there once before execution, then retain one completed implementation evidence record. Write a separate worker brief only when delegating a bounded subset whose scope differs from the whole leaf. Do not delete the operator brief or the locked design.

**Removes.** The mandatory second whole-leaf contract and the requirement to restate its criteria, interfaces and ordered steps. Checker and merger read the plan plus completion evidence instead of two versions of the same instruction.

**Keeps.** Original intent, binding decisions, plan grounding, scoped worker boundaries, mismatch returns, tests and actual completion evidence. Worker reports remain subordinate to B’s verified leaf-level result.

**What breaks.** A consumer that expects all execution instructions at `implementation/brief.md` needs its read path updated once. A worker receiving only a scoped brief still needs all binding facts relevant to its scope. The change must not replace those facts with an unexplained pointer.

**Changed-process walkthrough.** For `status-empty-open-fix`, keep the plan’s D1–D3 and C1–C7, implement the same two files, retain the red/green test results, CLI artifact and committed head, and run the same two reviews and merge. Omit the second 5,311-byte contract as a separate document; preserve its report content in the single completion record. That byte count is an observed document size, not a measured token or time saving. [A:status-empty-open-fix — repeated execution contract and completed report][smallimpl]; [A:status-empty-open-fix — live CLI artifact][smallcli]; [A:status-empty-open-fix — initial review and merge evidence][smallreviewa]; [A:status-empty-open-fix — initial review][smallreviewb].

**Criteria served.** Fewer files and fewer competing descriptions; lower authoring/read cost follows without a new mode.

**Rule verdict.** **MERGE** whole-leaf implementation contract into the plan. **KEEP** scoped worker briefs, the report’s substance, original brief and design. **DROP** mandatory whole-leaf restatement, not planning.

### F3. Remove exact duplicate blocking-check definitions in the framework configuration

**Claim.** The framework names parity and contracts as independent checks and also runs both through `test`. They are repeated again through the worker-oriented `test_changed` command.

**Evidence.** W’s current configuration contains `parity: bun run hooks:parity`, `contracts: bun run contracts:verify`, `test: bun run hooks:parity && bun run contracts:verify`, and the same pair prefixed by the required-base guard in `test_changed`; `selftest` is a separate check. The merge skill instructs A to run every checks command after rebasing. [W:issues/config.yaml:1–19][wconfig]; [A:skills/merge-issue/SKILL.md:23–47][merge].

**Proposal.** Delete the separate `parity` and `contracts` entries. Keep `test`, `test_changed` and `selftest` unchanged. Do not add command-string deduplication, a result cache or a new check-selection flag.

**Removes.** Two redundant configuration entries and their extra executions when the full named check list is followed.

**Keeps.** Both actual commands, their failure semantics through the `&&` chain, the changed-test base guard, worker verification and the additional selftest. This proposal does not merge worker-time verification with post-integration verification.

**What breaks.** Separate labels disappear from the configuration/status presentation; the underlying failing command still produces its own output. Repeated invocations would only provide extra value as an intentional repeatability test, and the configuration does not express such a test.

**Changed-process walkthrough.** At `browser-core-launch`’s post-rebase verification, run the same parity, contracts and selftest coverage using the retained entries. Do not run parity and contracts an additional time merely because each also has its own key. The later rebase still requires a new verification run because the integration target changed. [W:browser-core-launch/review-A.md][browserreview].

**Criteria served.** Simplicity and elegance, followed by lower command cost. No historical duration saving is asserted: the transition log does not record individual check executions.

**Rule verdict.** **DROP** the two separately named duplicates. **KEEP** full/changed verification purposes, selftest and re-verification after integration changes.

### F4. Restrict worker writes, not the investigation needed to validate an interface

**Claim.** Some saved worker briefs turn “read-first” into a hard read ceiling. That conflicts with the workflow’s instruction to check live contracts and return an evidence-backed mismatch.

**Evidence.** `batch-skills` sub-briefs 1a and 1b forbid reads outside their lists. Sub-brief 2a says not to read whole files and explains that whole-file reads exhausted prior workers. The later initial reviews find that seven of eight producer paths do not emit the assignment key consumed by the generator, and six of eight do not emit the unit type consumed by the injector. The synthesized plan had asserted that the producer contract was satisfied. [W:batch-skills — restricted read-first sub-brief][batch1a]; [W:batch-skills — nine-skill sub-brief][batch1b]; [W:batch-skills — grep-only sub-brief and worker-exhaustion explanation][batch2a]; [W:batch-skills — synthesis D1–D12 and Interfaces][batchplan]; [W:batch-skills — initial review and appended repair review][batchrevA].

This does not establish that a read ban alone caused the defects. It establishes a documented conflict between the imposed investigation boundary and the verification the leaf actually needed.

**Proposal.** Remove blanket “only these reads” and “never read a whole file” bans from worker briefs. Keep prioritized read-first lists, bounded write ownership and mismatch escalation. A necessary producer/consumer read does not grant permission to edit that surface.

**Removes.** Special-case read prohibitions that make an agent choose between following the brief and investigating a suspected contract error.

**Keeps.** Sequential workers, bounded changes, targeted reads by default, evidence-backed mismatch returns and the prohibition on silently widening scope.

**What breaks.** A worker can spend more context investigating a genuinely relevant surface. Do not claim unrestricted exploration is free; the brief still directs it to a bounded task and an initial read set.

**Changed-process walkthrough.** In the nine-skill batch sub-brief, a worker encountering an uncertain `unit_type` follows the named producer path and reports the missing emitted field before treating the map as implemented. In the mechanical parent-edit sub-brief, a necessary surrounding read can expose a surviving dispatch instruction. B can revise the scoped brief instead of waiting for review to discover the mismatch. The audit does not claim every later fix would have been prevented.

**Criteria served.** Clarity and function with fewer exceptions. Context savings are not the justification.

**Rule verdict.** **DROP** hard read ceilings. **KEEP** read-first priorities, write boundaries and mismatch escalation.

### F5. Give operational commands and recovery rules one maintained reference

**Claim.** The narrative guide repeats executable procedures that no longer match the command. This is an operational ambiguity, not a wording preference.

**Evidence.** The files guide says `sync` stages everything in the checkout. The implementation rejects already-staged paths outside eligible issue records and stages only the designated issue paths, excluding seeds, lock files and worktrees. [A:docs/guide/files.html:59–63][guide-files]; [A:src/sync.ts:6–34][sync-guard]; [A:src/sync.ts:6–138][sync]. The existing stale-rule lesson records the same class of drift: a review rule changed in the skill while the guide retained the previous rule. [A:learnings/history/2026-09-11-stale-rule-in-docs.md][l-docs].

**Proposal.** Keep the guide’s operator story and diagrams. Put the normative command invocation, scope and recovery contract in one command reference; have the guide point there instead of maintaining a second procedural specification. Correct the already-stale sync statement as part of that consolidation. Do not introduce a prose-matching test.

**Removes.** Independently maintained copies of operational rules, not the whole guide.

**Keeps.** Conceptual teaching, examples, and a place where the operator can learn what to do next. Skills retain agent-specific instructions rather than being forced to load an entire operator manual.

**What breaks.** A guide page is no longer self-contained for every detailed command option. One deliberate reference is preferable to two contradictory instructions.

**Changed-process walkthrough.** The operator following the `status-empty-open-fix` re-intake and sync trail would reach the selective-issue commit contract, not an instruction implying unrelated code is swept into the issue sync. The same recorded issue history remains; only the duplicated operational description disappears. [A:status-empty-open-fix — intake, parking, deletion and re-intake][smallintake].

**Criteria served.** Clarity, one mechanism per concern, and less repeated maintenance.

**Rule verdict.** **MERGE** duplicated normative command/recovery descriptions. **KEEP** the operator guide and skill-local execution context. **DROP** stale copies, not useful explanations.

### F6. Let a small operator question be small

**Claim.** The mandatory full round template preserves presentation elements even when they add no decision information.

**Evidence.** The current question reference expressly says the opening paragraph, context sentences, recommendation, pitfalls, reply key and challenge check are never cut, even for a small item. The small missing-open chart records one choice and a verbatim `1-A` answer, with no remaining material fog. [A:skills/chart-issues/assets/questions.md:25–27][question-full]; [A:status-empty-open/forks/missing-open-is-zero.md — taken fork][smallfork]; [A:status-empty-open-fix — chart and handoff][smallchart].

**Proposal.** Retain the substantive contract: what is being decided, the inspected evidence, a recommendation with its reason, material alternatives or risks, and the operator’s actual answer. Permit those facts to fit in a short question. Do not require a second paragraph saying that no additional challenge exists.

**Removes.** Mandatory empty or repetitive presentation sections on small rounds. No size flag or separate “quick chart” path is needed.

**Keeps.** One material decision at a time, informed consent, genuine disagreement, verbatim answers, and the rule that omission or silence does not settle a question.

**What breaks.** A rigid renderer expecting every label would need to change; no such renderer was established in the reviewed command. A shorter question is unacceptable when it conceals a real alternative or prerequisite.

**Changed-process walkthrough.** The small status chart can ask whether a missing open directory should be treated as an empty board while preserving errors for an invalid existing directory, explain the recommendation and record `1-A`. It still writes the same taken fork and hands off the same contract; it does not need empty challenge/pitfall prose to do so.

**Criteria served.** Simplicity, clarity and function over format, with lower operator reading cost.

**Rule verdict.** **DROP** invariant full-round presentation. **KEEP** all decision-bearing content and explicit operator resolution.

### F7. Share the identical Ponytail source without adding a common-context loader

**Claim.** The two Ponytail files have no distinct ownership or content: they are identical sources serving the same concern.

**Evidence.** Both files have Git blob `bc3595d1a07cff2b135139cadfa4c17ec412667b`. The installer links the complete skill directories from this checkout into the configured harness skill roots. [A:skills/implement-issue/ponytail.md:1–34][ponytail-i]; [A:skills/check-issue/ponytail.md:1–34][ponytail-c]; [A:src/install.ts:9–25][install].

**Proposal.** Keep one canonical Ponytail file and make the other local path a relative symlink to it. Preserve the existing read instruction in each skill. Do not turn the four shared context lines into a new runtime context-loading system.

**Removes.** One independently editable copy; the same number of existing skill-local read paths can remain.

**Keeps.** Identical advice delivered to implementer and checker through their installed skill paths.

**What breaks.** Copying just the checker directory outside this checkout would require carrying the symlink target as well. The audited installer already installs the complete checkout-backed set, but standalone redistribution of only that directory must not be assumed to remain self-contained.

**Changed-process walkthrough.** The `status-empty-open-fix` implementer and checkers load identical text from their existing Ponytail paths. No plan, check, verdict, or file in the completed leaf changes; later edits cannot drift between two sources.

**Criteria served.** One source per concern. This is a maintenance simplification, not a measurable runtime saving.

**Rule verdict.** **MERGE** the duplicated Ponytail source. **KEEP** the short shared context lines inside each independently loaded skill.

## 3. Keep as is: functions with evidence behind them

### Paired initial review and A-only repair review

Keep the second initial reviewer. The exact and blocking agreement figures are different: a ready/nits difference is not a disagreement about whether work can merge. The measured blocking disagreements, and the historical review-by-reading failure, show why deleting the second perspective is not a function-preserving simplification. Do not treat the contaminated `batch-skills` pair as a controlled test of independent reviewers. [A:src/routing.ts:26–40][routing]; [A:learnings/history/2026-09-10-review-by-reading.md][l-review]. Counts are in §4, not repeated here.

Keep A-only re-check after a B repair, but preserve the role separation that gives that rule meaning. Its scope should remain the repair and repair-introduced defects, rather than a completely new acceptance contract. [A:skills/check-issue/SKILL.md:21–51][check].

### B’s chart work: a demonstrated correction, not a ceremonial second opinion

The saved large-chart exchange contains eight tree findings. The retained proposal includes a dependency on the flag-removal leaf before opening the new dispatch lane, moves the smoke-dispatch criterion to a leaf that can exercise it, identifies the sibling test-exemption ordering, gives asynchronous completion verification a fixture, includes the overlooked inline check in teardown, and resolves conflicting document ownership. It also retains a challenged dependency with an explicit reason rather than deleting it automatically. [W:skill-lane-rebuild — B’s eight handoff findings][treeb]; [W:skill-lane-rebuild — revised handoff tree][treea].

The map exchange also exposes fallibility on both sides: B incorrectly claimed the skill flag was already removed; A corrected the baseline and B explicitly admitted its `grep -L` error. Keep the blind opening map and the evidence-based merge of findings. A second map is not a second authority. [W:skill-lane-rebuild — independent map A][mapa]; [W:skill-lane-rebuild — independent map B][mapb]; [W:skill-lane-rebuild — merged map and corrected baseline][mapmerged]; [W:skill-lane-rebuild — B’s correction and scope disagreement][mapreb].

### Self-contained leaf design and the brief/design distinction

Keep an original brief stating the outcome and a design carrying binding decisions. A worker reading a scoped brief must receive the relevant locks; a reference into a moved chart is not automatically equivalent. `batch-skills`’ design contains the operator’s narrower/wider decisions and their resolution; the plan/rebuttal needed them to resolve the “audits 3” ambiguity. [W:batch-skills — binding decisions][batchdesign]; [W:batch-skills — disagreements resolved from evidence][batchrebB]. F2 removes a later duplicated execution contract, not the original outcome/design distinction.

Do not replace all verbatim decision copies with a shared mutable chart pointer. That would remove duplication by adding a location, version and loading dependency. The observed contracts already show why a fresh implementer needs the actual binding content.

### State authority, clean worktrees and code-only leaf branches

Keep command-owned moves, verdict aggregation and counters. Keep the clean-worktree and no-`issues/`-diff gates. The uncommitted-handoff history describes loss of work after a phase transition; these gates address a real failure. They are not mere prose conventions. [A:src/phase.ts:96–140][phase-transition]; [A:src/phase.ts:142–174][phase-clean]; [A:learnings/history/2026-09-11-uncommitted-handoff.md][l-uncommitted].

The historical Pi chart-migration leaf pushed issue changes through main while carrying only a lesson on its leaf branch. The already-settled preflight refusal of issue-artifact-only leaves is the appropriate boundary; do not recreate that workaround. [P:charting-vocabulary/migrate-charts/review-A.md][p-migrate-review]; [A:chart-issues/assets/shapes.md — file shapes and preflight][shapes].

### Locks and operator commands

Keep the repository lock. `pullRepo` holds it without taking the global dispatcher lock, while sync and phase operations take both. Removing it on the assumption that every writer already owns the global lock is incorrect. [A:src/pull.ts:42–80][pull]; [A:src/sync.ts:6–138][sync]; [A:src/phase.ts:176–199][phase-lock].

Keep `park`/`unpark`: they refuse active work and preserve prerequisite availability, including the transitive set that must remain open. A plain `mv` loses that behavior. Keep `sync`: its selective staging and preservation/refusal conditions are not equivalent to `git add -A && git pull --rebase && git push`. Keep `pull`: it is a bounded mirror with GitHub identity, not just a saved issue title. [A:src/park.ts:22–85][park]; [A:src/sync.ts:6–138][sync]; [A:src/pull.ts:42–80][pull].

### Merge checks and the existing event-driven architecture

Keep verification after a changed rebase target. `browser-core-launch`’s archive records a semantic conflict resolution preserving both sets of browser error rows, followed by a second rebase after another leaf landed. That is evidence of integration work, not a reason to treat merging as a blind push. The current merge skill routes conflict repair through B; the archive’s direct A repair should not be confused with that current rule. [W:browser-core-launch/review-A.md][browserreview]; [A:skills/merge-issue/SKILL.md:23–47][merge].

Keep Herdr’s event-driven wakeups and operator-triggered recovery. They are the adopted architecture. No timer, daemon, polling service, background queue or hypothetical configuration is proposed. [A:plugin/herdr-plugin.toml:1–26][plugin].

## 4. Measured cost and speed

### 4.1 What the measurements mean

A log row is a **committed phase transition**, not a model invocation. The logger contains time, repo, slug, from/to phases, the completing logical slot, attempt counters, repair count, aggregate verdicts, commit/diff diagnostics and one observed session. It does not log handoff time, every prompt, the first of two review completions, subagent starts/returns, token usage or individual check runtimes. [A:src/log.ts:8–33][log].

For each repository/slug, phase residence is the elapsed time between consecutive records **only when the preceding `to` equals the next `from`**. This includes queueing, waiting, recovery and operator time inside that phase. It is not pure model runtime. The first phase is left-censored because its entry is absent; terminal `merged` has no meaningful “execution duration.” A discontinuity is excluded, not treated as a long phase.

The records are timestamped after state persistence and diagnostic collection; source closure can also precede the merge log append. Therefore these are recorded-transition residence measurements, not exact state-write timestamps. [A:src/phase.ts:19–55][phase-move]; [A:src/log.ts:8–33][log].

Use these definitions throughout:

- **Leaves:** distinct repository/slug pairs in the log, not all archived folders.
- **Fix distribution:** maximum repair round observed per logged leaf; not the number of failing assertions.
- **Attempts distribution:** each stored A/B counter at a transition. A zero often denotes a slot not required for that phase. These are counter observations, not sessions or a sum of unique attempts.
- **First review agreement:** the first initial cycle per leaf with both verdicts; later A-only re-checks are excluded. “Blocking agreement” combines ready/nits as non-blocking.
- **Observed debate route:** a log with positions/rebuttal activity. It is not an exact count of `debate: yes` declarations.

The current machine configuration assigns both slots to `pi` with `devin/swe-2-max`. The transition rows do not record model/vendor or configuration revision, so these figures are not a verified historical cross-vendor experiment. [A:config.yaml:1–20][machine]; [A:src/log.ts:8–33][log].

The last distinction matters in actual data: `browser-core-launch` has `debate: "yes"`, but its saved review says no positions/rebuttal artifacts were produced, and its log starts with synthesis. A table claiming four declared yes leaves in W from the four observed debate routes would be wrong. [W:browser-core-launch/state.yaml][browserstate]; [W:browser-core-launch/review-A.md][browserreview]; [W:issues/log.jsonl:326–355][browserlog].

Durations below are rounded to seconds and formatted `m:ss` or `h:mm:ss`. Samples are individual complete phase visits, so repeated repairs contribute repeated visits.

### 4.2 Akrogon

Source: [A:issues/log.jsonl:1–181][alog]. Window: `2026-09-11T07:07:48.122Z` to `2026-09-14T01:04:36.615Z`.

| Measure | Result |
|---|---|
| Transition records / logged leaves | 181 / 33 |
| Last observed phase | 33 merged; no logged leaf left failed at this snapshot |
| Merge transitions | 35 |
| Failure transitions / distinct affected leaves | 1 / 1 |
| Maximum observed fix round | 0: 25 leaves; 1: 3 leaves; 2: 4 leaves; 3: 1 leaves |
| Repair entries by origin | check.review: 4; merge: 10 |
| Attempt-counter cells | 0: 143; 1: 216; 2: 0; 3: 3; total 362 |
| Observed debate-route leaves | 2: `chart-issues`, `pull-close` |
| Declared `debate: yes` | Not a full state census; do not equate this with the route count above |
| Exact first-review agreement | 20/33 (60.6%) |
| Blocking first-review agreement | 31/33 (93.9%) |
| Blocking disagreement | A alone requires fix: 0; B alone: 2 |
| Phase | Complete visits | Median residence | Worst residence | Worst-case leaf and log lines |
|---|---:|---:|---:|---|
| `plan.positions` | 0 | Entry not logged | Not measured | No complete visit in this snapshot |
| `plan.rebuttal` | 2 | 1:14 | 1:15 | [`pull-close`, L16–L17][metric-A-plan.rebuttal] |
| `plan.synthesis` | 2 | 2:03 | 2:30 | [`chart-issues`, L34–L35][metric-A-plan.synthesis] |
| `implement` | 33 | 6:36 | 26:27 | [`guide-chart-picture`, L174–L175][metric-A-implement] |
| `check.review` | 49 | 1:43 | 16:21 | [`audit-fixes-batch`, L179–L180][metric-A-check.review] |
| `check.fix` | 14 | 5:05 | 26:44 | [`pull-close`, L29–L30][metric-A-check.fix] |
| `merge` | 45 | 1:02 | 6:00 | [`audit-fixes-batch`, L180–L181][metric-A-merge] |
| `failed` | 0 | Not measured | Not measured | No continuous observed failed-phase residence |
| `merged` | — | Terminal | — | No outgoing execution interval |

A has 35 initial review cycles across 33 slugs because `init-issues` and `seed-issue` re-enter execution after earlier merged records. The first-cycle table avoids double-counting them. Across all 35 initial cycles, exact agreement is 22/35 and blocking agreement is 33/35.

### 4.3 Framework

Source: [W:issues/log.jsonl:1–484][wlog]. Window: `2026-09-11T23:19:08.456Z` to `2026-09-14T06:23:20.193Z`.

| Measure | Result |
|---|---|
| Transition records / logged leaves | 484 / 95 |
| Last observed phase | 95 merged; no logged leaf left failed at this snapshot |
| Merge transitions | 95 |
| Failure transitions / distinct affected leaves | 2 / 2 |
| Maximum observed fix round | 0: 62 leaves; 1: 27 leaves; 2: 6 leaves; 3: 0 leaves |
| Repair entries by origin | check.review: 24; merge: 15 |
| Attempt-counter cells | 0: 385; 1: 572; 2: 3; 3: 8; total 968 |
| Observed debate-route leaves | 4: `batch-skills`, `handoff-contract-slim`, `injector-and-routes`, `test-runner-and-prune` |
| Declared `debate: yes` | Not a full state census; do not equate this with the route count above |
| Exact first-review agreement | 48/95 (50.5%) |
| Blocking first-review agreement | 78/95 (82.1%) |
| Blocking disagreement | A alone requires fix: 7; B alone: 10 |
| Phase | Complete visits | Median residence | Worst residence | Worst-case leaf and log lines |
|---|---:|---:|---:|---|
| `plan.positions` | 0 | Entry not logged | Not measured | No complete visit in this snapshot |
| `plan.rebuttal` | 4 | 4:26 | 14:05 | [`handoff-contract-slim`, L20–L21][metric-W-plan.rebuttal] |
| `plan.synthesis` | 4 | 2:05 | 3:44 | [`handoff-contract-slim`, L21–L22][metric-W-plan.synthesis] |
| `implement` | 96 | 15:21 | 7:16:42 | [`portal-activation`, L147–L243][metric-W-implement] |
| `check.review` | 134 | 3:58 | 7:31:21 | [`resume-state-retention`, L168–L260][metric-W-check.review] |
| `check.fix` | 39 | 3:57 | 7:22:34 | [`blueprint-phase-split`, L105–L236][metric-W-check.fix] |
| `merge` | 110 | 2:05 | 25:19 | [`remaining-module-tests`, L113–L132][metric-W-merge] |
| `failed` | 1 | 21:16 | 21:16 | [`migrate-charts`, L335–L351][metric-W-failed] |
| `merged` | — | Terminal | — | No outgoing execution interval |

The seven-hour tails in implementation, review and repair are observed dwell, not seven-hour model-runtime estimates. The log alone cannot allocate those tails between model work, queueing, operator absence or recovery.

### 4.4 Pi extensions

Source: [P:issues/log.jsonl:1–18][plog]. Window: `2026-09-12T12:22:54.857Z` to `2026-09-14T01:13:23.560Z`.

| Measure | Result |
|---|---|
| Transition records / logged leaves | 18 / 4 |
| Last observed phase | 4 merged; no logged leaf left failed at this snapshot |
| Merge transitions | 4 |
| Failure transitions / distinct affected leaves | 0 / 0 |
| Maximum observed fix round | 0: 3 leaves; 1: 1 leaves; 2: 0 leaves; 3: 0 leaves |
| Repair entries by origin | check.review: 1 |
| Attempt-counter cells | 0: 14; 1: 22; 2: 0; 3: 0; total 36 |
| Observed debate-route leaves | 0 |
| Declared `debate: yes` | 0 of 4, verified against all four states in this log cohort |
| Exact first-review agreement | 1/4 (25.0%) |
| Blocking first-review agreement | 3/4 (75.0%) |
| Blocking disagreement | A alone requires fix: 1; B alone: 0 |
| Phase | Complete visits | Median residence | Worst residence | Worst-case leaf and log lines |
|---|---:|---:|---:|---|
| `plan.positions` | 0 | Entry not logged | Not measured | No complete visit in this snapshot |
| `plan.rebuttal` | 0 | Entry not logged | Not measured | No complete visit in this snapshot |
| `plan.synthesis` | 0 | Entry not logged | Not measured | No complete visit in this snapshot |
| `implement` | 4 | 23:32 | 42:35 | [`bash-row-renderer`, L5–L6][metric-P-implement] |
| `check.review` | 5 | 6:25 | 1:35:37 | [`command-log-retention`, L2–L3][metric-P-check.review] |
| `check.fix` | 1 | 3:25 | 3:25 | [`bash-row-renderer`, L7–L8][metric-P-check.fix] |
| `merge` | 4 | 1:38 | 2:56 | [`command-log-retention`, L3–L4][metric-P-merge] |
| `failed` | 0 | Not measured | Not measured | No continuous observed failed-phase residence |
| `merged` | — | Terminal | — | No outgoing execution interval |

The first two log records use the repository key `extensions`; the physical GitHub repository and leaf identity were used consistently. The four state checks are [P:tool-output-display/bash-row-renderer/state.yaml][p-bash]; [P:tool-output-display/command-log-retention/state.yaml][p-log]; [P:charting-vocabulary/migrate-charts/state.yaml][p-migrate]; [P:session-scoped-worker-settings/session-scoped-worker-settings/state.yaml][p-session].

### 4.5 Review verdict matrix and failures

The matrix uses the **first initial cycle per logged leaf**. Each pair is ordered A then B. These are logical-role records; F1 prevents treating every pair as independent observations.

| Repository | A/B ready | A ready/B nits | A ready/B fix | A nits/B ready | A/B nits | A nits/B fix | A fix/B ready | A fix/B nits | A/B fix |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| akrogon | 18 | 1 | 0 | 10 | 1 | 2 | 0 | 0 | 1 |
| framework | 26 | 16 | 1 | 14 | 16 | 9 | 2 | 5 | 6 |
| pi-extensions | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 1 | 0 |

Across the cohort, exact agreement is **69/132 (52.3%)**; blocking agreement is **112/132 (84.8%)**. A alone calls for repair on eight first cycles, B alone on twelve. Both call for repair on seven. The second role cannot be deleted on the premise that it almost never changes the merge/repair decision. [A:issues/log.jsonl:1–181][alog]; [W:issues/log.jsonl:1–484][wlog]; [P:issues/log.jsonl:1–18][plog].

There are three logged failure transitions:

| Repository / leaf | Failed from | Evidence | What is established |
|---|---|---|---|
| A / `pull-close` | `plan.positions` | [A:issues/log.jsonl:9–17][pullfail] | Three A attempts; later planning resumes with an unlogged state discontinuity. |
| W / `migrate-charts` | `implement` | [W:issues/log.jsonl:335–358][migratefail] | Three B attempts; a later explicit failed-to-implement transition is logged. |
| W / `unit-specs-lane` | `plan.synthesis` | [W:issues/log.jsonl:480–484][unitfail] | Three B attempts and no recorded session on the failure row; later synthesis resumes without a logged failed-to-synthesis move. |

None of these three failures is a demonstrated exhaustion of the three-repair cap. The underlying reason each attempt failed is not fully encoded in the transition rows. A null session is not proof of a particular harness bug.

The excluded discontinuities are A `init-issues` L13→L19, A `seed-issue` L15→L20, A `pull-close` L9→L16, and W `unit-specs-lane` L480→L481. They prove a gap in the recorded transition history, not who edited the state or which unrecorded command was used.

### 4.6 Where residence and calls go

| Phase | Summed complete-visit residence across all repos | Interpretation |
|---|---:|---|
| `implement` | 64:37:49 | Includes waiting; overlaps other leaves; not elapsed project time |
| `check.review` | 35:05:30 | Includes waiting; overlaps other leaves; not elapsed project time |
| `check.fix` | 13:16:16 | Includes waiting; overlaps other leaves; not elapsed project time |
| `merge` | 6:57:37 | Includes waiting; overlaps other leaves; not elapsed project time |
| `plan.rebuttal` | 28:33 | Only observed debate-route entries; most synthesis visits are left-censored |
| `plan.synthesis` | 13:55 | Only observed debate-route entries; most synthesis visits are left-censored |

Implementation and review dominate the recorded residence. Of 54 repair entries, **25 originate in merge** rather than initial/repeat review. That identifies integration as a material part of the workflow, but it does not prove that all 25 were conflicts: the merge skill uses the same repair route for red checks and integration drift. [A:skills/merge-issue/SKILL.md:23–47][merge]; [A:issues/log.jsonl:1–181][alog]; [W:issues/log.jsonl:1–484][wlog]; [P:issues/log.jsonl:1–18][plog].

A no-debate, no-fix leaf requires five logical phase contributions: B synthesis, B implementation, A review, B review and A merge. With positions and rebuttal enabled, four additional logical contributions precede synthesis. Each repair cycle adds B repair and A re-check. These are protocol contributions, **not new model sessions**: a pane may keep its session across several contributions. [A:src/routing.ts:26–40][routing].

The logs also contain a transition with a B review verdict but a zero B attempt counter, so summing counters would not even recover all logical review contributions consistently. [W:issues/log.jsonl:246][zeroattempt].

**The single function-preserving speed change to make first is F3:** remove exact duplicate named check entries. Its benefit is structurally demonstrated without removing any verification command. The largest byte-level authoring simplification is F2. The sources cannot establish which saves the most wall-clock or money in practice, because they lack per-check timing and per-pass token data. No percentage saving is invented.

### 4.7 State-field prevalence: declared fields versus observed routes

| Reviewed state cohort | States read | Nonempty `sources` | Nonempty `blocked-by` | `debate: yes` | `hand_built: true` |
|---|---:|---:|---:|---:|---:|
| A: `status-empty-open-fix` | 1 | 1 | 0 | 0 | 0 |
| W: `batch-skills`, `browser-core-launch` | 2 | 0 | 1 | 2 | 0 |
| P: all four logged leaves | 4 | 0 | 1 | 0 | 0 |

Sources: [A:status-empty-open-fix — state][smallstate]; [W:batch-skills — state][batchstate]; [W:browser-core-launch/state.yaml][browserstate]; [P:tool-output-display/bash-row-renderer/state.yaml][p-bash]; [P:tool-output-display/command-log-retention/state.yaml][p-log]; [P:charting-vocabulary/migrate-charts/state.yaml][p-migrate]; [P:session-scoped-worker-settings/session-scoped-worker-settings/state.yaml][p-session].

The A/W sample is selected for close reading and is not representative prevalence. Keep `sources`: it supplies actual GitHub identity and closure in the small leaf. Keep `blocked-by`: the batch and renderer examples have real producer prerequisites. Keep `debate` as an explicit operator decision, but address H2’s mismatch. The absence of `hand_built: true` in these seven states establishes nothing about its use elsewhere; the command gives it a distinct dispatch refusal, so deletion is not justified by this sample. [A:src/pull.ts:106–207][source-close]; [A:src/next.ts:471–698][next-tail].

## 5. Closed-work walkthroughs and chart cost

### 5.1 Small chart, from intake to merged leaf

The archived `status-no-open-leaves` chart records the original missing-open report, the earlier issue’s parking/deletion and the operator-authorized re-intake. Its taken fork keeps the operator’s answer; the final chart has no open material fork or fog and explicitly excludes changing invalid-directory handling. The brief and design name the small outcome and its constraints. [A:status-empty-open-fix — intake, parking, deletion and re-intake][smallintake]; [A:status-empty-open/forks/missing-open-is-zero.md — taken fork][smallfork]; [A:status-empty-open-fix — chart and handoff][smallchart]; [A:status-empty-open-fix — original brief][smallbrief]; [A:status-empty-open-fix — locked design][smalldesign].

B’s plan then inspects the live surface rather than blindly implementing the historical report: the directory guard already exists, while the empty board needs a visible result. The implementation records failing and passing tests and a real CLI artifact. The two reviewers approve, and A records merge verification. This is the full small chart/leaf path used for F2, F5, F6 and F7. [A:status-empty-open-fix — execution plan, D1–D3 and C1–C7][smallplan]; [A:status-empty-open-fix — repeated execution contract and completed report][smallimpl]; [A:status-empty-open-fix — initial review and merge evidence][smallreviewa]; [A:status-empty-open-fix — initial review][smallreviewb].

| Recorded transition, UTC 11 September | Time | Residence since preceding observed transition |
|---|---:|---:|
| Synthesis → implement | 16:48:30.265 | Synthesis entry absent |
| Implement → initial review | 16:52:23.969 | 3:53.704 |
| Review → merge | 16:53:27.627 | 1:03.658 |
| Merge → merged | 16:54:46.829 | 1:19.202 |

The observed interval after synthesis is **6:16.564**. It excludes charting, handoff wait, initial dispatch and synthesis time. [A:issues/log.jsonl:158–161][smalllog].

### 5.2 Larger leaf: `batch-skills`

The larger leaf’s two independent positions disagree over a real live constraint: A would retain a parent context-loading key after deleting the file that the one-to-one validator requires. B’s alternative moves the library list to the batch skill. A concedes that point, the audit-unit limit interpretation and the internal-mode assumption; the synthesis incorporates the corrections. This demonstrates useful debate output, not a measured improvement over the unobserved counterfactual in which B synthesized directly. [W:batch-skills — independent position A][batchposA]; [W:batch-skills — independent position B][batchposB]; [W:batch-skills — concessions and corrections][batchrebA]; [W:batch-skills — disagreements resolved from evidence][batchrebB]; [W:batch-skills — synthesis D1–D12 and Interfaces][batchplan].

The implementation archive shows successive decompositions into bounded briefs. Its saved worker-completion sections remain templates; they cannot supply a verified worker-session count or a complete record of worker returns. The initial review nevertheless supplies concrete downstream defects and the appended A review verifies the repair. [W:batch-skills — whole-leaf implementation brief][batchimpl]; [W:batch-skills — original mechanism sub-brief][batch1]; [W:batch-skills — restricted read-first sub-brief][batch1a]; [W:batch-skills — nine-skill sub-brief][batch1b]; [W:batch-skills — original parent-edit sub-brief][batch2]; [W:batch-skills — grep-only sub-brief and worker-exhaustion explanation][batch2a]; [W:batch-skills — test rewrite sub-brief][batch2b]; [W:batch-skills — validator sub-brief][batch3]; [W:batch-skills — repair brief; identifies the reviews as identical][batchfix]; [W:batch-skills — initial review and appended repair review][batchrevA].

| Recorded transition, UTC 12 September | Time | Residence since preceding observed transition |
|---|---:|---:|
| Positions → rebuttal | 13:39:45.485 | Positions entry absent |
| Rebuttal → synthesis | 13:42:52.966 | 3:07.481 |
| Synthesis → implement | 13:44:48.835 | 1:55.869 |
| Implement → initial review | 15:46:37.453 | 2:01:48.618 |
| Initial review → repair | 16:31:22.617 | 44:45.164 |
| Repair → re-check | 16:59:51.283 | 28:28.666 |
| Re-check → merge | 17:04:56.051 | 5:04.768 |
| Merge → merged | 17:12:08.053 | 7:12.002 |

The observed interval from the positions-completion row to merge is **3:32:22.568**. The dominant parts are implementation and initial review, with the role-substitution problem inside the latter. The records do not separate useful work from the wait preceding fallback. [W:issues/log.jsonl:54–73][batchlog].

### 5.3 Charting with B: count barriers, not imaginary sessions

The current protocol needs two concurrently developing map contributions, A’s merge, and B’s disagreement-only response. Each attended fork round repeats independent contributions followed by B’s response to the merged round; a later mechanism/contract change adds one focused B check. The current handoff then adds B’s review of each proposed leaf contract. [A:skills/chart-issues/assets/questions.md:1–41][questions]; [A:chart-issues/SKILL.md — Open, Take, Handoff][chart].

For **R** attended fork rounds and **C** later material-change checks, the procedure introduces approximately **3 + 2R + C synchronization barriers** before dispatch: two at the opening map, two per round, C final-shape checks, and one handoff review barrier. This counts logical dependency points, not wall-clock waits. B can review several leaf drafts in one batch; the protocol does not prove one new model session per leaf. The operator also has R answer points and a handoff authorization point, which may already be supplied in the session. A and B can work concurrently before each merge barrier.

The saved `skill-lane-rebuild` slot directory contains six files: two maps, the merged map, B’s map rebuttal, A’s tree proposal and B’s tree check. They establish at least those retained contributions, not the total number of live calls, sessions, per-round B answers or human waits. Its final chart records eleven taken decisions. The file count cannot be substituted for session count. [W:skill-lane-rebuild — chart, scope exclusions and handoff][bigchart]; [W:skill-lane-rebuild — independent map A][mapa]; [W:skill-lane-rebuild — independent map B][mapb]; [W:skill-lane-rebuild — merged map and corrected baseline][mapmerged]; [W:skill-lane-rebuild — B’s correction and scope disagreement][mapreb]; [W:skill-lane-rebuild — revised handoff tree][treea]; [W:skill-lane-rebuild — B’s eight handoff findings][treeb].

The cost is real synchronization; the demonstrated benefit is the corrected baseline and handoff tree in §3. Keep those functions. The selected archive does not justify removing the whole B exchange or retaining every empty presentation section around it.

## 6. Holes and their smallest responses

These entries distinguish an observed failure from a static gap in the reviewed process. A code path demonstrating a gap is not a claim that the hypothetical incident already happened.

### H1. A logical second reviewer can inherit the first reviewer’s context

**Status:** demonstrated; **response:** remove a rule/branch, F1. The archived session trail and identical initial review bodies prevent certification of independent review for `batch-skills`. Do not add an assertion in prose that the substitute is “acting independently.” The changed process is the F1 replay. [W:issues/log.jsonl:70–73][batch-fallback]; [W:batch-skills — initial review and appended repair review][batchrevA]; [W:batch-skills — initial review][batchrevB].

### H2. Declared debate can be bypassed by the initial phase

**Status:** observed mismatch; **response:** structural handoff gate, not prose matching. `browser-core-launch` records `debate: yes`, no debate artifacts and a direct synthesis route. The phase router validates legal moves from the current phase; it does not make a already-started synthesis visit retroactively run positions. [W:browser-core-launch/state.yaml][browserstate]; [W:browser-core-launch/review-A.md][browserreview]; [W:issues/log.jsonl:326–355][browserlog]; [A:src/routing.ts:26–40][routing]; [A:src/phase.ts:96–140][phase-transition].

**Smallest response.** Derive the initial phase from the declared debate choice when writing the contract, and have the command reject a contradictory state when first allocating an unstarted leaf. Put this in the existing first-allocation path, not in a new mode, a separate handoff service, or a check for phrases in plan files. Preserve existing completed histories rather than rewriting them.

**Replay and tradeoff.** The browser leaf would either start positions for its yes choice or obtain an explicit correction to no before dispatch. It would not reach synthesis with an unexplained missing debate. This adds one real consistency check; it does not justify checking that every plan contains predetermined headings.

### H3. A two-person initial review shares a mutable code branch

**Status:** static gap, with lesson commits explicitly recorded in the review archive; **response:** ownership rule. The checker is instructed to record and commit reusable lessons on the leaf branch, while both initial checkers review that same worktree. Reviewed base/head are written in prose, not bound to the verdict in state. [A:skills/check-issue/SKILL.md:37–43][check-lesson]; [A:src/state.ts:13–36][state]. The Pi migration archive explicitly identifies a lesson-only leaf commit as its reviewed head. [P:charting-vocabulary/migrate-charts/review-A.md][p-migrate-review].

**Smallest response.** Make initial review read-only with respect to the code branch. Record proposed lessons with the review in the authoritative issue area; let the existing single merge owner perform any resulting scoped lesson commit and verify that changed head. Keep separate review files and do not add a second locking or revision-token system just for lesson writing.

**Replay and tradeoff.** The migration reviewer’s lesson would remain a proposed lesson until A’s merge work, instead of changing the shared branch during the review stage. The rule removes concurrent code writers but delays promotion of the lesson. The archive does not prove that a code defect escaped through this gap.

### H4. A handoff batch can become dispatchable before publication of the whole contract set

**Status:** static process gap; **response:** one structural publication boundary. Charting writes leaf contracts into `issues/open/`; discovery treats a directory containing `state.yaml` as a leaf. The existing owner-completion calculation considers the leaves it can currently enumerate. No published-batch identity is carried in state. [A:chart-issues/assets/shapes.md — file shapes and preflight][shapes]; [A:src/next.ts:82–143][next-discovery]; [A:src/phase.ts:57–94][phase-owner]; [A:src/state.ts:13–36][state].

**Smallest response.** Publish a complete owner’s validated contracts together, with `state.yaml` visible only after its required documents exist, coordinated by the existing repository lock. A temporary staging directory followed by one owner-directory move is sufficient; do not add a daemon, a new ready flag or an extra lifecycle phase.

**Replay and tradeoff.** For the large skill-lane handoff, the proposed tree and all of its leaf contracts would become visible as one batch rather than exposing a partially written tree to an unrelated Herdr event. This adds a publication step while removing the implicit dependence on “no hook happens yet.” No premature completion incident was established in the examined logs.

### H5. Transition history can be incomplete even when state has advanced

**Status:** designed behavior plus observed discontinuities; **response:** observation boundary, not a second source of truth. `commitMove` saves state before logging and explicitly reports a committed move even if the log append fails. It also performs completion work before that log append. The three logs contain the discontinuities enumerated in §4.5. [A:src/phase.ts:19–55][phase-move].

**Smallest response.** Keep state authoritative. Diagnose gaps explicitly and exclude them from timing calculations; never reconstruct the operational phase from the log as a competing truth. For this audit, the response is **nothing in the runtime**. A durable transactional event store would violate the simplicity goal without a stated requirement.

**Replay and tradeoff.** `unit-specs-lane`’s later synthesis record is treated as a new observed segment, not evidence of a supported failed-to-synthesis transition. Historical time across the gap remains unknown.

### H6. Broadcast is best-effort, not exactly-once delivery

**Status:** static delivery gap; **response:** retain the present best-effort rule and state its limit. Broadcast is conditional on the current merge invocation printing `issue complete`, runs in the merge session, and does not reopen merged work when it fails. The command’s completion recovery can run with `justMerged=false`; state has no durable per-target broadcast receipt. [A:skills/merge-issue/SKILL.md:23–47][merge]; [A:src/phase.ts:57–94][phase-owner]; [A:broadcast-issue/SKILL.md — sending and retry procedure][broadcast]; [A:src/state.ts:13–36][state].

**Smallest response.** Keep one broadcaster in the merge session and a visible failure for operator follow-up. Do not claim exactly-once delivery, and do not add a queue or delivery-state machine to obtain a guarantee the present design does not supply.

**Replay and tradeoff.** The small sourced status issue would still close and archive correctly if the merge process stopped after state advancement but before Discord delivery; the operator would need to send the missed update. That possible omission is an accepted limit, not evidence that its actual broadcast was lost.

### H7. Parked work is outside the leaf-side intake deduplication set

**Status:** static ownership gap; **response:** structural intake check. Charting’s exact-identity deduplication names open/closed leaf sources and chart intake. `park` preserves issue records in a different area, and the current availability/leaf enumeration paths use open/closed. A retained chart intake can still protect that identity, but a parked leaf without that retained intake is absent from the leaf-side ownership check even while its original report remains open upstream. [A:chart-issues/SKILL.md — Open, Take, Handoff][chart]; [A:src/park.ts:22–85][park]; [A:src/state.ts:60–107][state-leaves].

**Smallest response.** Include parked contracts when checking existing intake ownership and slug collisions. Do not make them dispatchable or satisfy an active dependency merely because they exist. This extends the existing identity check to an existing lifecycle area; it adds no flag or new record type.

**Replay and tradeoff.** In the small status issue’s recorded park/delete/re-intake history, a still-parked original would be identified before import. Once the operator’s deletion is confirmed, the recorded explicit re-intake remains permitted. The audit found that deliberate re-intake, not an accidental duplicate from this gap. [A:status-empty-open-fix — intake, parking, deletion and re-intake][smallintake].

### H8. Template presence does not establish a completed implementation report

**Status:** observed archive limitation; **response:** apply the existing semantic verification rule, not an exact-heading gate. `batch-skills`’ sub-brief completion sections retain placeholders, while its main implementation brief ends with a known limitation rather than a complete worker-return record. The saved review supplies real repair evidence, so it would be false to conclude that no work was performed or no live report existed. [W:batch-skills — whole-leaf implementation brief][batchimpl]; [W:batch-skills — restricted read-first sub-brief][batch1a]; [W:batch-skills — grep-only sub-brief and worker-exhaustion explanation][batch2a]; [W:batch-skills — repair brief; identifies the reviews as identical][batchfix]; [W:batch-skills — initial review and appended repair review][batchrevA].

**Smallest response.** Under F2, keep one actual leaf completion record containing the changed head, checks/results and material unresolved limitations. Continue to block only a report gap material to correctness or verification, as the checker already says; do not block on placeholder words or missing section numbers. [A:skills/check-issue/SKILL.md:21–51][check].

**Replay and tradeoff.** A fresh reviewer of `batch-skills` would receive B’s consolidated actual verification evidence instead of having to distinguish eight proposed briefs from missing returns. No additional per-worker reporting session is required.

### H9. `failed → implement` is not a general recovery contract

**Status:** demonstrated mismatch between the single exit and planning-stage failures; **response:** operator recovery rule, with no automatic log-based rewind. Two observed failures occurred before implementation, and both later resume planning through a gap in the logged route. The legal routing table only permits `failed → implement`. [A:issues/log.jsonl:9–17][pullfail]; [W:issues/log.jsonl:480–484][unitfail]; [A:src/routing.ts:26–40][routing].

**Smallest response.** Treat the existing retry as valid only after the leaf has an implementation-ready contract and plan. A planning-stage failure requires the operator to resolve and establish that missing planning work before using the existing restart. Do not direct the operator to edit the phase by hand, and do not infer a previous phase from an explicitly best-effort log.

**Replay and tradeoff.** `unit-specs-lane` would stop with the missing planning work identified; it would not silently jump to implementation, nor pretend a failed-to-synthesis transition is supported. This preserves one restart path at the cost of attended recovery. A generalized resumable failure state would need additional persistent information and is not justified here as a simplification.

### Hole-response tradeoffs and rule verdicts

| Hole | What changes or is removed | What stays | What breaks or costs more | Criteria and verdict |
|---|---|---|---|---|
| H1 | Remove cross-role fallback | Independent slots and bounded retries | Unattended recovery through the peer is lost | Simplicity, clarity, function; **DROP fallback**, F1. |
| H2 | Eliminate independent contradictory choices of debate and initial phase | Operator choice and the same lifecycle phases | One first-allocation consistency check is added; contradictory new contracts stop | Clarity and correctness; **KEEP choice, GATE consistency**. This is necessary consistency work, not fewer lines of code. |
| H3 | Remove initial reviewers as concurrent code-branch writers | Review evidence, lessons, one merge owner | Lesson promotion waits for merge | Simpler ownership, clear review head; **DROP initial-review code writes**. |
| H4 | Replace incremental live publication with one complete owner publication | Existing files, structural preflight and locks | One coordinated publication step is required | Clarity and correctness; **MERGE publication into one boundary**. Do not add a second ready-state mechanism. |
| H5 | Remove the assumption that a diagnostic log is a complete state journal | State authority and best-effort history | Exact timing across gaps stays unknown | Simplicity; **KEEP runtime, DROP unsupported inference**. |
| H6 | Remove any claim of exactly-once Discord delivery | One sender, bounded retry, merged work stays merged | Operator intervention after a missed or ambiguous delivery | Simplicity and honest operation; **KEEP best effort**. |
| H7 | Include existing parked identities in the existing ownership check | Parked work stays ineligible for dispatch | A duplicate proposal must be resolved before publication | Clarity and one identity check; **KEEP parking, EXTEND existing structural check**. |
| H8 | Replace template presence with one material completion record | Real checks, head and unresolved limits | B must consolidate actual evidence, not just leave a proposed brief | Function over format and fewer records; **MERGE with F2**, keep semantic review. |
| H9 | Remove the assumption that every failure is implementation-ready | Existing explicit restart route | Planning failure requires attended resolution | Clarity without new persistent recovery state; **KEEP bounded restart, DROP automatic generalization**. |

## 7. Skill compression: what changed, and what did not

The comparison uses the longer chart skill at `398761c2afa453be5b383397c457c78c2066cb3a`, the later compressed skill at `9ab80642f1411732a48acdd9302af4f49e9f972f`, and the pinned current skill. It is a comparison of those inspected versions, not a claim to have executed every historical version. [A:chart skill before rewrite — fork types and research tiers][old-types]; [A:chart skill before rewrite — chart size, sessions and handoff simulation][old-scope]; [A:chart skill before the latest contract-review addition][pre-latest]; [A:chart-issues/SKILL.md — Open, Take, Handoff][chart].

| Historical mechanism | Current evidence | Verdict |
|---|---|---|
| Five typed fork lanes and their dispatch distinctions | Current charting is an attended door; questions/peer exchange and optional measurements are direct operations. | **KEEP removed.** Do not restore a five-type taxonomy to preserve actions that still work without it. |
| Ranked practitioner/better-than-training/model-knowledge sources, including redo policy | The historical tier hierarchy is absent from the current chart skill and its current question reference. | **KEEP removed.** Preserve inspection and evidence quality; no claim that a practitioner label outranks direct evidence for every question. |
| Mandatory one-subagent-per-leaf pre-handoff simulation | Current skill retains implementer audit, structural preflight and, when B is named, review of leaf drafts. | **KEEP the functions; do not restore separate simulation sessions without a demonstrated lost defect catch.** |
| Roughly twenty-fork cap and one-fork/session-style procedure | Current skill uses proportional maps, reshapes after answers and refuses unresolved material fog; no arbitrary numerical cap. | **KEEP removed.** Staleness is handled by updating the chart, not by restarting after a fixed count. |
| Distinct intake/creation routes and older status vocabulary | Current door writes the chosen chart/leaf structures and leaves dispatch to the command. | **KEEP consolidation.** Do not re-audit the settled vocabulary change. |
| Worker protocol, scoped briefs, changed tests and B’s final verification | These already exist in the inspected earlier implementation skill and survive today. | **KEEP the functional boundaries; apply F2 to redundant whole-leaf restatement.** |
| B review of every handoff leaf draft | The latest current chart skill makes it explicit; the inspected preceding compressed version does not contain the same complete requirement. | **KEEP.** Absence of older per-leaf draft files is not evidence that this newer rule is useless. |

The old chart instructions consumed more procedural surface, but line-count reduction alone proves neither loss nor preservation. The observed current defects are specific: initial-phase inconsistency, role substitution, and publication/ownership boundaries. No inspected before/after case proves that reinstating the old source tiers or mandatory extra simulator sessions would fix them. [A:implementation skill before the chart rewrite][old-impl]; [A:skills/chart-issues/assets/questions.md:1–41][questions]; [A:chart-issues/SKILL.md — Open, Take, Handoff][chart].

### Two lesson traces

**Trace 1 — stderr parsing.** The September 10 history records an unguarded parse that hid the actual external-command failure. Current dispatch classifies retryable errors with guarded parsing and a schema, retaining non-retryable command evidence; current GitHub input parsing similarly reports the raw response on invalid data. The failure mechanism is addressed in code. Its lesson remains in the active index rather than being unambiguously marked applied and removed. This establishes mechanism adoption and imperfect bookkeeping, not which later agent read the lesson. [A:learnings/history/2026-09-10-stderr-json-parse.md][l-stderr]; [A:src/next.ts:382–468][next-dispatch]; [A:src/pull.ts:106–207][source-close]; [A:learnings/LESSONS.md:1–16][lessons].

**Trace 2 — uncommitted handoff.** The September 11 history records implementation work left uncommitted at handoff. Current phase transitions require a clean worktree, and merge recovery also checks cleanliness. The completed small status leaf supplies a committed implementation head and verification evidence. The safety mechanism is in place; the active/history cleanup still does not provide a clean closed-loop “applied” trail. [A:learnings/history/2026-09-11-uncommitted-handoff.md][l-uncommitted]; [A:src/phase.ts:142–174][phase-clean]; [A:status-empty-open-fix — repeated execution contract and completed report][smallimpl]; [A:learnings/LESSONS.md:1–16][lessons].

Keep the short lesson plus case/history pair: one is an index and the other is evidence. Treat old lesson text as an observation, especially where it describes an older cleanup policy. Do not promote every lesson into a new mandatory gate. The scratch-verification history describes an old/runtime schema mismatch, but the current state schema already contains `prompted_at`; that historical incident is not a current missing-field finding. [A:learnings/history/2026-09-13-akrogon-home-scratch-verify.md][l-scratch]; [A:src/state.ts:13–36][state].

**Settled-items aside.** The supplied prompt calls the eight code-audit fixes queued; the pinned Akrogon log already records `audit-fixes-batch` merged. This audit uses the present state, does not repeat those code-only findings, and does not reopen the settled `--all` scope, vocabulary or force-cleanup decisions. [A:issues/AKROGON-AUDIT-FIXES.md — operator verdict on the prior code audit][prior-verdict]; [A:issues/log.jsonl:178–181][auditmerged].

## 8. Prose versus machinery: rule placement

This table covers the process rules examined in the findings and questions. It distinguishes a deterministic fact the command can check from a judgment that would become a brittle phrase-matching gate.

| Concern | Current side / evidence | Verdict and smallest placement |
|---|---|---|
| Legal transitions, slot completion and aggregated verdict | Command: [A:src/routing.ts:26–40][routing]; [A:src/phase.ts:96–140][phase-transition] | **KEEP in command.** An agent cannot reliably enforce global sequencing by promises. |
| Retry count and re-prompt grace | Command: [A:src/next.ts:382–468][next-dispatch] | **KEEP in command. DROP peer-seat substitution** under F1. |
| Busy-seat observation | Command: [A:src/next.ts:172–205][next-busy] | **KEEP.** It is an observation on the next invocation, not a timer guarantee. No poller. |
| Capacity, registered repo identity and worktree ownership | Command: [A:src/next.ts:262–356][next-allocation]; [A:src/next.ts:82–143][next-discovery] | **KEEP in command.** These are shared resource facts, not prompt advice. |
| Code-only leaf branch and clean handoff | Command: [A:src/phase.ts:142–174][phase-clean] | **KEEP mechanical.** Real lost-work history supports it. |
| Commit issue records only as operator | Skills/operator procedure plus selective sync: [A:src/sync.ts:6–138][sync] | **KEEP ownership rule and sync protection.** Do not introduce agent automatic issue commits. |
| Explicit debate choice / matching initial phase | Authored contract and initial state: [A:chart-issues/assets/shapes.md — file shapes and preflight][shapes]; [W:browser-core-launch/state.yaml][browserstate] | **KEEP choice in prose; GATE structural consistency once**, H2. |
| No unresolved material fog or open question | Chart prose: [A:chart-issues/SKILL.md — Open, Take, Handoff][chart] | **KEEP semantic judgment.** Counting headings or matching “None” would not establish readiness. |
| Verbatim answer, decision history and supersession | Chart artifact rules: [A:chart-issues/assets/shapes.md — file shapes and preflight][shapes] | **KEEP as artifact/ownership discipline.** No natural-language equality test for whether an agent honored the decision. |
| Complete files, identities, dependency references and publication | Preflight plus discovery: [A:chart-issues/assets/shapes.md — file shapes and preflight][shapes]; [A:src/next.ts:82–143][next-discovery] | **KEEP structural checks; consolidate publication**, H4. Do not mechanically grade plan prose. |
| Human prerequisite completed; credential names identified | Chart prose: [A:chart-issues/SKILL.md — Open, Take, Handoff][chart] | **KEEP real-world judgment.** A field or empty env key is not proof that the prerequisite is satisfied. |
| Design precedence over ambiguous brief wording | Plan/checker: [A:plan-issue/SKILL.md — phase instructions][plan-skill]; [A:learnings/history/2026-09-11-lock-vs-criterion.md][l-lock] | **KEEP semantic precedence and report the conflict.** Do not make a forbidden-word check override the locked design. |
| Whole-leaf plan and execution contract | Two prose artifacts: [A:status-empty-open-fix — execution plan, D1–D3 and C1–C7][smallplan]; [A:status-empty-open-fix — repeated execution contract and completed report][smallimpl] | **MERGE**, F2. |
| Sequential worker ownership and mismatch return | Skill protocol: [A:skills/implement-issue/worker-protocol.md:1–28][worker] | **KEEP in protocol.** Remove unnecessary read ceilings, F4; do not grant extra write scope. |
| Red/green evidence and meaningful acceptance tests | Implement/check skills: [A:implement-issue/SKILL.md — implementation and repair][impl-skill]; [A:skills/check-issue/SKILL.md:21–51][check] | **KEEP judgment plus real command results.** No mandatory phrase or fixed test-count gate. |
| Duplicated test definitions | Configuration: [W:issues/config.yaml:1–19][wconfig] | **DROP duplicates**, F3; keep the underlying commands. |
| Initial review independence | Skill prohibition, contradicted by fallback: [A:skills/check-issue/SKILL.md:21–51][check]; [A:src/next.ts:208–214][next-seat] | **KEEP blindness; remove contradictory machinery**, F1. Make code-branch review read-only, H3. |
| Reviewed commit and report evidence | Review prose: [A:skills/check-issue/SKILL.md:21–51][check] | **KEEP exact commit/result evidence.** Missing material verification blocks; missing formatting does not. |
| Fresh integration check and fast-forward push | Merge procedure: [A:skills/merge-issue/SKILL.md:23–47][merge] | **KEEP current owner and checks.** No separate automatic-merge mode added. |
| GitHub source closure and completed-owner move | Command: [A:src/phase.ts:57–94][phase-owner]; [A:src/pull.ts:106–207][source-close] | **KEEP mechanical.** Preserve source identity and bounded retry. |
| Discord explanation and delivery | Merge/broadcast skills: [A:skills/merge-issue/SKILL.md:23–47][merge]; [A:broadcast-issue/SKILL.md — sending and retry procedure][broadcast] | **KEEP one sender and best-effort delivery.** Do not infer exactly-once from a printed marker. |
| Common behavioral advice | Repeated short skill text; identical Ponytail files | **KEEP short inline advice; MERGE large identical source**, F7. |
| Lessons and their application | Index/history plus judgment: [A:learnings/LESSONS.md:1–16][lessons] | **KEEP evidence; use existing prune/application discipline.** Do not convert a historical observation into a permanent command gate. |
| Human-readable footer | Skill output | **KEEP actual-result reporting.** The footer is not state and must not control dispatch. |

### Dispatch complexity: process need versus Herdr adaptation

| `next` concern | Why it exists | Verdict |
|---|---|---|
| Capacity and dependency checks | Limit shared work and respect actual prerequisites | **KEEP**; independent of Herdr’s particular API. |
| Tab/pane allocation and identity recovery | Map a leaf to existing Herdr resources | **KEEP** while Herdr is the chosen host. Removing it would remove required operation. |
| Agent start/status/prompt classification | Adapt to the harness lifecycle reported by Herdr | **KEEP** the bounded adapter, not more process phases. |
| Re-prompt grace | Avoid immediately treating a delivered prompt as a missing completion | **KEEP**; the current design relies on event/status timing. |
| Third-attempt peer pane | Substitute another role’s live session | **DROP**, F1; the adaptation violates the process invariant. |
| Attempt counting and failed notice | Bounded recovery and an operator-visible stop | **KEEP**; distinguish dispatch exhaustion from review repair count. |
| Busy notice | Explain a long-observed working/blocked seat | **KEEP** without pretending it wakes itself after an hour. |
| Merged cleanup and completion sweep | Reconcile partial completion or abandoned resources | **KEEP**, but do not use sweep history as proof of delivery guarantees. |
| Hook context | Determine which registered work an event concerns | **KEEP** as host adaptation; do not replace it with a watcher. |

Evidence: [A:src/next.ts:172–205][next-busy]; [A:src/next.ts:262–356][next-allocation]; [A:src/next.ts:382–468][next-dispatch]; [A:src/next.ts:471–698][next-tail]; [A:plugin/herdr-plugin.toml:1–26][plugin].

## 9. Answers to every numbered question

Each answer gives the verdict and points to the analysis above. Sections E, F and G of the supplied prompt are covered by §§8, 4 and 6 respectively.

### A. Charting

**A1. Is the map earning its place?** Yes for a multi-surface destination: the saved maps separate lane work from unrelated skill defects, expose baseline drift and identify sequencing/authority gaps before leaf writing. Keep a proportional map; the single-question status chart does not require a separate long survey (§§3 and 5.3; [W:skill-lane-rebuild — merged map and corrected baseline][mapmerged]).

**A2. Are five fork types needed?** They are present in the inspected historical skill, not the current chart protocol. Keep the consolidation: research, measurement, discussion and prerequisite resolution remain actions without needing five state-like fork categories (§7; [A:chart skill before rewrite — fork types and research tiers][old-types]; [A:skills/chart-issues/assets/questions.md:1–41][questions]).

**A3. Must a small round use the complete shape?** No; the current rule explicitly requires it, but F6 removes only empty/redundant presentation while retaining informed operator choice. No command needs a pitfalls heading to know whether the operator answered ([A:skills/chart-issues/assets/questions.md:25–27][question-full]).

**A4. What does blind B charting cost, and is there evidence of value?** The protocol creates the synchronization barriers counted in §5.3; saved files do not reveal exact session counts or elapsed operator waits. The retained B tree review corrects dependencies, unverifiable acceptance criteria and ownership, so keep that function rather than assuming the entire exchange is overhead ([W:skill-lane-rebuild — B’s eight handoff findings][treeb]; [W:skill-lane-rebuild — revised handoff tree][treea]).

**A5. Are the research tiers enforced and useful?** The tier-and-redo regime belongs to the older skill; it is absent from the current reference and is not a current machine gate. No inspected before/after case isolates an outcome improved by enforcing that hierarchy, so retain evidence grounding without restoring the tiers (§7; [A:chart skill before rewrite — fork types and research tiers][old-types]).

**A6. Should prototype code always be discarded?** Keep scratch experiments separate from shipping work, as the current optional-measurement rule requires; a passing probe is not production implementation. The reviewed charts do not establish a case where retaining the scratch implementation would safely save work, so no reuse exception is proposed ([A:skills/chart-issues/assets/questions.md:1–41][questions]).

**A7. What replaces the old cap/session rules?** The current map must stay proportional and be reshaped after answers, while unresolved material fog blocks handoff. Keep those semantic boundaries instead of another numerical cap; the selected charts do not demonstrate that a restored twenty-fork or one-session rule would have prevented an actual failure ([A:chart-issues/SKILL.md — Open, Take, Handoff][chart]; [A:chart skill before rewrite — chart size, sessions and handoff simulation][old-scope]).

**A8. Is one of the four chart sections dead?** No deletion is supported: both inspected completed charts use off-route scope boundaries, and empty open/fog sections at handoff are the intended final state rather than proof of disuse. Keep the distinction between unresolved uncertainty, a sharp open question, a taken decision and excluded scope ([A:status-empty-open-fix — chart and handoff][smallchart]; [W:skill-lane-rebuild — chart, scope exclusions and handoff][bigchart]).

**A9. Is a new superseding fork the simplest honest correction?** Keep it: the original answer remains evidence, and the new decision can name what it replaces without rewriting history. The selected artifacts do not establish a simpler correction mechanism with the same provenance guarantee ([A:chart-issues/assets/shapes.md — file shapes and preflight][shapes]).

**A10. Which handoff safeguards caught defects?** B’s tree check demonstrably identifies contract and sequencing defects that are incorporated in the revised tree; the design/criterion conflict history shows a defect caught later by planning/review, not by a proven successful preflight. No retained case attributes a specific catch to every separate dry-run, coverage check or preflight step, and the newest mandatory B draft-review rule cannot be judged unused from older archives (§§3 and 7; [W:skill-lane-rebuild — B’s eight handoff findings][treeb]; [A:learnings/history/2026-09-11-lock-vs-criterion.md][l-lock]).

**A11. Does planning redo charting?** Charting should lock the destination and operator decisions; planning should inspect the current implementation and decide execution details within those locks. The small plan’s correction of the historical crash premise demonstrates that distinction, whereas rewriting the same plan as a second whole-leaf brief is the duplication to remove in F2 ([A:status-empty-open-fix — execution plan, D1–D3 and C1–C7][smallplan]).

### B. Handoff and leaf contracts

**B1. Replace copied decisions with a shared pointer?** Not generally: the implementer needs the actual applicable decisions and exclusions, while a shared mutable chart reference adds path/version/loading dependencies. Keep self-contained original brief/design contracts and indexes; remove the later repeated execution contract under F2 ([W:batch-skills — binding decisions][batchdesign]; [A:chart-issues/assets/shapes.md — file shapes and preflight][shapes]).

**B2. Is standing design read and behavior-changing?** The small plan names the design in its read set and the small implementation supplies real CLI evidence consistent with the standing verification rule; the lock-versus-criterion history shows the copied block affecting interpretation. That establishes use and a concrete effect in inspected cases, not universal read compliance or a causal estimate of quality gain ([A:status-empty-open-fix — execution plan, D1–D3 and C1–C7][smallplan]; [A:status-empty-open-fix — live CLI artifact][smallcli]; [A:learnings/history/2026-09-11-lock-vs-criterion.md][l-lock]).

**B3. Are all state fields earning their place?** Keep `sources` and `blocked-by` because the inspected sourced leaf and producer-dependent leaves use their mechanics, and keep `debate` while fixing initial-state consistency. No deletion of `hand_built` is justified by the seven-state sample; §4.7 gives exact sample counts and explicitly does not claim an A/W census ([A:status-empty-open-fix — state][smallstate]; [W:batch-skills — state][batchstate]; [A:src/next.ts:471–698][next-tail]).

### C. Lifecycle

**C1. Where did the time and sessions go in a closed leaf?** §5.2 walks `batch-skills` through positions completion, rebuttal, synthesis, implementation, initial review, repair, re-check and merge with exact log times. Failed is an alternate outcome, not a phase every successful leaf must visit, and the log cannot turn those visits into a full session count ([W:issues/log.jsonl:54–73][batchlog]; [A:src/routing.ts:26–40][routing]).

**C2. How often is debate used, and does synthesis differ?** The logs show debate-route activity on two A leaves, four W leaves and no P leaves; those are not declared-yes counts, as H2 demonstrates. In `batch-skills`, A concedes live-contract mistakes and the synthesis adopts B’s corrections, but the sources cannot establish what direct B synthesis would have produced (§§4.1 and 5.2; [W:batch-skills — concessions and corrections][batchrebA]; [W:batch-skills — synthesis D1–D12 and Interfaces][batchplan]).

**C3. How often do the initial reviewers disagree?** They disagree about repair on 20/132 first cycles and differ exactly on 63/132; ready versus nits is not a blocking disagreement. Keep the second role, while fixing the independence failure that contaminates at least the inspected fallback case (§4.5; F1).

**C4. Did the repair cap cause the failures?** No observed failure is attributed to the repair cap: the three logged failures exhaust dispatch attempts, and every affected leaf later reaches merged in the snapshot. Keep the cap as a bounded-repair rule, but these data do not establish that three is an empirically optimal threshold (§4.5).

**C5. Does the worker protocol beat inline execution?** All three current configs select subagents, and the examined larger archive shows real re-scoping of worker briefs but incomplete saved return evidence. There is no controlled historical inline cohort in this audit, so keep scoped delegation/mismatch/changed-tests and remove only the redundant whole-leaf rewrite and investigation bans, not the worker protocol wholesale ([A:issues/config.yaml:1–20][aconfig]; [W:issues/config.yaml:1–19][wconfig]; [P:issues/config.yaml:1–18][pconfig]; F2; F4).

**C6. Could merge be entirely mechanical?** Fetch, rebase, checks and fast-forward push are mechanical, but integration diagnosis, scope-preserving repair and factual reporting remain real work in the recorded merge example. Keep the current owner and shared repair path; a second automated-merge path is not demonstrated to simplify the whole process ([W:browser-core-launch/review-A.md][browserreview]; [A:skills/merge-issue/SKILL.md:23–47][merge]).

**C7. Is the merge slot the simplest broadcaster?** Yes under the accepted best-effort delivery contract: it already has the completed-issue context and must finish before its tab closes. It does not guarantee exactly-once or recovery of a lost notification, and adding such a delivery subsystem is not proposed (H6; [A:broadcast-issue/SKILL.md — sending and retry procedure][broadcast]).

**C8. Should Ponytail remain duplicated?** No: both sources are the same Git blob. F7 keeps the existing local read paths while making one an alias of the canonical file, with the isolated-directory distribution tradeoff stated explicitly.

**C9. Is repetition across skills a cost or a feature?** Keep the four short behavioral lines and phase-local actual-result footer in each independently loaded skill; an extra common-loader mechanism would cost more than it removes. Share the substantial identical Ponytail source instead, and do not let footer text become dispatch authority ([A:skills/check-issue/SKILL.md:21–51][check]; [A:skills/merge-issue/SKILL.md:23–47][merge]; F7).

**C10. Did the lesson mechanism work?** The stderr and uncommitted-handoff traces reach concrete runtime safeguards, but their active/history bookkeeping does not show a clean completed “applied” lifecycle. Keep short indexed evidence and prune using the existing procedure; do not claim the records prove which later session read and applied each lesson (§7).

### D. The command

**D1. Which dispatch concerns can be deleted?** The demonstrably removable concern is automatic peer-seat stand-in, because it contradicts role independence. Keep capacity, ownership, bounded retries, cleanup and completion; the detailed distinction between process needs and Herdr adapters is in §8 rather than treating every host-integration branch as unnecessary complexity.

**D2. Is the repo lock redundant?** No: `pullRepo` uses the repository lock without the global lock, so global serialization does not cover all relevant writers. Keep it; the prior leaf-lock removal is already settled ([A:src/pull.ts:42–80][pull]; [A:src/phase.ts:176–199][phase-lock]; [A:src/sync.ts:6–138][sync]).

**D3. Which operator commands are used and replaceable by shell?** The small intake history supplies actual park/sync/re-intake use, but the transition logs do not provide command-frequency counts and local shell history was not inspected. Keep sync, park/unpark and pull for their safety/identity behavior; no evidence supports deleting `status --charts` merely because it has no transition-log rows ([A:status-empty-open-fix — intake, parking, deletion and re-intake][smallintake]; [A:src/park.ts:22–85][park]; [A:src/sync.ts:6–138][sync]; [A:src/pull.ts:42–80][pull]).

**D4. Is failed-to-implement the right single exit?** It is valid only for implementation-ready recovery, not an automatic response to all failures: two observed failures occur in planning and later resume planning outside the recorded legal route. H9 gives the smallest attended recovery rule without treating the log as a second state authority ([A:issues/log.jsonl:9–17][pullfail]; [W:issues/log.jsonl:480–484][unitfail]; [A:src/routing.ts:26–40][routing]).

**D5. Did the stand-in pane fire, and does it earn its complexity?** The `batch-skills` third-attempt review/repair session trail is a concrete stand-in case, and its identical review bodies show why it is not merely a harmless retry optimization. Drop stand-in under F1; keep bounded same-seat retry and grace ([W:issues/log.jsonl:70–73][batch-fallback]; [W:batch-skills — repair brief; identifies the reviews as identical][batchfix]).

## 10. Decision order

Apply F1 first because it removes a mechanism that undermines a hard constraint. Apply F2 and F3 for smaller contracts and duplicate-free check definitions, then F4–F7 for investigation clarity and source maintenance. Handle H2/H4/H7 as narrow structural consistency work, H3 as a single-writer ownership correction, and the remaining holes as explicit evidence/recovery/delivery limits rather than new infrastructure.

Every touched rule has a keep, drop or merge verdict above. Rules not challenged here remain unchanged. No proposal adds a daemon, watcher, polling service, new execution mode or speculative configuration flag.

<!-- Immutable evidence links: audited snapshots and explicitly identified historical commits. -->

[routing]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/routing.ts#L26-L40
[state]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/state.ts#L13-L36
[state-leaves]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/state.ts#L60-L107
[next-seat]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/next.ts#L208-L214
[next-dispatch]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/next.ts#L382-L468
[next-busy]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/next.ts#L172-L205
[next-discovery]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/next.ts#L82-L143
[next-allocation]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/next.ts#L262-L356
[next-tail]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/next.ts#L471-L698
[phase-move]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/phase.ts#L19-L55
[phase-owner]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/phase.ts#L57-L94
[phase-transition]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/phase.ts#L96-L140
[phase-clean]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/phase.ts#L142-L174
[phase-lock]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/phase.ts#L176-L199
[log]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/log.ts#L8-L33
[pull]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/pull.ts#L42-L80
[source-close]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/pull.ts#L106-L207
[park]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/park.ts#L22-L85
[sync]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/sync.ts#L6-L138
[sync-guard]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/sync.ts#L6-L34
[install]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/src/install.ts#L9-L25
[plugin]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/plugin/herdr-plugin.toml#L1-L26
[machine]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/config.yaml#L1-L20
[aconfig]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/config.yaml#L1-L20
[wconfig]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/config.yaml#L1-L19
[pconfig]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/config.yaml#L1-L18
[guide-files]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/docs/guide/files.html#L59-L63
[chart]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/chart-issues/SKILL.md#L1
[questions]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/chart-issues/assets/questions.md#L1-L41
[question-full]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/chart-issues/assets/questions.md#L25-L27
[shapes]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/chart-issues/assets/shapes.md#L1
[plan-skill]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/plan-issue/SKILL.md#L1
[impl-skill]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/implement-issue/SKILL.md#L1
[template]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/implement-issue/brief-template.md#L1
[worker]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/implement-issue/worker-protocol.md#L1-L28
[check]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/check-issue/SKILL.md#L21-L51
[check-lesson]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/check-issue/SKILL.md#L37-L43
[merge]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/merge-issue/SKILL.md#L23-L47
[broadcast]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/broadcast-issue/SKILL.md#L1
[ponytail-i]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/implement-issue/ponytail.md#L1-L34
[ponytail-c]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/skills/check-issue/ponytail.md#L1-L34
[prior-verdict]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/AKROGON-AUDIT-FIXES.md#L1
[alog]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L1-L181
[wlog]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L1-L484
[plog]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/log.jsonl#L1-L18
[batchlog]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L54-L73
[batch-fallback]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L70-L73
[browserlog]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L326-L355
[pullfail]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L9-L17
[migratefail]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L335-L358
[unitfail]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L480-L484
[zeroattempt]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L246
[smallchart]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/chart/CHART.md#L1
[smallintake]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/chart/INTAKE.md#L1
[smallbrief]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/brief.md#L1
[smalldesign]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/design.md#L1
[smallplan]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/plan.md#L1
[smallimpl]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/implementation/brief.md#L1
[smallreviewa]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/review-A.md#L1
[smallreviewb]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/review-B.md#L1
[smallstate]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/state.yaml#L1
[smallcli]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/closed/status-no-open-leaves/status-empty-open-fix/implementation/cli-artifact.log#L1
[smallfork]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/chart/status-empty-open/forks/missing-open-is-zero.md#L1
[smalllog]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L158-L161
[batchdesign]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/design.md#L1
[batchplan]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/plan.md#L1
[batchposA]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/positions-A.md#L1
[batchposB]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/positions-B.md#L1
[batchrebA]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/rebuttal-A.md#L1
[batchrebB]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/rebuttal-B.md#L1
[batchrevA]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/review-A.md#L1
[batchrevB]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/review-B.md#L1
[batchimpl]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief.md#L1
[batch1]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-1.md#L1
[batch1a]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-1a.md#L1
[batch1b]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-1b.md#L1
[batch2]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-2.md#L1
[batch2a]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-2a.md#L1
[batch2b]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-2b.md#L1
[batch3]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-3.md#L1
[batchfix]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/implementation/brief-fix1.md#L1
[batchstate]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/batch-model/batch-skills/state.yaml#L1
[bigchart]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/CHART.md#L1
[mapa]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/slots/map-A.md#L1
[mapb]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/slots/map-B.md#L1
[mapmerged]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/slots/map-merged.md#L1
[mapreb]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/slots/map-rebuttal-B.md#L1
[treeb]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/slots/tree-check-B.md#L1
[treea]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/skill-lane-rebuild/chart/slots/tree-proposal-A.md#L1
[browserstate]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/browser-cdp-setup/browser-core-launch/state.yaml#L1
[browserreview]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/closed/browser-cdp-setup/browser-core-launch/review-A.md#L1
[p-bash]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/closed/tool-output-display/bash-row-renderer/state.yaml#L1
[p-log]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/closed/tool-output-display/command-log-retention/state.yaml#L1
[p-migrate]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/closed/charting-vocabulary/migrate-charts/state.yaml#L1
[p-session]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/closed/session-scoped-worker-settings/session-scoped-worker-settings/state.yaml#L1
[p-migrate-review]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/closed/charting-vocabulary/migrate-charts/review-A.md#L1
[lessons]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/LESSONS.md#L1-L16
[l-review]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/history/2026-09-10-review-by-reading.md#L1
[l-stderr]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/history/2026-09-10-stderr-json-parse.md#L1
[l-uncommitted]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/history/2026-09-11-uncommitted-handoff.md#L1
[l-lock]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/history/2026-09-11-lock-vs-criterion.md#L1
[l-docs]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/history/2026-09-11-stale-rule-in-docs.md#L1
[l-scratch]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/learnings/history/2026-09-13-akrogon-home-scratch-verify.md#L1
[old-types]: https://github.com/Tamdoma/akrogon/blob/398761c2afa453be5b383397c457c78c2066cb3a/skills/chart-issues/SKILL.md#L96-L190
[old-scope]: https://github.com/Tamdoma/akrogon/blob/398761c2afa453be5b383397c457c78c2066cb3a/skills/chart-issues/SKILL.md#L201-L315
[old-impl]: https://github.com/Tamdoma/akrogon/blob/398761c2afa453be5b383397c457c78c2066cb3a/skills/implement-issue/SKILL.md#L1
[pre-latest]: https://github.com/Tamdoma/akrogon/blob/9ab80642f1411732a48acdd9302af4f49e9f972f/skills/chart-issues/SKILL.md#L1
[metric-A-plan.rebuttal]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L16-L17
[metric-A-plan.synthesis]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L34-L35
[metric-A-implement]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L174-L175
[metric-A-check.review]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L179-L180
[metric-A-check.fix]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L29-L30
[metric-A-merge]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L180-L181
[metric-W-plan.rebuttal]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L20-L21
[metric-W-plan.synthesis]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L21-L22
[metric-W-implement]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L147-L243
[metric-W-check.review]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L168-L260
[metric-W-check.fix]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L105-L236
[metric-W-merge]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L113-L132
[metric-W-failed]: https://github.com/Tamdoma/tamdoma-framework/blob/e52b2876bf3c6f714b440253c10861fed2b7ae15/issues/log.jsonl#L335-L351
[metric-P-implement]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/log.jsonl#L5-L6
[metric-P-check.review]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/log.jsonl#L2-L3
[metric-P-check.fix]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/log.jsonl#L7-L8
[metric-P-merge]: https://github.com/Tamdoma/pi-extensions/blob/25bbe9efbc29c0ce6bb1603437b5d1aaeac9e0dd/issues/log.jsonl#L3-L4
[auditmerged]: https://github.com/Tamdoma/akrogon/blob/0147d10483aa22dd3ae1d4ca5d71c00b0a12730a/issues/log.jsonl#L178-L181
