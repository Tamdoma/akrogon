# Territory map: grant-run-count, slot B

Independent opening map. No implementation or execution plan. Paths below are relative to `/home/ivan/Work/infra/akrogon` unless marked framework. Framework means `/home/ivan/Work/infra/tamdoma/framework`.

## Inspected ground

- **F1. Failed proof is still paid usage.** Framework `issues/closed/about-titles/fixture-weave-recorder/readiness.yaml`, `grants[2]`, allows one known-good recorder run and one rerun. Its `implementation/report.md`, “Initial paid run,” reports “1 run + 1 rerun” while describing a metadata failure after verify acceptance and an envelope failure after a batch. The first paid stage cannot disappear from the count because a later stage fails. `review-B.md`, “Renewed invocation 1” and “Renewed invocation 2,” gives the useful counterexample: B carries one consumed invocation forward, records sessions, then records both consumed and makes no third invocation.
- **F2. The archived evidence changes one intake detail.** The five cited logs are members of framework `issues/closed/about-titles/evidence.tar.zst`, under `fixture-weave-recorder/implementation/`; direct files and `akrogon log` on the closed leaf path were unavailable. Inspected all five log tails and the first log's preceding content. `check-record-1793743005800-1125943.log` says verify accepted with one session before metadata writing fails. `...3020857-1133654.log` is now nonempty and shows a dirty-worktree refusal while constructing the consumer. `...3151914-1137290.log` rejects out-of-scope repair units. `...3268062-1146760.log` rejects the batch repair envelope. `...3365971-1153842.log` records success with one session. The report itself acknowledges a batch before the envelope failure. **Low confidence:** exact total sessions, charges, and paid activity in the out-of-scope repair attempt. Do not turn the five wrapper invocations into five proven paid invocations or claim an exact total from this evidence.
- **F3. Existing command evidence cannot supply a grant counter.** `src/run-check.ts`, `runCheck` and `checkedRun`, records caller-selected check names, run UUIDs, start/end timing, exit status and log paths. It retains capture pairs while commands run, then publishes combined logs. It records neither a grant reference nor nested paid-session totals. A check label is not an operation identity, and one check can launch several sessions. `src/readiness.ts`, `grantSchema`, has free-text `bounds`, no grant ID and no consumption field. The lock leaves these mechanisms alone.
- **F4. The duplicated rule is wider than the three named execution skills.** `skills/plan-issue/SKILL.md`, “Shared context,” contains the same compare-before-operation and outside-grant stop rule as implement, check and merge. `skills/chart-issues/SKILL.md`, “Take,” already covers nested paid calls and repeat/recovery bounds. `skills/chart-issues/assets/shapes.md`, “readiness.yaml,” only prompts for “limits on use” and a “never-cross condition.” Neither asks what a run means or what usage precedes handoff.
- **F5. The durable surfaces survive the terminal move.** `issues/chart/herdr-app/INTAKE.md`, “What I want,” “Where akrogon touches herdr today,” and “How I picture it,” calls for removing terminal coordination machinery while preserving artifact-based briefs and consultant returns. `~/.config/herdr-app/AGENTS.md`, “Two programs,” distinguishes the app from core `hc`. Grant prose and existing pass artifacts need no terminal-specific dependency. This is an inferred fit with lock 6a, not a settled port design.

## Material forks

### K1. What consumes the allowance?

- **K1a. Every top-level recorder invocation counts.** Simple to count before launch and robust against missing receipts. It also consumes allowance for a dirty-worktree refusal before any paid work and still needs a separate session count when the grant limits nested sessions.
- **K1b. A named unit with a named consumption boundary counts, regardless of final outcome. Recommended.** New grants distinguish recorder invocation, paid session and any other explicitly bounded quantity. A paid-reaching invocation stays consumed after failure, timeout, cleanup or unusable output. A proven pre-paid refusal can remain unconsumed when the grant uses that boundary. Unknown activity stays unknown, rather than becoming zero. This matches B's later grant but requires preserving stage evidence before scratch cleanup.

Ground: F1–F3 and framework `readiness.yaml`, `grants[3]` and `grants[4]`, which explicitly count every invocation reaching a paid session and separately limit sessions per invocation. A success count alone is already contradicted by the incident, not a viable third option.

### K2. Who owns the cumulative count across seats and restarts?

- **K2a. Each launching seat reconstructs one cumulative grant history from existing pass artifacts.** Handles retries, check.fix and merge without a new ledger file. Two simultaneous seats can both read the same remaining allowance and understate projected use unless an owner orders launches.
- **K2b. The grant gives launching seats disjoint allowances or one launch owner, with prior use carried in existing artifacts. Recommended where sharing is possible.** Avoids competing claims to the same remaining run without locks or command changes. It can strand unused allowance in another seat's allocation. Reallocating it must be explicit, not an implicit reset.

In either option, a new pass, renamed check, changed commit or terminal restart does not renew approval. The chart's paid proof counts when covered by that same grant. A renewal must identify what allowance it replaces or adds and which wider chart totals continue.

Ground: `skills/chart-issues/SKILL.md`, “Take”; framework `readiness.yaml`, `grants[0]` (charting usage), `grants[1]` (chart session/spend totals), and later renewals; `review-B.md`, “Remaining operator action and disposition” and “Renewed invocation 1.”

### K3. Where does an overrun warning reach a reader?

- **K3a. Record it only in the final pass report.** Existing reviewers can audit it, but the operator learns after spending and a crashed pass may never produce the report. This repeats the present workaround's weakness.
- **K3b. Warn in the seat's visible response before the excess launch and persist the same event in its existing pass artifact. Recommended.** The warning identifies the grant, approved quantity, consumed or unknown usage, proposed launch and projected overrun. The closing report carries the cumulative result, and the next seat reconciles it against evidence. This needs no notification command or approval wait. A visible warning still does not prove an unattended operator read it.

Ground: `issues/chart/round-drawings/forks/signposts.md`, “Taken,” 2b; implement/check/merge “Shared context” grant paragraphs, which already name pass artifacts; framework `implementation/report.md`, “Initial paid run,” and `review-B.md`, “Verification and report assessment.” Warning permission must remain effective even if no operator responds.

### K4. Which bounds become warning-only?

- **K4a. Only the approved paid-run repeat allowance gets the warning exception. Recommended unless the operator chooses wider scope.** Operation, identity, account, target, effects, expiry and explicit human-only conditions retain their stops. Nested session usage is still counted and shown, but the contract must say whether exceeding it is the same permitted paid-run overrun.
- **K4b. All quantitative paid-use bounds get the exception, including nested session totals and spend caps.** One policy handles compound grants, but it also converts a dollar cap into advice. Unknown charges make the warning less precise. Lock 2b names a paid run, so this broader interpretation is **low confidence** and needs a fork answer, not an implementer's guess.

Ground: framework `readiness.yaml`, `grants[1]` and `grants[2]`, combines per-run sessions, chart totals, spend caps and explicit stops; chart “Take” distinguishes larger effects, expiry and scope changes. Lock 4a permits the same accounting method across the family. It does not clearly grant permission to exceed every kind of bound.

## Conflicts with locked direction

- **C1. Blanket outside-grant stops conflict with 2b.** Implement, check, merge and plan “Shared context” all say “within their bounds,” “never widens it,” and treat anything outside the grant as an operator blocker. Leaving those clauses unqualified would still forbid the chosen warning-only overrun.
- **C2. Fresh-call rules can preserve the same contradiction.** `skills/chart-issues/assets/standing-design.md`, “Standing design lines,” recorded-output rule, permits a fresh call only under a covering grant and otherwise stops. The policy must distinguish an allowed repetition overrun of an otherwise covering grant from a genuinely uncovered operation. The existing reasons requiring fresh evidence remain intact.
- **C3. New grant text must not contradict itself.** Chart “Take” asks for repeat/recovery bounds and new approval for larger effects. The readiness example's `stop_line` says “never-cross.” Repeating a warning-only paid count as a hard human stop recreates the ambiguity. Old grants are evidence only under 5a, not migration targets.

## Practitioner questions

- **Q1.** If one recorder launches a batch, a repair and a judgment, which allowances does that consume, and does a post-session metadata error change any count? Ground: K1 and framework report “Initial paid run.”
- **Q2.** What usage does a replacement seat inherit, and does a renewed leaf grant reset a chart-wide cap? Ground: K2 and framework grants' mixed leaf/chart lifetimes.
- **Q3.** If cleanup deletes receipts or a killed capture never gets an end record, what can the next seat honestly claim about remaining use? Ground: `run-check.ts`, `checkedRun`; framework review “Renewed invocation 1,” which recovered session IDs from transcripts after receipts were removed.
- **Q4.** Does warning permission cover a third recorder invocation that would also cross a session or dollar ceiling, or an explicit stop after the second failure? Ground: K4 and framework grants' `bounds`/`stop_line` pairs.

## Lifetime pitfalls

- **R1. Report summaries overwrite failed history.** Preserve individual attempts and evidence references in existing artifacts before summarizing totals. The report's “1 run + 1 rerun” is the concrete failure, F1.
- **R2. Unknown becomes free.** Missing logs, receipts or paid-stage visibility cannot establish zero. Keep uncertainty visible in the next count and warning. Ground: F2 and Q3. No recovery tool or provider call is implied.
- **R3. Label changes, role changes or renewals reset counts by accident.** Tie usage to the recorded approval and scope, carry prior use across passes, and state renewal effects. Ground: F3 and K2. No new grant-ID schema is necessary to reference an existing readiness entry and approval provenance.
- **R4. One corrected skill leaves another stop path unchanged.** Cover all four grant-using lifecycle skills and the recorded-output interaction together. Ground: F4 and C1–C2. Workers' targeted commands can also launch nested paid work; their use must remain in the launching owner's count, rather than becoming an uncounted allowance.
- **R5. Policy is mistaken for enforcement or guaranteed attention.** Written arithmetic can still be wrong and an unattended warning can go unread. Keep those limits explicit. Ground: signposts “Taken,” 1c/2b, and K3. Do not promise refusal, automatic counting or operator acknowledgment.

## Proposed split

- **S1. One cohesive text-only leaf for grant usage and warnings.** Territory: implement/check/merge/plan “Shared context”; chart “Take” grant wording and readiness example; standing-design's covering-grant interaction only where needed to resolve C2. The outcome is one consistent account of consumption, continuity and warning readers. These are one contract and need no separate engine or schema leaf. Exact text and ownership wait for the forks.
- **S2. Keep proof coverage with `proof-coverage/coverage-audit`.** Its brief, “What” and “Done-criteria,” already owns observation of pre-existing promises, proof limits, the chart's one approved paid test and narrowing at handoff. This chart owns accounting for that test if it shares a grant, not whether it proves the promise. Shared chart files alone do not create a prerequisite. A final combined read must avoid contradictory grant and proof rules.
- **S3. Exclude migration and terminal work.** No edits to old grants, no `src/readiness.ts` or `src/run-check.ts` changes, no receipts parser, new ledger, refusal, notification integration or terminal coordination. Those add parts or contradict the locks. New grants carry the clearer contract when the changed skills are released and loaded.
