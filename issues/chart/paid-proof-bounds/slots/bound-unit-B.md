# Slot B: bound-unit

## 1. Pick, reason and cost

**O1 — Count authorized paid proof-session start attempts, including parents, model-backed children and resumes, against one lifetime leaf total. The door proposes the ceiling; the operator approves it before the first paid operation. One launch owner at a time accounts for the shared total in existing pass artifacts. Keep `grantSchema` unchanged.**

The two Taken forks remain settled. This is a written authorization, not a runtime financial ceiling. Fresh execution still needs the fresh-run-need justification. Unused authority is not a reason to spend it.

### Unit and fan-out

One unit authorizes one new or explicitly resumed model-backed proof session. Include every separately started parent and child session, irrespective of whether it is invoked directly, inside a runner, by a worker or by a repair/review seat. A standalone paid API call used as proof also consumes one unit; calling it a probe or wrapping it in a script does not exempt it. A retry/resume consumes a new unit even if the harness reuses a session ID. Ordinary turns and compaction inside an already-running session do not create new units or replenish the allowance. This chart bounds repeated proof launches, not every token used by the implementation seats themselves.

Before launching a runner, its approved operation must state a defensible maximum session fan-out for the selected case, including nested children and its internal retry/recovery paths. Charge that whole envelope to the written total before issuing the launch. Do not count “one bun command” as one unit. The owner may launch the sessions inside that envelope concurrently; the authorization is not an instruction to serialize the pipeline.

For simplicity, keep the envelope charged after a failure or early exit rather than inventing refunds from incomplete transcripts. This is conservative authorization accounting, not a claim that every reserved session actually ran. An individual start attempt also remains charged if launch fails. Unknown or uncontrolled fan-out is not covered by a guessed number: narrow the operation with existing tools or use the settled operator-blocker route. Do not extend the runner to implement a quota under this chart.

Illustrative arithmetic, **not recommended limits**: a leaf has a ceiling of 14 starts, with two already charged for probes. A runner permits one parent plus four children, so its launch charges five and leaves seven. A later child resume charges one more. Splitting the same work into separately launched stages still charges every start; it cannot create new authority. Repeating the full runner charges another five. The operator sees both the maximum sessions per attempt and the total, as already settled in limit-mechanism.

**Accepted cost:** conservative charging can stop a leaf even when an early failure used fewer sessions than its envelope. The operator may raise the ceiling explicitly. A session can also consume many tokens without another start; the settled policy is not a dollar/token cap. Do not describe the total as one.

### Who writes and approves the number

The chart door writes the proposed operations, fan-out basis and numerical lifetime ceiling in `readiness.yaml`'s existing grant `bounds`, before the first paid charting probe. Base it on the actual case/runner and justified fresh interactions, not a universal default or the number of lifecycle phases. Mark an unmeasured assumption as such. Session estimates remain estimates.

The operator approves that concrete scope and ceiling before its first paid use. The attended handoff review confirms the same grant, the amount already charged and the remaining total. Handoff is confirmation, not the first approval when charting already spent units. The plan can name commands and triggers within that authority but cannot raise it. Source: chart-issues Take/Handoff and settled limit-mechanism Taken.

### Parallel seats without new state

Use **one launch owner at a time**, named in the existing pass record. The door owns charting probes; handoff transfers the grant, consumption evidence and ownership to the implementing seat. A phase handoff can transfer ownership to B for check.repair or the relevant later seat. A replacement session resumes that ownership and consumption; it does not get a fresh total.

Only that owner may issue fresh proof launches or delegate a specific, already-charged envelope. Other seats can continue deterministic work, inspect saved evidence and submit findings. Workers do not each receive a copy of the whole remaining allowance. If a worker needs a paid proof, the owner charges a bounded envelope before delegating it. Parallel sessions inside that envelope are permitted. Do not transfer launch ownership while earlier paid work is still in flight; settle or stop it with the existing lifecycle/run controls first.

This removes simultaneous read/subtract races without adding a shared counter or per-seat budgets. The record must identify the grant, approved ceiling, charged uses, command/operation, envelope, result/evidence and current owner. There is no mandated spelling, table or new file. Charting uses its existing proof record; usage transfers to `implementation/report.md`, and later review/repair records extend it by explicit reference. One current authoritative summary links earlier uses; it never resets or double-counts them.

### Raising exhaustion: one named action

The single action is **operator approval of a grant-ceiling amendment**, naming the leaf/grant and the old and new absolute ceilings. The door or current authorized editor records that approval/date in the existing grant provenance and changes `bounds` from N to M, preserving all charged uses. If 14 were charged and the operator approves 18 total, four become available, not eighteen. No seat can award its own increase, and “resume”, a fresh commit, a new account or a provider reset is not that amendment. Existing review/repair blocker timing remains as settled.

### Schema and sentence edits

`src/readiness.ts:grantSchema` already has approval provenance, operations, `bounds` and `stop_line`. Free text is enough for a human/agent authorization decision. Add no numeric field, reservation file, state key, counter or parsing rule. A schema would validate syntax, not actual nested spending.

- **T15 — chart-issues, Take, grant paragraph (`SKILL.md:63`).** In the already-settled replacement paragraph, define the unit above and require the door's proposed lifetime ceiling and operation fan-out before the first paid proof. State that only an operator-approved amendment changes the ceiling. Keep one definition here rather than copying arithmetic into every seat skill.
- **T16 — chart-issues, Handoff (`SKILL.md:71`).** Make the settled worst-case line show the ceiling, charting use already charged, remaining authority and initial launch owner. Preserve the informational elapsed-time estimate. Do not write “one more pass” when a pass contains many starts.
- **T17 — shapes.md, Leaf files / `### readiness.yaml` (`:307`).** Replace `bounds: <limits on use>` with `bounds: <lifetime paid proof-session-start ceiling, covered operations and maximum nested fan-out, accounting/ownership rule, and any other use bounds>`. Add one short note pointing to the canonical grant rule, not a second implementation. Keep `proofs[].limits` epistemic and unused arrays empty.
- **T18 — reuse sentence in plan-issue Shared context:35, implement-issue Shared context:53, check-issue Shared context:35 and merge-issue Shared context:33.** Extend the replacement already settled in limit-mechanism with: “Only the recorded launch owner issues or delegates paid proof launches, charging the full approved envelope in the existing pass record before launch; handoff transfers that record and remaining authority.” Use the same meaning at each site. Do not repeat the unit definition, add per-phase allowances or duplicate the stop rule in every retry paragraph.

**Deletion:** remove the old unrestricted reuse/mutation-only wording at those sites as already Taken, replace vague per-pass/attempt language in future grant drafts with the one session-start total, and replace the uninformative `bounds` placeholder. Delete no runtime code or current record. Add no generic quota service, new readiness section or standard numeric default.

## 2. Rejected options

- **O2 — Count attempts of a named proof only.** Reject as the sole bound. One “attempt” can grow from a small probe to dozens of nested sessions; relabelling/splitting proofs also makes comparison unstable. Named proof attempts remain useful planning labels, with explicit session fan-out, not the accounting unit.
- **O3 — Count top-level commands or unique session IDs.** Reject. One runner can start many parents/children, and resume can reuse an ID. `framework/.claude/workflow/scripts/lib/session-trace.ts:SessionRecord` records a parent session and child dispatches separately; counting only its parent `session_id` loses the fan-out.
- **O4 — Count model turns, tokens or dollars manually as the binding total.** Reject for this chart. Opaque CLI sessions make a reliable pre-call check of internal turns impractical without runtime cooperation. Tokens/dollars also vary in reporting and billing semantics. These may inform the estimate, but choosing them as an enforced ceiling would reopen settled mechanism work.
- **O5 — Give each parallel seat the full allowance, or silently reset it each phase.** Reject. This multiplies authorization. Fixed per-seat slices can conserve a total, but require allocation/reallocation machinery in prose and can strand authority in idle seats. A single current owner is simpler while still allowing an authorized runner's parallel fan-out.
- **O6 — Add a numeric schema and runtime consumption state.** Reject under limit-mechanism Taken. It neither discovers hidden session launches nor replaces the operator's scope judgment. The existing text field and pass records express the chosen contract.

## 3. Evidence, tier, source and date

Read date for outside research: **2026-10-19**.

- **E13 — Operator tier.** limit-mechanism Taken fixes one written lifetime total, all seats/probes/retries, no new counter/schema/state, no native/provider cap. Fresh-run-need Taken fixes recorded-output reuse and the blocker for unjustified/uncovered fresh calls. The present brief asks this fork to settle counting/ownership, not reopen those choices.
- **E14 — Named practitioner guidance.** Marius Manolachi, “How to Set a Budget for an AI Agent”, published 2026-08-18, recommends a work-unit budget, charging retries/subagents to their parent task and keeping run totals rather than treating each child as fresh money. He advocates external enforcement; this chart deliberately retains its weaker written rule under the operator's lock. This is a commercial practitioner's field note, not a measured case study proving these exact session units. [Source](https://mariusmanolachi.com/blog/how-to-set-a-budget-for-an-ai-agent).
- **E15 — First-party implementation/practitioner documentation.** Alien Intelligence's Agent Run Budgets distinguishes whole-run volume from per-agent depth and concurrency; main-agent and subagent activity share one total. It also documents a regression caused by choosing graph steps rather than the work unit actually intended. This supports explicit units and aggregation. Its actual counters, concurrency gates and degraded-success behavior are not proposed here. [Source](https://docs.alien.club/docs/workflows/agent-budgets).
- **E16 — Primary documentation.** LangChain distinguishes per-invocation `run_limit` from cumulative `thread_limit` across runs. That demonstrates why a retry/session-local allowance does not provide a task-lifetime allowance. Its limits count model calls and use middleware/checkpointing; my session-start unit is an adaptation to akrogon's existing CLI proof workflow, not a claim of equivalent enforcement. [Source](https://docs.langchain.com/oss/python/langchain/middleware/built-in#model-call-limit).
- **E17 — Inspected source, better-than-training tier.** `src/readiness.ts:grantSchema/readinessSchema/gaps` provides textual grant bounds without consumption accounting. `skills/chart-issues/assets/shapes.md:253-330` already places approval and `bounds` in readiness. The four cited reuse sentences already make the pass artifact the record. Framework `session-trace.ts:SessionRecord/SkillDispatchRecord/launchSkillSessionAsync` distinguishes parent sessions from forked child transcripts. That helps audit usage but does not prove every nested launch is exhaustively captured.

Searches run: LangChain per-task model-call limit, run/thread limits, practitioner agent budgets/subagent costs, shared agent budgets. The sources support aggregate authority and stable units, not a universal numerical ceiling. No paid baseline/probe was run. No savings or exhaustive fan-out measurement is claimed.

## 4. Pitfalls and what removes each

- **R23 — Hidden nesting spends many units inside one command.** The approved operation names its maximum transitive fan-out and internal retry paths; charge the whole envelope before launch. An unsupported/unknown envelope is not covered. A disobedient runner remains the accepted limit-mechanism risk, not something free-text arithmetic prevents.
- **R24 — Resume, retry, probe or “diagnostic” is treated as free.** Count start attempts by operation, including resumes even with the same session ID. The purpose label and failure exit do not refund authority.
- **R25 — Parallel seats both spend the last units.** One launch owner issues/delegates charged envelopes; transfer only after in-flight paid work settles. Do not impose serial model sessions inside an already-covered runner.
- **R26 — A replacement seat reconstructs a convenient balance.** Preserve charged uses and the grant reference in authoritative artifacts; missing/ambiguous prior consumption takes the already-settled blocker. Do not estimate a lower historical balance from partial transcripts.
- **R27 — A failed run is refunded and retried forever.** Keep its envelope charged. Any increase is the named operator ceiling amendment, not a session's judgment that the failed work “didn't count”.
- **R28 — An approved probe is charged again at leaf handoff.** Transfer the same dated use record and link it once. A handoff copies authority/evidence, not a new use or a new allowance.
- **R29 — One permitted session burns a large token volume.** State the limitation honestly: this is a launch-volume authorization. Keep model/configuration/operation scope fixed in the grant and use recorded-output reuse. Do not claim a token/dollar ceiling or sneak in the rejected native cap.

## 5. Questions the fork does not yet ask

- **Q19 — Can each proposed proof runner's maximum nested fan-out actually be established with existing code and evidence?** If not, no numerical session total covers it merely because the door wrote one. This may narrow the proof operation or require a specific operator decision; it is not permission to build stage resume.
- **Q20 — Are there shared chart probes serving more than one leaf?** One existing paid use must not acquire fresh authority by being copied into each leaf. Name the charging grant before the shared probe and link its evidence into consumers without charging or authorizing it again.
- **Q21 — Does the operator accept conservative, nonrefundable envelopes?** This removes disputed refunds and incomplete child-count recovery, but can require earlier amendments than actual session usage alone. It is the explicit cost of O1, not hidden accounting precision.

Only this return file was written. No paid session, runtime code, grant or lifecycle state was changed.
