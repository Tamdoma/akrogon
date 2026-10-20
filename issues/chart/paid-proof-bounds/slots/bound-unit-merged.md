# bound-unit merged notes

## Unit

- O1 one leaf-lifetime total of paid model sessions (B,C). Every session-start attempt counts, a failed start included (B), whether a parent, a runner's nested child, a resume, a probe or a direct `claude -p`. The seat's own working session does not count. Before a runner is launched, its maximum session fan-out for that case is charged against the total. Splitting one proof into small launches cannot dodge it, because ten one-session launches charge ten (B,C). Attempts are only allocations inside the total (C) or planning labels (B).
- O2 count runs of a named proof command, each with its fan-out written in the grant, plus a separate small line for any other paid launch (A). C rebuts: the extra line is a second allowance, and direct probes were how 2026-10-18 spend escaped named proofs; sessions must be the only ledger. B and C reject attempts as the sole unit because one attempt can grow to many nested sessions.
- Rejected (A,B,C): top-level commands only (misses nested sessions); tokens or dollars (known only after the run, reopens the counter); a universal default number (C: starves one leaf and over-allows another, and becomes the locked numeric gate). Rejected (B,C): model turns.
- Refunds: B charges the whole envelope and never refunds, even when a run stops early. Simple, but a leaf can be stopped sooner. C returns unused reserve when the runner's receipt gives an exact count (`run-satellite-live-replay.ts` logs `sessions: N`), and charges the whole reserve when the count is unreadable. B rebuts: that count covers parent SessionRecords, while forked children are separate dispatch records, so it does not prove exhaustive coverage.

## Who sets the number (A,B,C)

The door drafts the total and fan-out basis in the grant's `bounds` at charting, from the runner's phases and slots or a measured run, and from fresh-run-need 1a's eligible fresh calls, not from a debug loop. The operator approves it before the first paid call, charting probes included. The handoff review shows the total, the amount charting already used, and what remains. A plan or seat may use less, never more. If fan-out cannot be bounded, there is no grant (B,C), or first a probe-only grant (C).

## Parallel seats, no new state

- One launch owner at a time (A,B). Only the seat that owns the phase's proof launches paid runs: the door at charting, A at implement end and check.fix, B in check.repair. Review seats judge recorded evidence and never launch (A). Ownership transfers through the pass record at handoff, and only after in-flight paid work settles (B). A worker launches only an envelope the owner charged first (B).
- Allocations per seat (C). The plan gives each launch owner a reserve; parallel review seats get disjoint reserves or zero; unused reserve is released when the pass ends.
- The record (A,B,C): each pass artifact holds the grant, sessions used before, charged, launched and after. A replacement seat continues from it and never resets.

## Raising an exhausted bound (A,B,C)

One action: the operator approves the old-to-new total, and the door or the current authorized editor records it in readiness.yaml (B rebuttal), setting `bounds` to the new lifetime total and `approved` to the new approval naming the consumed count and the new total. No seat can raise its own. A resume, new commit or provider reset is not an amendment (B).

## Schema and sentences

- No `grantSchema` change; `bounds` stays text (A,B,C).
- chart-issues Take grant paragraph: define the unit once (A,B,C).
- chart-issues Handoff live-run line: total, charting use, remaining, initial launch owner (B,C); computed from the grant (A).
- shapes.md readiness template: `bounds: <limits on use>` becomes the session total, fan-out per run and counting source (B,C). shapes.md Preflight: refuse a paid grant without a total, fan-out and counting source (C).
- Reuse sentence in the four skills (already changing): add the launch-owner rule (A,B), or remaining sessions plus this attempt's reserve (C).
- implement-issue worker delegation: a worker launches paid sessions only inside a charged envelope or reserve (B,C).
- check-issue: review seats launch nothing (A); check.repair B launches within its owner role (A,B) or allocation (C).

## Evidence

- Operator 2026-10-19: "I just want to make sure that we don't spend so many tokens on these tests." Both Taken forks settle the written total and the recorded-output rule.
- Code: `src/readiness.ts` grantSchema has free-text `bounds`, `operations` and an `approved` block (A,B,C). shapes.md template says only `bounds: <limits on use>` (B,C). Framework `session-trace.ts` SessionRecord separates parent and child sessions, and `run-satellite-live-replay.ts` logs a session count (B,C).
- Practitioner, read 2026-10-19: Marius Manolachi 2026-08-18 charges retries and subagents to the parent task's work-unit budget (B). Alien Intelligence agent-budgets docs: main and subagents share one total, and choosing the wrong unit caused a regression (B). Anthropic multi-agent research post: humans set written effort per task as counts of agents and calls (A,C).
- Vendor docs: LangChain run_limit vs thread_limit, per-run vs cumulative (B). Claude Agent SDK and OpenAI Agents SDK per-loop turn caps, where child work counts to the parent (C).

## Pitfalls and what removes them

- Hidden nesting: the grant names each runner's maximum fan-out and charges it before launch; unknown fan-out is not covered (A,B,C).
- Probe, retry, resume or "diagnostic" treated as free: every start counts (A,B,C).
- Parallel seats spend the last units: one owner (A,B) or disjoint reserves (C).
- The total becomes a target: unused balance never justifies a run; fresh-run-need eligibility comes first (C).
- Sessions are not equal spend: the grant binds model pin and settings, so a costlier model needs new approval; the bound is on launches, not dollars (B,C).
- Multiple grants used to multiply totals: one paid grant per identity and operation family (C); every covered paid use draws from the one leaf total, and a new identity does not renew it without an amendment (B).
- A shared chart probe charged to many leaves: name one charging grant and link the evidence elsewhere (B).

## Open questions

- Separate subtotals per model pin (C)?
- Can each runner's fan-out actually be bounded with existing code (B)?

## Where slots differ

- Review seats (C rebuttal): initial check.review has two blind seats at once; "review seats never launch" removes their rerun authority for missing evidence. C prefers plan-set reserves, zero by default.
- A probe-only approval is starting consumption inside the leaf total, never a separate allowance (C rebuttal).

- Unit wording: sessions (B,C) vs runs with named fan-out (A).
- Sharing: one owner (A,B) vs per-seat allocations (C).
- Refunds: none (B) vs refund on exact count (C). A silent.
