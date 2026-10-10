# Slot B blind notes: proof-run Q1

Read only the brief, named intake/locks/note definition, and permitted closed briefs/lifecycle logs. No peer notes read. Evidence checked 2026-10-10 against HEAD files. A = /home/ivan/Work/infra/akrogon, F = /home/ivan/Work/infra/tamdoma/framework.

## 1. Pick, reason and cost

D1 Pick (b), kept inside the existing handoff review. Show an estimated total elapsed range for the leaf's required live proof, with the basis and planned session count/schedule. Attribute it to criteria without counting shared runs twice. One measured relevant case when safely available at charting, otherwise a reasoned range explicitly labelled unmeasured. No clock, hard budget, new state field or dispatch gate.

Reason: expensive breadth is committed when the operator accepts the criterion, before plan synthesis. A parallel runner fixes elapsed scheduling, not whether the operator knowingly accepted 13 real sessions. The intake records a rejected multi-hour run and still-missing numeric estimates despite the parallel repair (INTAKE.md:19,51-54). Put this information where scope can already be approved or narrowed, not in a new ceremony.

Cost: one concise proof-cost line in the current handoff review and its existing contract record. Measuring a new case may itself need unfinished implementation, identity/grants or human setup. Do not make that measurement a new prerequisite. Cite an existing relevant run if available, otherwise state the range's assumptions and uncertainty. Do not prescribe numbers when the evidence supports only “unknown”.

D2 Keep elapsed time separate from total session work. Parallelism can reduce operator waiting without reducing model work. Example estimate format is flexible: “12 sessions, 3 at once, roughly 20-40 minutes elapsed, unmeasured estimate based on …”. No exact wording or numeric threshold requirement. This is disclosure and judgment, not a mechanically enforced ceiling.

## 2. Rejected options

- O1 (a) Close/no rule: reject. The serial implementation detail is obsolete (INTAKE.md:52), but the operator discovered the required proof cost only during implementation (:19,25). A consumer runner patch cannot fix the missing handoff information. Historical required live sessions below show this proof form is not unique, although no second identical approval failure was established.
- O2 (c) Numeric plan rows only: reject as the sole remedy. Planning happens after the door settles breadth. The implementer can improve estimates, but numbers in an unattended plan do not establish operator agreement. Minute numbers without measurement/basis also invite false precision.
- O3 (d) Mandatory pilot session before every handoff: reject. The necessary behavior may not exist yet, the pilot may itself be costly or mutating, and a single cheap control case may understate the expensive path. Use safe available measurements as evidence, not another universal proof obligation.
- O4 (d) Enforced duration ceiling/watchdog/automatic split: reject. Foreclosed by A/issues/chart/leaf-run-stalls/CHART.md:24 and shapes.md:286. Scope approval can change the required work without creating a new execution timer.
- O5 (d) Fewer required proofs or global concurrency system: not this fork. Fewer proofs are explicitly off route in A/issues/chart/akrogon-slow-phases/CHART.md:18. Do not turn a disclosure fix into proof weakening or scheduler design.

## 3. Evidence, tier, source and date

- F1 Operator material, 2026-10-10: rejected multi-hour run, intervened to request concurrent cases and one measurement (A/issues/chart/proof-cost/INTAKE.md:19,38-39). “No new mental model upgrade” is a supplied correction. Using the existing handoff review respects it.
- F2 Primary contract, checked 2026-10-10: shapes.md:286 approves observable criteria and rejects duration-triggered splitting, but has no elapsed estimate disclosure. INTAKE.md:53 records qualitative plan sizing and missing per-case measurements. Timeout ceiling is not a run-time observation (INTAKE.md:24,48).
- F3 Measured, 2026-10-10: scanned 446 F closed brief.md files. Candidate search restricted to Done-criteria/Acceptance sections, using live-run/real-session/launchSkillSession terms. Manually checked 23 distinct leaf briefs that positively require an actual model/skill session. This is a conservative confirmed subset, at least 23/446 (5.2%), not an exhaustive live-API/browser proof count. Historical mentions, schema fields and policy statements were excluded. Clear examples: F/issues/closed/log-contract/log-facts-reader/brief.md:37; composition-contract/family-membership-resolver/brief.md:17; analytics-setup/lookup-tools-webfetch/brief.md:17; satellite-network-simplify/satellite-render/satellite-review/brief.md:43.
- F4 Measured for those same 23 slugs: scan full F/issues/log.jsonl, pair consecutive records per slug when prior.to == implement and next.from == implement, take the first observed complete implement residence per slug. All 23 matched. Median 110.19 min, range 17.83-567.68 min. 19 exceeded 60 min, nine exceeded 120 min. 21 exited to check.review, two to failed. Includes coding, proof, dispatch and waiting. Excludes later implementation retries/check.fix. It cannot estimate session runtime or prove live proof caused the delay. Examples: log-facts-reader 169.01 min (log.jsonl:1682-1716), family-membership-resolver 282.65 min (:1671-1747), satellite-review 567.68 min (:862-867), business-output-authority 17.83 min (:1963-1968). This supports giving scope-cost information, not a universal ceiling.
- F5 A scan: 174 closed brief.md files, five keyword candidates. Four are policy/eligibility descriptions, not requirements to launch live proof sessions. The remaining chart-usage-table explicitly requires one live analysis of existing sessions (A/issues/closed/chart-door-cost/chart-usage-table/brief.md:19), implement residence 36.78 min (A/issues/log.jsonl:546-550). This narrow search found no comparable positive new-model-session requirement in A. Do not call that zero live work: other forms and different wording were not exhaustively classified. A broad new universal proof workflow is unsupported.

## 4. Pitfalls and what removes each

- R1 Timeout ceiling sold as typical cost. Remove: separate measured duration, unmeasured estimate and worst-case timeout. Preserve the source and what it actually measured.
- R2 Shared live proof counted per criterion, or parallel minutes presented as lower model spend. Remove: one leaf aggregate, shared runs counted once, count/schedule stated. No invented dollars.
- R3 Estimating becomes a costly prerequisite or an invented precise number. Remove: use existing comparable evidence first, explicitly unmeasured range or unknown when no defensible measurement is available. Operator decides from uncertainty; no compulsory pilot.
- R4 “Information only” loses scope changes after handoff. Remove: bind the approved proof breadth and assumptions to the existing contract. If planning adds sessions or materially changes those assumptions, surface that change before executing the added work. The exact route for this case still needs Q2 below. Do not silently treat 8 sessions approved as 13 approved.
- R5 Disclosure accidentally becomes a duration gate or permission to skip required proof. Remove: explicitly state that estimates neither time out a leaf nor waive criteria. Only the operator can narrow the contract through the existing chart decision.
- R6 Mechanical exact-format checks obstruct real work. Remove: review whether the cost/basis/coverage is present by meaning. No required sentence, table column ordering or fixed estimate precision.

## 5. Questions the fork does not ask

- Q2 When planning discovers substantially more proof work than disclosed, must it return to the chart door before running that extra work, or merely notify the operator? The proposed (b) covers initial approval, not drift. Recommend return for a changed scope/assumption, not an automatic numeric overrun gate.
- Q3 Is a candid unknown acceptable when no safe relevant measurement or defensible range exists? Recommend yes with the reason and planned breadth, rather than invented numbers or forced prototype work.
- Q4 Does “total minutes” mean elapsed proof wall time, total session work, or both? Recommend elapsed range plus session count/schedule. Cleanup and known human waits belong in that elapsed assumption, not hidden behind the model-session number.

Recommendation: add proof-cost disclosure to the existing handoff review. Preserve required coverage and use estimates as decision evidence, not another lifecycle mechanism.
