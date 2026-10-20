# Blind notes: bound-unit (slot C)

## 1. Pick, reason, and cost

**Pick: the governing unit is one leaf-lifetime total of paid model sessions. Attempts are allocations inside that total, not a second allowance.**

For a paid model grant, `bounds` says, in free text:

1. **Total paid sessions for this leaf's whole life.**
2. **How that total is allocated:** each named proof/operation, how many attempts it may make, and the maximum sessions reserved for one attempt.
3. **What counts and where the count is read:** one separately launched top-level model session or provider agent run counts once, whether launched directly, by a runner, or inside another launched process. A `claude -p` probe, a batch-slot session, and a runner's nested session all count. The seat's own lifecycle model session does not; this bounds paid proof/product launches, not the seat doing the work.
4. **The model pin/settings each allocation covers**, so cheap sessions cannot silently be swapped for expensive ones.

An attempt is one start-to-stop execution of a named proof/operation. Before an attempt starts, the seat reserves its maximum session count; it does not start unless the remaining total covers the reserve. Every started session is charged, including failed, killed, partial, and probe sessions. If the counting source gives an exact consumed count, unlaunched reserve returns for later sequential use. If consumption cannot be observed, the full reserve stays charged, and if the fan-out could not be bounded before launch, later use takes the settled unknown-use stop.

This cannot be dodged by splitting: ten one-session stage launches consume ten, same as one ten-session runner attempt. It also covers fan-out: an attempt is not counted as one merely because one shell command started it.

Example shape, not a schema:

```yaml
bounds: "40 paid sessions leaf lifetime. Count runner receipt sessions[] plus direct claude -p launches. Door probe <=2; replay proof <=2 attempts x <=17 sessions; repair may use recorded unused sessions. Every started session counts."
```

**Who writes the number:** the door drafts the arithmetic at charting; the operator approves it before the first covered call and confirms the final total at handoff. The planner and seats may allocate or reduce inside it but never raise it. There is no akrogon-wide default number. The door derives sessions per attempt from the runner's phases/batch slots or a measured prior run, and the number of attempts from the settled fresh-run rule, not from an assumed debug loop. Charting probes are charged to the same total, and handoff shows total, charting use already consumed, and remaining sessions. If fan-out cannot be bounded from the runner or a measured run, the operator must first approve a probe-only grant, then approve the leaf total before handoff; an unbounded fan-out gets no grant.

**Parallel sharing with no new state:** use allocations and the pass artifacts that already exist.

- The plan assigns each proof attempt a named launch owner and reserve. Implement workers receive a reserve only in their sub-brief; A's criterion proof stays A's, as implement-issue already provides.
- Blind parallel review seats get disjoint reserves or zero. Neither may borrow the other's during that phase.
- Every artifact records grant reference, sessions used before, reserved, actually launched, and total after. Sequential seats (check.repair, check.fix, merge) read the earlier artifacts and use only released remainder.
- A seat/pass with no allocation has zero paid launches. Unused parallel reserve becomes available only after that pass ends and records actual use.

**Raising an exhausted bound:** one named action — the operator amends that grant in the registered checkout's `<leaf>/readiness.yaml`, replacing `bounds` with the new lifetime total and replacing `approved` with the new approval (`by`, `date`, and an `answer` naming the verified consumed count and the new total). No second grant for the same operation, no per-pass exception, and no seat edit that widens its own allowance. The blocker artifact supplies the consumed count and the added attempt being requested. In review this stays under Operator actions per the settled limit-mechanism decision.

**Schema:** no change. `grantSchema.bounds` is already required non-empty text (`src/readiness.ts`, `grantSchema`), and `operations` can name the runner and counting source. A numeric field would invite a code consumer the settled fork rejected and still could not express attempt reserves, model classes, counting sources, or charting consumption.

Sentence changes:

- `chart-issues/SKILL.md`, `## Take` grant paragraph: for paid model grants, replace generic "repeat and recovery bounds" with the unit definition above: one leaf-lifetime session total, allocation by named attempts, counting source, charting probes included, every started session charged. (The same edit carries the settled deletion of "live-change", "before the first mutating proof", and unlimited reuse.)
- `chart-issues/SKILL.md`, `## Handoff`: the live-run line's session count becomes the grant arithmetic: sessions per attempt × permitted attempts, charting sessions already consumed, and remaining total. The line's time estimate stays information-only; the grant total is the approved bound.
- `skills/chart-issues/assets/shapes.md`, `### readiness.yaml`: replace `bounds: <limits on use>` for a paid model grant with `<leaf-lifetime paid-session total; allocation by named attempt; max sessions per attempt; counting source>`. In `## Preflight and validation`, refuse a paid grant whose bounds lacks a numeric session total, an allocation, or a counting source; do not add this prose check to code.
- `plan-issue/SKILL.md`, plan synthesis: the criterion map allocates the grant total to named launch owners and reserves and records charting consumption as the starting balance; the plan cannot raise the total.
- Reuse sentence in `plan-issue`, `implement-issue`, `check-issue`, and `merge-issue`: comparing operation/target/identity gains remaining sessions and this attempt's reserve; the artifact record gains sessions before/reserved/launched/after.
- `implement-issue/SKILL.md`, worker delegation sentence: a worker makes a paid launch only inside the reserve named in its sub-brief and returns the actual launched count.
- `check-issue/SKILL.md`, `## check.repair`: B launches only within its recorded allocation/released remainder. Exhaustion follows the settled Operator actions path.

Deleted: free-form paid bounds such as "some reruns" or "reasonable repeats," replaced by the session-total form; and any per-pass or per-seat reset reading of `bounds`. No state field, schema field, counter, or code is added.

Cost: a session is a count proxy, not a token or dollar guarantee. One long Opus session can cost far more than one short probe. The grant narrows that gap by binding operation, model/settings, counting source, and sessions per attempt, while the handoff estimate still shows elapsed/worst-case information.

## 2. Rejected options, each with reason

- **Attempts only.** One whole-replay attempt can fan out to an unbounded number of nested sessions, and a seat can enlarge batches inside one "attempt." It counts the wrapper.
- **Top-level launches only.** Splitting is captured, but a runner's internal sessions — where the 2026-10-18 spend lived — disappear inside one shell command.
- **Model turns or tool calls as the grant unit.** Closer to work inside one session, and agent frameworks do expose turn caps, but the settled mechanism is written prose with no native cap. Framework session records do not give a provider-neutral turn count a seat can reserve before launch, and turns vary hugely in context size.
- **Tokens or dollars.** These are what the operator ultimately cares about, but they are known only after the run, are estimates on subscription identities, and would reopen the rejected numeric enforcement. They also cannot be reserved honestly before launch.
- **A universal default (for example 25 sessions per leaf).** A proof's fan-out is leaf-specific. One number either starves a legitimate whole-run leaf or gives a one-session proof a large debug allowance, and becomes the generic numeric gate the locks reject.
- **Door, planner, or seat sets the number alone.** The spender would set its own allowance. The door proposes arithmetic; grant approval is the operator's existing control point.
- **Separate totals per seat or pass.** Parallel seats multiply it and every pass renews it, directly contradicting the settled one-lifetime total.
- **Structured numeric schema fields.** No code may consume them under the settled fork. They add migration and multiple fields for allocations that remain text anyway.

## 3. Evidence, with tier, source, and date

- **Operator tier.** "I just want to make sure that we don't spend so many tokens on these tests" (2026-10-19, brief Carries). Settled limit-mechanism 1a: written grant, one total for the leaf's whole life, no counter/schema/state; settled fresh-run-need 1a: fresh only on model-facing change, missing/unreliable recording, or a whole-run property.
- **Primary local code/text, read 2026-10-19.** `src/readiness.ts` `grantSchema`: `bounds` and `stop_line` are free text; nothing consumes them, so free text is sufficient for a prose mechanism. `shapes.md` readiness template currently says only `bounds: <limits on use>`. Chart `## Take` already requires operations including transitive helpers, billing effects, and repeat/recovery bounds (`chart-issues/SKILL.md`, Take grant paragraph); `## Handoff` already requires a session count per live criterion. Implement workers already receive only targeted commands and never A's criterion proof runs (`implement-issue/SKILL.md`, implement section), which makes named allocation feasible without new coordination state.
- **Framework counting source exists.** The satellite replay records first-class `SessionRecord`s and logs `sessions: <sessions.length>` (`framework/.claude/workflow/scripts/run-satellite-live-replay.ts`, `runReplay`; `lib/session-trace.ts`, `SessionRecord`, `launchSkillSessionAsync`). A session total is therefore auditable from runner receipts/logs, not invented bookkeeping.
- **Primary vendor documentation, read 2026-10-19.** Anthropic Claude Agent SDK, "How the agent loop works," https://code.claude.com/docs/en/agent-sdk/agent-loop — per-task controls are expressed as max tool-use turns or a max estimated budget for one agent loop, and subagent spend counts toward the parent cap. OpenAI Agents SDK, "Running agents," https://openai.github.io/openai-agents-python/running_agents/ — one run carries `max_turns`, exceeded with `MaxTurnsExceeded`. These are enforced per-loop controls, which the settled fork excludes; the transferable part is the accounting lesson that child work counts toward the parent task total.
- **Practitioner tier, read 2026-10-19.** Anthropic Engineering, "How we built our multi-agent research system," https://www.anthropic.com/engineering/multi-agent-research-system — human-set written effort scales allocate agents and tool calls by task complexity (simple: 1 agent/3–10 calls; complex: 10+ subagents). That supports door-proposed, operator-approved per-leaf arithmetic rather than one universal number. LangGraph's `recursion_limit` config similarly bounds supersteps for one graph run, https://docs.langchain.com/oss/python/langgraph/graph-api — again per-run, not a lifetime total.

## 4. Pitfalls, with what removes each

- **P1. Fan-out is dynamic and unknowable before launch.** A model may spawn more batch slots or sub-sessions than the plan estimated. Removed by reserving the runner's bounded maximum and refusing a grant when no maximum can be derived; if actual use still cannot be read afterward, the full reserve stays charged or the settled unknown-use stop applies.
- **P2. Sessions are not equal spend.** Long-context Opus sessions and one-line probes both count one. Removed partly by allocation lines binding proof, model pin, and settings; changing to a more expensive model is a larger effect needing new approval. The residual is accepted: this is a launch bound, not a provider spend ceiling (settled 2a keeps no hard provider stop now).
- **P3. Parallel seats race on one pool.** Blind reviewers cannot see each other's current artifacts. Removed by disjoint preallocations and a zero default; unused reserve returns only after the owning pass records actual use.
- **P4. The total becomes a target.** An unused balance does not justify another fresh run. Removed by keeping fresh-run eligibility as the first gate: a launch must be both eligible under the recorded-output rule and inside an allocation.
- **P5. Charting probes vanish from the leaf's arithmetic.** Removed by approving the grant before the first covered probe and carrying "charting consumed N, remaining M" through handoff into the plan's starting balance.
- **P6. Multiple grants become a dodge.** Splitting the same paid operation across grant entries could multiply totals. Removed at the shapes audit: one paid grant per provider identity/operation family owns the total; a genuinely different identity gets its own operator-approved total and no transfers between grants.
- **P7. A killed run has no receipt to count.** Removed by charging at start: sessions known launched count individually; an incomplete attempt with unreadable count charges its whole reserve. A stopped run can therefore waste reserve but cannot create free launches.

## 5. Questions this fork does not ask

- Q-C1. For a leaf using two model classes with very different costs (for example an Opus research session and many small Sonnet slots), does the operator want separate session subtotals per model pin inside bounds, or is naming sessions per attempt with its model settings enough? My text permits the first but does not require it.
- Q-C2. When the operator raises a bound, may the same readiness amendment also move sessions between allocations (for example unused implement reserve to repair) without changing the total, or should allocation moves be free for sequential seats as long as cumulative artifacts prove the total? My pick allows sequential release automatically; the raise action is only for a larger total.
